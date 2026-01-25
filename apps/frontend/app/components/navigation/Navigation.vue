<script setup lang="ts">
import type { RouteLocationAsString } from 'vue-router';
import NavCommand from './NavCommand.vue';
import NavOrganization from './NavOrganization.vue';
import NavTabs from './NavTabs.vue';
import NavUser from './NavUser.vue';
import { Assistant } from '#components';

export type Tabs = Record<string, Tab>;

export type Tab = {
  default: RouteLocationAsString;
  routes: Record<string, RouteLocationAsString | Tab>;
};

const config = useAppConfig();

const defaultTab: Tab = {
  default: '/dash',
  routes: {
    Dashboard: '/dash',
    ...Object.fromEntries(
      Object.entries(config.navigation).map(([key, val]) => {
        return [key, val.default];
      })
    ),
  },
};

const depthTraversalPath = computed(() => {
  const path = useRoute().path;
  let currentTabs = defaultTab;

  const traversal: Array<[string, RouteLocationAsString]> = [];
  const trace = (tabKey: string, tab: Tab) => {
    for (const [routeKey, route] of Object.entries(tab.routes)) {
      if (typeof route === 'string') {
        if (path.startsWith(route) && route !== path) {
          currentTabs = tab;
          traversal.push([routeKey, tab.default]);
        }
        if (route === path) {
          currentTabs = tab;
          traversal.push([routeKey, route]);
        }
      }
      if (typeof route === 'object') {
        trace(routeKey, route);
      }
    }
    if (path.startsWith(tab.default) && tab.default !== path)
      traversal.push([tabKey, tab.default]);
    if (tab.default === path) {
      currentTabs = tab;
      traversal.push([tabKey, tab.default]);
    }
    return traversal;
  };

  for (const [module, tab] of Object.entries(config.navigation)) {
    trace(module, tab);
  }

  traversal.shift();

  return { traversalTree: traversal, currentTabs: currentTabs };
});

const assistantToggle = ref(false);
</script>

<template>
  <div class="flex z-50 sticky top-0 flex-col border-b w-screen">
    <div
      class="border-b h-16 flex flex-row items-center p-4 px-6 bg-navigation"
    >
      <div class="flex items-center gap-2.5">
        <Skeleton class="aspect-square size-8" />
        <span class="font-mono text-muted-foreground">/</span>
        <NavOrganization class="-ml-1.5" />
        <template
          v-for="(
            [node, path], idx
          ) of depthTraversalPath.traversalTree.reverse()"
          :key="idx"
        >
          <span class="font-mono text-sm text-muted-foreground">/</span>
          <span
            v-if="idx + 1 == depthTraversalPath.traversalTree.length"
            class="text-sm"
          >
            {{ node }}
          </span>
          <Button v-else variant="ghost" size="sm" @click="$router.push(path)">
            {{ node }}
          </Button>
        </template>
      </div>
      <div class="ml-auto flex items-center gap-4">
        <NavCommand />
        <NavUser />
      </div>
    </div>
    <div class="h-12 flex items-center bg-navigation/70 backdrop-blur-sm">
      <NavTabs :tab="depthTraversalPath.currentTabs" />
      <TooltipSimplified class="ml-auto" text="Yapay zeka asistan sohbeti">
        <button
          :data-active="assistantToggle"
          class="ml-auto mr-4 size-8 transition flex items-center justify-center group/toggleButton hover:bg-accent data-[active=true]:bg-primary rounded-full"
          size="icon"
          @click="assistantToggle = !assistantToggle"
        >
          <Icon
            name="fluent:chat-sparkle-16-filled"
            class="size-5 group-data-[active=true]/toggleButton:text-primary-foreground"
          />
        </button>
      </TooltipSimplified>
      <ClientOnly>
        <Assistant :toggle="assistantToggle" />
      </ClientOnly>
    </div>
  </div>
</template>
