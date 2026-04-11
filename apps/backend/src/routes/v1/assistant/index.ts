import google from '@backend/lib/ai';
import { authMacro } from '@backend/lib/auth';
import prisma from '@database';
import {
  AssistantModelMessage,
  streamText,
  SystemModelMessage,
  ToolModelMessage,
  UserModelMessage,
} from 'ai';
import Elysia from 'elysia';
import model, { SenderToRole } from './model';
import { InterceptPrismaError, ErrorReferences } from '@backend/lib/error';
import { v7 } from 'uuid';
import globals from '@/globals';
import tr from '@/i18n/tr';
import { Prisma } from '@database/prisma';
import { GoogleGenerativeAIProviderOptions } from '@ai-sdk/google';
import { generateTitle } from './service';
import redis, { addBasketKey, deleteBasket } from '@backend/lib/redis';

export type AISDKMessage =
  | SystemModelMessage
  | UserModelMessage
  | AssistantModelMessage
  | ToolModelMessage;

export default new Elysia()
  .use(authMacro)
  .use(globals)
  .use(model)
  .get(
    '/chat',
    async ({ session, query }) => {
      const cacheKey = `assistant:${session.userId}:chats:p${query.page}:m${query.max}`;
      const cached = await redis.get(cacheKey);

      if (cached) {
        return JSON.parse(cached);
      }

      const transaction = await Promise.all([
        prisma.chat.findMany({
          take: query.max,
          skip: query.max * query.page,
          orderBy: {
            id: 'desc',
          },
          where: {
            issuerId: session.userId,
          },
        }),
        prisma.chat.count({
          where: {
            issuerId: session.userId,
          },
        }),
      ]).catch(InterceptPrismaError);

      const [chats, count] = transaction;

      const response = {
        data: chats,
        meta: {
          max: query.max,
          page: query.page,
          total: count,
        },
      };

      const ttl = 30000;
      await redis.set(cacheKey, JSON.stringify(response), 'PX', ttl);
      const basket = `user:${session.userId}:caches:chats`;
      await addBasketKey(basket, cacheKey);

      return response;
    },
    {
      auth: true,
      detail: {
        summary: 'List chats',
        description:
          "Retrieve a paginated list of the authenticated user's chats.",
        tags: ['Assistant', 'Chat'],
        security: [{ CookieAuth: [] }],
      },
      query: 'paginationQuery',
      response: { ...ErrorReferences, 200: 'chatPaginated' },
    }
  )
  .get(
    '/chat/:id',
    async ({ session, params, status }) => {
      const cached = await redis.get(
        `assistant:${session.userId}:chat:${params.id}`
      );
      if (cached) return JSON.parse(cached);

      const chat = await prisma.chat
        .findFirst({ where: { id: params.id, issuerId: session.userId } })
        .catch(InterceptPrismaError);

      if (!chat) return status(404, tr.error.assistant.notFound);

      await redis.set(
        `assistant:${session.userId}:chat:${params.id}`,
        JSON.stringify(chat),
        'PX',
        30000
      );

      return chat;
    },
    {
      auth: true,
      detail: {
        summary: 'Get chat',
        description:
          'Retrieve a single chat by ID (must belong to the authenticated user).',
        tags: ['Assistant', 'Chat'],
        security: [{ CookieAuth: [] }],
      },
      response: { ...ErrorReferences, 200: 'chat' },
    }
  )
  .get(
    '/chat/:id/message',
    async ({ session, params, query }) => {
      const PAGE_SIZE = 10;

      const cacheKey = `assistant:chat:${params.id}:msgs:cur:${query.cursor ?? 'first'}`;
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);

      const messagesQuery: Prisma.MessageFindManyArgs = {
        orderBy: { id: 'desc' },
        take: PAGE_SIZE,
        where: {
          chat: {
            id: params.id,
            issuerId: session.userId,
          },
        },
        cursor: query.cursor ? { id: query.cursor } : undefined,
        skip: query.cursor ? 1 : 0,
      };

      const messages = await prisma.message
        .findMany(messagesQuery)
        .catch(InterceptPrismaError);

      const nextCursor =
        messages.length === PAGE_SIZE
          ? messages[messages.length - 1].id
          : undefined;

      const response = {
        data: messages,
        meta: {
          cursor: query.cursor,
          nextCursor,
          cursorLength: PAGE_SIZE,
        },
      };

      const ttl = query.cursor ? 30000 : 60000;
      await redis.set(cacheKey, JSON.stringify(response), 'PX', ttl);

      const basket = `user:${session.userId}:caches:chat:${params.id}:messages`;
      await addBasketKey(basket, cacheKey);

      return response;
    },
    {
      auth: true,
      detail: {
        summary: 'List chat messages',
        description:
          'List messages for a chat using cursor-based pagination (newest first).',
        tags: ['Assistant', 'Chat'],
        security: [{ CookieAuth: [] }],
      },
      query: 'cursorPaginationQuery',
      response: {
        ...ErrorReferences,
        200: 'messageCursorPaginated',
      },
    }
  )
  .post(
    '/chat',
    async function ({ session, status }) {
      const chat = await prisma.chat
        .create({
          data: {
            name: 'Yeni Sohbet',
            issuerId: session.userId,
          },
        })
        .catch(InterceptPrismaError);

      const basket = `user:${session.userId}:caches:chats`;
      await deleteBasket(basket);

      return status(201, chat);
    },
    {
      auth: true,
      detail: {
        summary: 'Create chat',
        description: 'Create a new chat for the authenticated user.',
        tags: ['Assistant', 'Chat'],
        security: [{ CookieAuth: [] }],
      },
      response: {
        ...ErrorReferences,
        201: 'chat',
      },
    }
  )
  .post(
    '/chat/:id/message',
    async function ({ params, session, status, body, set }) {
      const AI_MAX_MESSAGE_PAGE_SIZE = 40;

      const chat = await prisma.chat
        .findFirst({
          where: {
            id: params.id,
            issuerId: session.userId,
          },
          include: {
            messages: {
              orderBy: {
                id: 'desc',
              },
              take: AI_MAX_MESSAGE_PAGE_SIZE,
            },
          },
        })
        .catch(InterceptPrismaError);

      if (!chat) return status(404);

      const userMessageId = v7();
      const inferenceMessageId = v7();

      await prisma.message
        .createMany({
          data: [
            {
              id: userMessageId,
              chatId: chat.id,
              content: body.prompt,
              sender: 'USER',
              userId: session.userId,
            },
            {
              id: inferenceMessageId,
              chatId: chat.id,
              sender: 'AGENT',
              content: '',
            },
          ],
        })
        .catch(InterceptPrismaError);

      if (
        chat.messages.length === 0 &&
        (await redis.get(`assistant:chat:${params.id}:titleGeneration`)) !== '1'
      ) {
        await redis.set(
          `assistant:chat:${params.id}:titleGeneration`,
          '1',
          'NX'
        );
        generateTitle(chat.id, body.prompt).then(async () => {
          await redis.del(`assistant:${session.userId}:chat:${params.id}`);
          await redis.del(`assistant:chat:${params.id}:titleGeneration`);
        });
      }

      const mappedMessages = chat.messages.reverse().map((message) => {
        return {
          role: SenderToRole[message.sender],
          content: message.content,
        };
      }) as AISDKMessage[];

      mappedMessages.push({
        role: 'user',
        content: body.prompt,
      });

      const model = google(body.model);

      const basket = `user:${session.userId}:caches:chat:${params.id}:messages`;
      const inference = streamText({
        model: model,
        providerOptions: {
          google: {} satisfies GoogleGenerativeAIProviderOptions,
        },
        messages: mappedMessages,
        async onAbort(event) {
          await prisma.message.update({
            where: {
              id: inferenceMessageId,
            },
            data: {
              content: event.steps.map((step) => step.text).join(' '),
            },
          });

          await deleteBasket(basket);
        },
        async onFinish(inference) {
          await prisma.message.update({
            where: {
              id: inferenceMessageId,
            },
            data: {
              content: inference.text,
            },
          });

          await deleteBasket(basket);
        },
      });

      return inference.textStream;
    },
    {
      auth: true,
      detail: {
        summary: 'Send message',
        description:
          'Append a user message to the chat and stream the assistant response; persist the final inference content.',
        tags: ['Assistant', 'Chat'],
        security: [{ CookieAuth: [] }],
      },
      body: 'createMessage',
    }
  );
