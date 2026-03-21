<script setup lang="ts">
import { motion } from 'motion-v';
import type { AssistantMode, AssistantModel } from './InputBox.vue';
import type { Chat } from '@database/prisma';
import type { allowedModels } from '@backend/routes/v1/assistant/model';
import ChatsList from './ChatsList.vue';
import InputBox from './InputBox.vue';
import type { UIChatMessage } from './Chat.vue';
import { ArrowLeft } from 'lucide-vue-next';
import DetailHeading from '../DetailHeading.vue';
import client from '~/lib/api';

defineProps<{
  toggle?: boolean;
}>();

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
  const res = await client.v1.assistant.chat.post().catch(useClientError);
  if (!res || !res.data) return;
  chat.value = res.data;
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

  const res = await client.v1.assistant
    .chat({ id: chat.value.id })
    .message.post(
      { prompt: message, model },
      { fetch: { signal: abortController.signal } }
    )
    .catch(useClientError);
  if (!res || !res.data) return;

  history.value.push({
    sender: 'model',
    content: '',
  });

  for await (const chunk of res.data) {
    const lastMessage = history.value[history.value.length - 1];
    if (!lastMessage) return;
    lastMessage.content += chunk;
  }

  if (isFirstMessage) {
    const chatRes = await client.v1.assistant
      .chat({ id: chat.value.id })
      .get()
      .catch(useClientError);
    if (!chatRes || !chatRes.data) return;
    chat.value = chatRes.data;
  }
}

async function fetchMessages() {
  if (!chat.value) return;
  const res = await client.v1.assistant
    .chat({ id: chat.value.id })
    .message.get()
    .catch(useClientError);
  if (!res || !res.data) return;

  history.value = [
    ...res.data.data
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

  if (!res.data.meta.nextCursor) return (hasMoreMessages.value = false);
  messageCursor.value = res.data.meta.nextCursor;
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
