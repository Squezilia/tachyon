import { t } from 'elysia';

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
