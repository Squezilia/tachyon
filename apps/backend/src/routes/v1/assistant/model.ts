import { CursorPaginateResponse, PaginateResponse } from '@/globals';
import { AssistantMessageSender } from '@database/prisma/enums';
import { ChatPlain } from '@database/prismabox/Chat';
import { MessagePlain } from '@database/prismabox/Message';
import Elysia, { t } from 'elysia';
import { AISDKMessage } from './';

export const SenderToRole: Record<
  AssistantMessageSender,
  Pick<AISDKMessage, 'role'>['role']
> = {
  AGENT: 'assistant',
  SYSTEM: 'system',
  TOOL: 'tool',
  USER: 'user',
};

export const allowedModels = t.Union([
  t.Literal('gemini-2.5-flash-lite'),
  t.Literal('gemini-2.5-flash'),
  t.Literal('gemini-3-flash-preview'),
  t.Literal('gemini-3-pro-preview'),
]);

export const ChatMessage = t.Object({
  prompt: t.String(),
  model: allowedModels,
});

export default new Elysia().model({
  chat: ChatPlain,
  chatPaginated: PaginateResponse(ChatPlain),
  createMessage: ChatMessage,
  messageCursorPaginated: CursorPaginateResponse(MessagePlain),
});
