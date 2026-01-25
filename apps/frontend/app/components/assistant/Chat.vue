<script setup lang="ts">
const props = defineProps<{
  history: UIChatMessage[];
  hasMoreMessages: boolean;
}>();

const emit = defineEmits<{
  requestMessages: [];
}>();

const chatWindow = ref<HTMLDivElement | null>(null);
const chatWindowContent = ref<HTMLDivElement | null>(null);
const anchoredToBottom = ref(true);

let oldScrollHeight = 0;

watch(
  () => props.history.length,
  async () => {
    if (!chatWindow.value || !chatWindowContent.value) return;
    if (anchoredToBottom.value)
      chatWindow.value.scrollTo({
        behavior: 'instant',
        top: chatWindowContent.value.getBoundingClientRect().height,
      });
    else {
      const currentScrollHeight =
        chatWindowContent.value.getBoundingClientRect().height;
      chatWindow.value.scrollTo({
        behavior: 'instant',
        top: currentScrollHeight - oldScrollHeight,
      });
    }
    oldScrollHeight = chatWindowContent.value.getBoundingClientRect().height;
  },
  { flush: 'post' }
);

function scroll() {
  if (!chatWindow.value || !chatWindowContent.value) return;

  const bottom = chatWindowContent.value.getBoundingClientRect().height;
  const scroll = chatWindow.value.scrollTop + chatWindow.value.clientHeight;

  if (bottom - 100 < scroll && scroll < bottom + 100) {
    anchoredToBottom.value = true;
  } else {
    anchoredToBottom.value = false;
  }

  if (chatWindow.value.scrollTop <= 50) {
    if (props.hasMoreMessages) emit('requestMessages');
  }
}

export interface UIChatMessage {
  sender: 'user' | 'system' | 'model';
  content: string;
}
</script>

<template>
  <div ref="chatWindow" class="h-full overflow-y-auto" @scrollend="scroll">
    <div ref="chatWindowContent" class="space-y-2.5">
      <div
        v-for="(message, idx) of history"
        :key="idx"
        :data-sender="message.sender"
        class="group/message"
      >
        <div
          v-if="message.sender == 'user'"
          class="p-1.5 bg-primary text-primary-foreground text-sm rounded-lg rounded-tr-sm w-fit ml-auto px-2"
        >
          <MarkdownContent
            :content="message.content"
            :style="{ '--markdown-container-width': '24rem' }"
          />
        </div>
        <div
          v-else
          class="text-sm group-data-[sender=system]/message:text-foreground/60 leading-5.5"
        >
          <MarkdownContent
            :content="message.content"
            :style="{ '--markdown-container-width': '24rem' }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
