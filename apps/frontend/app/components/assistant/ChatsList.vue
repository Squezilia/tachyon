<script setup lang="ts">
import type { Chat } from '@database/generated/prisma/client';
import type { ChatPlain } from '@database';
import type { ServerPaginate } from '../DataTable.vue';
import { ArrowDown, Loader2 } from 'lucide-vue-next';

const emit = defineEmits<{
  select: [Chat];
}>();

const { $api } = useNuxtApp();

const chats = ref<Chat[]>([]);

const chatsPage = ref(0);
const hasMoreChats = ref(false);
const loadingChats = ref(false);
const selectedChatLoading = ref(false);
const selectedChatId = ref<string | null>(null);

async function getChats() {
  loadingChats.value = true;
  const data = await $api<ServerPaginate<typeof ChatPlain.static>>(
    '/v1/assistant/chats',
    { query: { page: chatsPage.value, max: 8 } }
  );
  if (!data) return;

  if (data.meta.page >= Math.ceil(data.meta.total / data.meta.max))
    hasMoreChats.value = false;
  else hasMoreChats.value = true;
  chats.value = chats.value.concat(data.data);

  loadingChats.value = false;
}

async function selectChat(id: string) {
  selectedChatId.value = id;
  selectedChatLoading.value = true;
  const data = await $api<typeof ChatPlain.static>(`/v1/assistant/${id}`);
  emit('select', data);
  selectedChatLoading.value = false;
}

onMounted(() => {
  getChats();
});
</script>

<template>
  <div
    v-if="chats.length > 0"
    class="h-full overflow-y-auto flex flex-col items-start gap-1.5"
  >
    <AlternateHeading>Sohbetler</AlternateHeading>
    <button
      v-for="oldChat of chats"
      :key="oldChat.id"
      class="text-sm text-foreground/60 max-w-80 hover:text-foreground/80 flex items-center gap-1 text-left transition cursor-pointer disabled:cursor-not-allowed disabled:text-foreground/40"
      :disabled="selectedChatLoading"
      @click="selectChat(oldChat.id)"
    >
      {{ oldChat.name }}
      <Loader2
        v-if="selectedChatLoading && oldChat.id === selectedChatId"
        class="animate-spin size-4 shrink-0"
      />
    </button>
    <button
      v-if="hasMoreChats"
      class="text-sm cursor-pointer underline flex text-left items-center gap-1 disabled:text-primary/80"
      :disabled="loadingChats"
      @click="
        chatsPage += 1;
        getChats();
      "
    >
      Daha fazla sohbet yükle
      <component
        :is="loadingChats ? Loader2 : ArrowDown"
        :class="`size-4 inline ${loadingChats ? 'animate-spin' : ''}`"
      />
    </button>
  </div>
  <div v-else class="my-auto flex">
    <SubHeading class="text-center">Size nasıl yardımcı olabilirim?</SubHeading>
  </div>
</template>
