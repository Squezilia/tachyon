<script setup lang="ts">
import type { AssistantMode, AssistantModel } from './InputBox.vue';
import type { Chat } from '@database/prisma';
import ChatsList from './ChatsList.vue';
import InputBox from './InputBox.vue';
import type { UIChatMessage } from './Chat.vue';
import client from '~/lib/api';
import { ArrowLeft } from 'lucide-vue-next';
import useAssistant from '~/composables/useAssistant';
import useToast from '~/composables/useToast';
import useClientError from '~/composables/useClientError';
import SidepanelHeader from '~/components/sidepanel/Header.vue';
import AssistantChat from '~/components/assistant/Chat.vue';

const assistantMode = ref<AssistantMode>('chat');
const assistantModel = ref<AssistantModel | 'auto-model'>('auto-model');

const messageCursor = ref<string | null>(null);
const hasMoreMessages = ref(true);

const assistant = useAssistant();

const { $tachyRouter } = useNuxtApp();

async function submit(content: string) {
  if (!assistant.chat.value) await assistant.createChat();

  const modelName = await $tachyRouter.route(content, assistantModel.value);
  if (!modelName)
    return useToast('Mesaj için uygun bir model bulunamadı.', {
      type: 'error',
    });

  if (assistant.history.value.length === 0) hasMoreMessages.value = false;
  assistant.sendMessage(content, modelName);

  assistant.history.value.push({
    sender: 'USER',
    content,
  });
}

async function fetchMessages() {
  if (!assistant.chat.value) return;
  const res = await client.v1.assistant
    .chat({ id: assistant.chat.value.id })
    .message.get()
    .catch(useClientError);
  if (!res || !res.data) return;

  assistant.history.value = [
    ...res.data.data.map(
      (message) =>
        ({
          sender: message.sender,
          content: message.content,
        }) satisfies UIChatMessage
    ),
    ...assistant.history.value,
  ];

  assistant.history.value.reverse();

  if (!res.data.meta.nextCursor) return (hasMoreMessages.value = false);
  messageCursor.value = res.data.meta.nextCursor;
  hasMoreMessages.value = true;
}

function chatSelect(selectedChat: Chat) {
  assistant.chat.value = selectedChat;

  fetchMessages();
}

function requestMessages() {
  fetchMessages();
}

function backToChats() {
  assistant.history.value = [];
  assistant.chat.value = null;
  messageCursor.value = null;
  hasMoreMessages.value = true;
}

function abort() {
  if (!assistant.running.value || !assistant.abortController.value) return;

  assistant.abortController.value.abort();
  assistant.running.value = false;
}
</script>

<template>
  <SidepanelHeader class="mb-1.5">
    <Button
      v-if="assistant.chat.value"
      variant="ghost"
      size="icon"
      class="size-6"
      @click="backToChats"
    >
      <ArrowLeft />
    </Button>
    {{ assistant.chat.value ? assistant.chat.value.name : 'Asistan' }}
  </SidepanelHeader>
  <div
    v-if="assistant.chat.value"
    class="h-full overflow-y-auto p-2.5 pt-0 flex flex-col"
  >
    <AssistantChat
      :history="assistant.history.value"
      :has-more-messages="hasMoreMessages"
      @request-messages="requestMessages"
    />
  </div>
  <ChatsList v-else class="p-2.5 pt-0" @select="chatSelect($event)" />
  <div class="p-2.5 pt-0">
    <InputBox
      v-model:mode="assistantMode"
      v-model:model="assistantModel"
      :running="assistant.running.value"
      @submit="submit"
      @abort="abort"
    />
  </div>
</template>
