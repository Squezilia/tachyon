<template>
  <button
    class="min-w-8 md:min-w-60 border rounded-md h-8 flex items-center px-2 text-sm text-muted-foreground gap-2 transition hover:bg-input/40 cursor-pointer duration-100"
    @click="open = true"
  >
    <Search class="size-4" />
    <span class="hidden md:block">Use Commands..</span>
    <KbdGroup class="ml-auto text-xs">
      <Kbd> ⌘ </Kbd>
      <Kbd> P </Kbd>
    </KbdGroup>
  </button>
  <CommandDialog v-model:open="open">
    <CommandInput placeholder="Use Commands.." />
    <CommandList>
      <CommandEmpty>No results found.</CommandEmpty>
      <template v-for="[title, list] of Object.entries(commands)" :key="title">
        <CommandGroup :heading="title">
          <CommandItem
            v-for="[command, details] of Object.entries(list)"
            :key="command"
            :value="details.id || command.toLowerCase()"
          >
            <NuxtLink v-if="details.type == 'route'" :to="details.route">
              <component :is="details.icon" />
              {{ command }}
            </NuxtLink>
            <template v-else>
              <component :is="details.icon" />
              {{ command }}
            </template>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
      </template>
    </CommandList>
  </CommandDialog>
</template>

<script lang="ts" setup>
import {
  BadgeCheck,
  BadgePercent,
  Box,
  Boxes,
  ChartBar,
  Clock4,
  ClockFading,
  GalleryVertical,
  GalleryVerticalEnd,
  Plus,
  ReceiptText,
  Search,
} from 'lucide-vue-next';
import type { FunctionalComponent, VNode } from 'vue';
import type { RouteLocationAsPath } from 'vue-router';
import { useMagicKeys } from '@vueuse/core';

const open = ref(false);

const { Meta_P, Ctrl_P } = useMagicKeys({
  passive: false,
  onEventFired(e) {
    if (e.key === 'p' && (e.metaKey || e.ctrlKey)) e.preventDefault();
  },
});

watch([Meta_P, Ctrl_P], (v) => {
  if (v[0] || v[1]) handleOpenChange();
});

function handleOpenChange() {
  open.value = !open.value;
}

type CommandRaw = {
  id?: string;
  icon: FunctionalComponent | VNode;
};

type ActionCommand = {
  type: 'raw';
  afterClick?: (command: Command) => void;
} & CommandRaw;

type RouteCommand = {
  type: 'route';
  route: RouteLocationAsPath;
} & CommandRaw;

type Command = ActionCommand | RouteCommand;

const commands: Record<string, Record<string, Command>> = {
  Analytics: {
    'View Weekly Analytics': {
      type: 'raw',
      icon: ChartBar,
    },
    'View Monthly Analytics': {
      type: 'raw',
      icon: ChartBar,
    },
    'View All of Time Analytics': {
      type: 'raw',
      icon: ChartBar,
    },
  },
  Store: {
    'View Sells': {
      type: 'raw',
      icon: ReceiptText,
    },
    'View Orders': {
      type: 'raw',
      icon: ReceiptText,
    },
    'Check Integrity': {
      type: 'raw',
      icon: BadgeCheck,
    },
  },
  Inventory: {
    'List Inventory': {
      type: 'raw',
      icon: Boxes,
    },
    'Create Product': {
      type: 'raw',
      icon: Plus,
    },
    'List Products': {
      type: 'raw',
      icon: Box,
    },
    'Create Category': {
      type: 'raw',
      icon: GalleryVertical,
    },
    'List Categories': {
      type: 'raw',
      icon: GalleryVerticalEnd,
    },
  },
  Campaigns: {
    'List All Campaigns': {
      type: 'raw',
      icon: BadgePercent,
    },
    'List Expired Campaigns': {
      type: 'raw',
      icon: ClockFading,
    },
    'List Active Campaigns': {
      type: 'raw',
      icon: Clock4,
    },
  },
};
</script>

<style></style>
