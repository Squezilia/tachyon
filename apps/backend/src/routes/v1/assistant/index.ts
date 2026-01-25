import { GoogleGenerativeAIProviderOptions } from '@ai-sdk/google';
import google from '@backend/lib/ai';
import { authMacro } from '@backend/lib/auth';
import prisma from '@backend/lib/prisma';
import {
  AssistantModelMessage,
  generateText,
  streamText,
  SystemModelMessage,
  ToolModelMessage,
  UserModelMessage,
} from 'ai';
import Elysia, { status, t } from 'elysia';
import { ChatMessage } from './index.model';
import {
  MappedPrismaError,
  mapPrismaError,
  ResponseSchemaSet,
} from '@backend/lib/error';
import { v7 } from 'uuid';
import logger from '@backend/lib/logger';
import { Chat, ChatPlain, MessagePlain } from '@database';
import { QueryPaginate, ResponsePaginate } from '@/model';
import tr from '@/i18n/tr';
import { Prisma } from '@database/generated/prisma/client';

type AISDKMessage =
  | SystemModelMessage
  | UserModelMessage
  | AssistantModelMessage
  | ToolModelMessage;

export default () =>
  new Elysia()
    .use(authMacro)
    .get(
      '/chats',
      async ({ session, query }) => {
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
        ]).catch(mapPrismaError);

        if (transaction instanceof MappedPrismaError) {
          return status(transaction.status, transaction.response);
        }

        const [chats, count] = transaction;

        return {
          data: chats,
          meta: {
            max: query.max,
            page: query.page,
            total: count,
          },
        };
      },
      {
        auth: true,
        query: QueryPaginate(t.Object({})),
        response: { ...ResponseSchemaSet, 200: ResponsePaginate(ChatPlain) },
      }
    )
    .get(
      '/:id',
      async ({ session, params }) => {
        const chat = await prisma.chat
          .findFirst({ where: { id: params.id, issuerId: session.userId } })
          .catch(mapPrismaError);

        if (chat instanceof MappedPrismaError)
          return status(chat.status, chat.response);

        if (!chat) return status(404, tr.error.assistant.notFound);

        return chat;
      },
      { auth: true, response: { ...ResponseSchemaSet, 200: ChatPlain } }
    )
    .get(
      '/:id/messages',
      async ({ session, params, query }) => {
        const PAGE_SIZE = 10;

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
          .catch(mapPrismaError);

        if (messages instanceof MappedPrismaError)
          return status(messages.status, messages.response);

        const nextCursor =
          messages.length === PAGE_SIZE
            ? messages[messages.length - 1].id
            : undefined;

        return {
          data: messages,
          meta: {
            cursor: query.cursor,
            nextCursor,
            cursorLength: PAGE_SIZE,
          },
        };
      },
      {
        auth: true,
        query: t.Object({
          cursor: t.Optional(t.String()),
        }),
        response: {
          ...ResponseSchemaSet,
          200: t.Object({
            data: t.Array(MessagePlain),
            meta: t.Object({
              cursor: t.Optional(t.String()),
              nextCursor: t.Optional(t.String()),
              cursorLength: t.Integer(),
            }),
          }),
        },
      }
    )
    .post(
      '/createChat',
      async function ({ session }) {
        const chat = await prisma.chat
          .create({
            data: {
              name: 'Yeni Sohbet',
              issuerId: session.userId,
            },
          })
          .catch(mapPrismaError);

        if (chat instanceof MappedPrismaError)
          return status(chat.status, chat.response);

        return status(201, chat);
      },
      {
        auth: true,
        response: {
          ...ResponseSchemaSet,
          201: ChatPlain,
        },
      }
    )
    .post(
      '/:id/message',
      async function ({ params, session, status, body }) {
        const chat = await prisma.chat
          .findFirst({
            where: {
              id: params.id,
              issuerId: session.userId,
            },
            include: {
              messages: true,
            },
          })
          .catch(mapPrismaError);

        if (chat instanceof MappedPrismaError)
          return status(chat.status, chat.response);

        if (!chat) return status(404);

        if (chat.messages.length === 0) {
          const { text } = await generateText({
            model: google('gemma-3-4b-it'),
            prompt: `Generate a simple and short chat title for this prompt \`${body.prompt}\`. Use given prompt language! Only generate one! Only write title! Do not use Markdown!`,
          });

          await prisma.chat.update({
            where: {
              id: chat.id,
            },
            data: {
              name: text,
            },
          });
        }

        const inferenceMessageId = v7();

        const messageBatch = await prisma.message
          .createMany({
            data: [
              {
                chatId: chat.id,
                content: body.prompt,
                senderId: session.userId,
              },
              {
                id: inferenceMessageId,
                chatId: chat.id,
                content: '',
              },
            ],
          })
          .catch(mapPrismaError);

        if (messageBatch instanceof MappedPrismaError)
          return status(messageBatch.status, messageBatch.response);

        const mappedMessages = chat.messages.map((message): AISDKMessage => {
          if (message.senderId) {
            return {
              role: 'user',
              content: message.content,
            };
          } else if (message.isSystemMessage) {
            return {
              role: 'system',
              content: message.content,
            };
          }

          return {
            role: 'assistant',
            content: message.content,
          };
        });

        mappedMessages.push({
          role: 'user',
          content: body.prompt,
        });

        const model = google(body.model);

        const tools = {
          google_search: google.tools.googleSearch({}),
        };

        const inference = streamText({
          model: model,
          tools: ['gemini-2.5-flash-lite', 'gemini-2.5-flash'].includes(
            body.model
          )
            ? tools
            : undefined,
          providerOptions: {
            google: {} satisfies GoogleGenerativeAIProviderOptions,
          },
          messages: mappedMessages,
          async onAbort(event) {
            logger.error(`${chat.id} Aborted!`);
          },
          async onFinish(inference) {
            logger.info(`${chat.id} Finished!`);
            await prisma.message.create({
              data: {
                content: inference.text,
                chatId: chat.id,
              },
            });
          },
        });

        return inference.textStream;
      },
      {
        auth: true,
        body: ChatMessage,
      }
    );
