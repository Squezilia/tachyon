import { GoogleGenerativeAIProviderOptions } from '@ai-sdk/google';
import logger from '@backend/lib/logger';
import prisma from '@database';
import {
  AssistantModelMessage,
  LanguageModel,
  ModelMessage,
  streamText,
  SystemModelMessage,
  ToolModelMessage,
  UserModelMessage,
} from 'ai';

export type AISDKMessage =
  | SystemModelMessage
  | UserModelMessage
  | AssistantModelMessage
  | ToolModelMessage;

export function createInferenceStream(
  messageId: string,
  chatId: string,
  model: LanguageModel,
  messages: ModelMessage[]
): ReadableStream<string> {
  const inference = streamText({
    model: model,
    providerOptions: {
      google: {} satisfies GoogleGenerativeAIProviderOptions,
    },
    messages,
    async onAbort(event) {
      logger.error(`${chatId} Aborted!`);
      await prisma.message.update({
        where: {
          id: messageId,
        },
        data: {
          content: event.steps.map((step) => step.text).join(' '),
        },
      });
    },
    async onFinish(inference) {
      logger.info(`${chatId} Finished!`);
      await prisma.message.update({
        where: {
          id: messageId,
        },
        data: {
          content: inference.text,
        },
      });
    },
  });

  return inference.textStream as ReadableStream<string>;
}
