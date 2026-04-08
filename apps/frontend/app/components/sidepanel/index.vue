<script setup lang="ts">
import { motion } from 'motion-v';

defineProps<{
  toggle?: boolean;
}>();
</script>

<template>
  <Teleport to="#container">
    <div class="h-[calc(100dvh-7rem)] sticky top-28 z-20">
      <AnimatePresence mode="sync">
        <motion.div
          v-if="toggle"
          :initial="{ width: 0 }"
          :animate="{ width: '24rem' }"
          :exit="{ width: 0, transition: { delay: 0.1 } }"
          :transition="{
            duration: 0.25,
            ease: [0.33, 1, 0.68, 1],
          }"
          class="h-full bg-background relative w-96 overflow-hidden right-0 z-20"
        >
          <motion.div
            v-if="toggle"
            :initial="{ opacity: 0 }"
            :animate="{ opacity: 100, transition: { delay: 0.05 } }"
            :exit="{ opacity: 0 }"
            :transition="{
              duration: 0.15,
              ease: [0.33, 1, 0.68, 1],
            }"
            class="min-w-96 flex flex-col gap-2.5 h-full"
          >
            <slot />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  </Teleport>
</template>
