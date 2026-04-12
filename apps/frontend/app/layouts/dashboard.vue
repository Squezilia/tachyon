<script setup lang="ts">
import { motion } from 'motion-v';
import Navigation from '~/components/navigation/Navigation.vue';
import useSideView from '~/composables/useSideView';

const LazySidepanel = defineAsyncComponent(
  () => import('~/components/sidepanel/index.vue')
);
const LazyAssistant = defineAsyncComponent(
  () => import('~/components/assistant/index.vue')
);
const LazyDetailForms = defineAsyncComponent(
  () => import('~/components/detailForms/index.vue')
);

const sideView = useSideView();
</script>

<template>
  <TooltipProvider :delay-duration="800">
    <main>
      <ClientOnly>
        <LazySidepanel :toggle="sideView.active.value || false">
          <motion.div
            v-if="sideView.view.value === 'chat'"
            :initial="{ opacity: 0 }"
            :animate="{ opacity: 100 }"
            :exit="{ opacity: 0 }"
            :transition="{
              delay: 0.1,
              duration: 0.25,
              ease: [0.33, 1, 0.68, 1],
            }"
            class="flex flex-col h-full"
          >
            <LazyAssistant />
          </motion.div>
          <motion.div
            v-else
            :initial="{ opacity: 0 }"
            :animate="{ opacity: 100 }"
            :exit="{ opacity: 0 }"
            :transition="{
              delay: 0.1,
              duration: 0.25,
              ease: [0.33, 1, 0.68, 1],
            }"
            class="flex flex-col h-full"
          >
            <LazyDetailForms />
          </motion.div>
        </LazySidepanel>
      </ClientOnly>
      <Navigation />
      <div
        id="container"
        class="[background-image:var(--background-grid)] bg-size-[20px_20px] min-h-screen flex"
      >
        <div
          class="py-6 z-10 container mx-auto md:px-8 px-2 bg-background min-h-screen border-x shadow-[0_0_2rem_0]/10"
        >
          <slot />
        </div>
      </div>
    </main>
  </TooltipProvider>
</template>
