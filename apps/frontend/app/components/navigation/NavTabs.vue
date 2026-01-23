<template>
  <div
    ref="HoverWrapper"
    class="h-full flex overflow-hidden items-center group/wrapper w-fit relative"
  >
    <div
      :style="HoverTargetPosition"
      class="absolute top-1/2 h-9 w-20 -translate-y-1/2 z-0 bg-accent group-hover/wrapper:opacity-50 group-active/wrapper:opacity-75 rounded-md transition-all duration-100 opacity-0"
    />
    <div
      ref="ActiveWrapper"
      class="h-full px-4 gap-2 flex items-center overflow-auto no-scrollbar relative w-screen max-w-fit"
      @mouseover="HoverContainerMouseOver"
    >
      <div
        :data-find="ActiveTargetFind"
        :style="ActiveTargetPosition"
        class="absolute bottom-0 h-9 w-20 z-0 border-primary border-b-2 transition-all duration-100 delay-150 data-[find=false]:opacity-0"
      />
      <NuxtLink
        v-for="[tabName, path] of Object.entries(tab.routes)"
        :key="tabName"
        :to="typeof path === 'string' ? path : path.default"
        variant="ghost"
        data-target="hover"
        class="text-sm px-4 h-9 z-5 flex items-center cursor-pointer select-none"
      >
        {{ tabName }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Tab } from './Navigation.vue';

defineProps<{
  tab: Tab;
}>();

const HoverWrapper = ref<HTMLElement | null>(null);
const ActiveWrapper = ref<HTMLElement | null>(null);
const ActiveTargetFind = ref(false);
const HoverTargetPosition = ref({
  left: '0px',
  width: '0px',
});
const ActiveTargetPosition = ref({
  left: '0px',
  width: '0px',
});

onMounted(() => setActiveTarget(useRoute().path));

const route = useRoute();

watchEffect(
  () => {
    setActiveTarget(route.path);
  },
  { flush: 'post' }
);

function HoverContainerMouseOver(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (target.getAttribute('data-target') === 'hover') setHoverTarget(target);
}

async function setHoverTarget(child: HTMLElement) {
  if (!HoverWrapper.value) return;
  const after = child.getBoundingClientRect();
  const container = HoverWrapper.value.getBoundingClientRect();
  HoverTargetPosition.value.left = `${after.left - container.x}px`;
  HoverTargetPosition.value.width = `${after.width}px`;
}

async function setActiveTarget(path: string) {
  if (!ActiveWrapper.value) return;
  for (const child of ActiveWrapper.value.children) {
    if (path === child.getAttribute('href')) {
      ActiveTargetFind.value = true;
      const after = (child as HTMLElement).getBoundingClientRect();
      const container = ActiveWrapper.value.getBoundingClientRect();
      ActiveTargetPosition.value.left = `${after.left + ActiveWrapper.value.scrollLeft - container.x}px`;
      ActiveTargetPosition.value.width = `${after.width}px`;
      nextTick();
      return;
    }
  }
  ActiveTargetFind.value = false;
  nextTick();
}
</script>
