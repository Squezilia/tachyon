<script setup lang="ts">
import { motion } from 'motion-v';
import type { AssistantMode, AssistantModel } from './ChatUIMessageBox.vue';

defineProps<{
  toggle?: boolean;
}>();

const assistantMode = ref<AssistantMode>('auto');
const assistantModel = ref<AssistantModel>('gemini25flash');

interface ChatMessage {
  sender: 'user' | 'system' | 'model';
  content: string;
}

const history = ref<ChatMessage[]>([]);

function submit(content: string) {
  history.value.push({
    sender: 'user',
    content,
  });
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
          class="h-full bg-background relative w-96 overflow-hidden"
        >
          <div class="w-96 flex p-2.5 flex-col gap-2.5 h-full">
            <div class="h-full overflow-y-auto space-y-2.5">
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
                  <MarkdownContent :content="message.content" />
                </div>
                <div
                  v-else
                  class="text-sm group-data-[sender=system]/message:text-foreground/60 leading-5.5"
                >
                  <MarkdownContent :content="message.content" />
                </div>
              </div>
            </div>
            <div>
              <ChatUIMessageBox
                v-model:mode="assistantMode"
                v-model:model="assistantModel"
                @submit="submit"
              />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  </Teleport>
</template>
