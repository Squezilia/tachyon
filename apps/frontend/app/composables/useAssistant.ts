import { Chat } from '@database/prisma/client';
import { UIChatMessage } from '~/components/assistant/Chat.vue';
import client from '~/lib/api';
import useClientError from './useClientError';

export default function useAssistant() {
  const { $api } = useNuxtApp();

  const chat = ref<Chat | null>(null);
  const running = ref(false);

  const abortController = ref<AbortController | null>(null);
  const history = ref<UIChatMessage[]>([]);

  return {
    abortController,
    history,
    chat,
    running,
    async createChat() {
      const res = await client.v1.assistant.chat.post().catch(useClientError);
      if (!res || !res.data) return;
      chat.value = res.data;
    },
    async sendMessage(message: string, modelName: string) {
      if (!chat.value) return;

      const isFirstMessage = history.value.length === 0;
      // if (isFirstMessage) hasMoreMessages.value = false;

      running.value = true;
      abortController.value = new AbortController();

      // send message and create readable stream
      const res = await $api<ReadableStream>(
        `/v1/assistant/chat/${chat.value.id}/message`,
        {
          method: 'POST',
          body: {
            prompt: message,
            model: modelName,
          },
          responseType: 'stream',
          signal: abortController.value.signal,
        }
      );

      // create empty object
      history.value.push({
        sender: 'AGENT',
        content: '',
      });

      const decoder = new TextDecoder();
      const reader = res.getReader();

      // read loop
      reader.read().then(function processText({ done, value }) {
        if (value) {
          // append chunk by reference
          const lastMessage = history.value[history.value.length - 1];
          if (!lastMessage) return;
          lastMessage.content += decoder.decode(value);
        }

        // reading done
        if (done) {
          running.value = false;
          abortController.value = null;
          return;
        }

        reader.read().then(processText);
      });

      // refetch chat for renaming
      if (isFirstMessage) {
        const chatRes = await client.v1.assistant
          .chat({ id: chat.value.id })
          .get()
          .catch(useClientError);
        if (!chatRes || !chatRes.data) return;
        chat.value = chatRes.data;
      }
    },
  };
}
