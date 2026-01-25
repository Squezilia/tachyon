<script setup lang="ts">
import { motion } from 'motion-v';
import type { AssistantMode, AssistantModel } from './InputBox.vue';
import type { Chat } from '@database/generated/prisma/client';
import type { ErrorResponseSchema } from '@backend/model';
import type { allowedModels } from '@backend/routes/v1/assistant/index.model';
import ChatsList from './ChatsList.vue';
import InputBox from './InputBox.vue';
import type { UIChatMessage } from './Chat.vue';
import type { ChatPlain, MessagePlain } from '@database';
import { ArrowLeft } from 'lucide-vue-next';
import DetailHeading from '../DetailHeading.vue';

defineProps<{
  toggle?: boolean;
}>();

type MessagesResponse = {
  data: Array<typeof MessagePlain.static>;
  meta: {
    cursor?: string;
    nextCursor?: string;
    cursorLength: number;
  };
};

const { $api } = useNuxtApp();

const assistantMode = ref<AssistantMode>('chat');
const assistantModel = ref<AssistantModel>('gemma-3-27b-it');

const chat = ref<Chat | null>(null);
const history = ref<UIChatMessage[]>([]);
const messageCursor = ref<string | null>(null);
const hasMoreMessages = ref(true);

let abortController: AbortController | null = null;
const running = ref(false);

async function submit(content: string) {
  if (!chat.value) await createChat();
  sendMessage(content, assistantModel.value);
  history.value.push({
    sender: 'user',
    content,
  });
}

async function createChat() {
  chat.value = await $api<Chat>(`/v1/assistant/createChat`, {
    method: 'POST',
    onResponseError({ response }) {
      if (response.ok) return;
      const body = response._data as typeof ErrorResponseSchema.static;
      useToast(body.error, { type: 'error' });
    },
  });
}

async function sendMessage(
  message: string,
  model: typeof allowedModels.static
) {
  if (!chat.value) return;

  const isFirstMessage = history.value.length === 0;
  if (isFirstMessage) hasMoreMessages.value = false;

  running.value = true;
  abortController = new AbortController();

  const res = await $api<ReadableStream>(
    `/v1/assistant/${chat.value.id}/message`,
    {
      method: 'POST',
      body: {
        prompt: message,
        model,
      },
      responseType: 'stream',
      signal: abortController.signal,
    }
  );

  history.value.push({
    sender: 'model',
    content: '',
  });

  const decoder = new TextDecoder();

  const reader = res.getReader();

  reader.read().then(function processText({ done, value }) {
    if (value) {
      const lastMessage = history.value[history.value.length - 1];
      if (!lastMessage) return;
      lastMessage.content += decoder.decode(value);
    }

    if (done) {
      (async () => {
        if (isFirstMessage)
          chat.value = await $api<typeof ChatPlain.static>(
            `/v1/assistant/${chat.value?.id}`
          );
      })();
      running.value = false;
      return;
    }

    reader.read().then(processText);
  });
}

async function fetchMessages() {
  if (!chat.value) return;
  const response = await $api<MessagesResponse>(
    `/v1/assistant/${chat.value.id}/messages`,
    {
      cache: 'no-cache',
      query: { cursor: messageCursor.value || undefined },
    }
  );
  if (!response) return;

  history.value = [
    ...response.data
      .map(
        (message) =>
          ({
            sender: message.senderId
              ? 'user'
              : message.isSystemMessage
                ? 'system'
                : 'model',
            content: message.content,
          }) satisfies UIChatMessage
      )
      .reverse(),
    ...history.value,
  ];

  if (!response.meta.nextCursor) return (hasMoreMessages.value = false);
  messageCursor.value = response.meta.nextCursor;
  hasMoreMessages.value = true;
}

function chatSelect(selectedChat: Chat) {
  chat.value = selectedChat;

  fetchMessages();
}

function requestMessages() {
  fetchMessages();
}

function backToChats() {
  history.value = [];
  chat.value = null;
  messageCursor.value = null;
  hasMoreMessages.value = true;
}

function abort() {
  if (!running.value || !abortController) return;

  abortController.abort();
  running.value = false;
}
</script>

<template>
  <Teleport to="#container">
    <div class="h-[calc(100dvh-7rem)] sticky top-28 z-20">
      <AnimatePresence mode="sync">
        <motion.div
          v-if="toggle"
          :initial="{ width: 0 }"
          :animate="{ width: '24rem' }"
          :exit="{ width: 0 }"
          class="h-full bg-background relative w-96 overflow-hidden right-0 z-20"
        >
          <div class="min-w-96 flex p-2.5 flex-col gap-2.5 h-full">
            <div v-if="chat" class="h-full overflow-y-auto flex flex-col">
              <div class="h-8 flex items-center gap-2.5">
                <Button
                  variant="ghost"
                  size="icon"
                  class="size-6"
                  @click="backToChats"
                >
                  <ArrowLeft />
                </Button>
                <DetailHeading class="truncate">
                  {{ chat.name }}
                </DetailHeading>
              </div>
              <AssistantChat
                :history="history"
                :has-more-messages="hasMoreMessages"
                @request-messages="requestMessages"
              />
            </div>
            <ChatsList v-else @select="chatSelect($event)" />
            <div>
              <InputBox
                v-model:mode="assistantMode"
                v-model:model="assistantModel"
                :running="running"
                @submit="submit"
                @abort="abort"
              />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  </Teleport>
</template>
