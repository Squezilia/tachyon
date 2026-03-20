import { CursorPaginateResponse, PaginateResponse } from '@/globals';
import { ChatPlain } from '@database/prismabox/Chat';
import { MessagePlain } from '@database/prismabox/Message';
import Elysia, { t } from 'elysia';

export const allowedModels = t.Union([
  t.Literal('gemini-2.5-flash-lite'),
  t.Literal('gemini-2.5-flash'),
  t.Literal('gemma-3-27b-it'),
  t.Literal('gemma-3-12b-it'),
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
