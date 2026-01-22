<template>
  <button
    class="min-w-8 md:min-w-60 border rounded-md h-8 flex items-center px-2 text-sm text-muted-foreground gap-2 transition hover:bg-input/40 cursor-pointer duration-100"
    @click="open = true"
  >
    <Search class="size-4" />
    <span class="hidden md:block">Komutları Kullan..</span>
    <KbdGroup class="ml-auto text-xs">
      <Kbd> ⌘ </Kbd>
      <Kbd> P </Kbd>
    </KbdGroup>
  </button>
  <CommandDialog v-model:open="open">
    <CommandInput placeholder="Komutları Kullan.." />
    <CommandList>
      <CommandEmpty>No results found.</CommandEmpty>
      <template v-for="[title, list] of Object.entries(commands)" :key="title">
        <CommandGroup :heading="title">
          <CommandItem
            v-for="[command, details] of Object.entries(list)"
            :key="command"
            :value="details.id || command.toLowerCase()"
            @select="
              () =>
                details.type == 'route'
                  ? (() => {
                      navigateTo(details.route);
                      open = false;
                    })()
                  : details.afterClick
            "
          >
            <component :is="details.icon" />
            <span>{{ command }}</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
      </template>
    </CommandList>
  </CommandDialog>
</template>

<script lang="ts" setup>
import {
  ArrowRightLeft,
  BadgeDollarSign,
  BadgePercent,
  Box,
  Boxes,
  ChartAreaIcon,
  ChartBarIcon,
  GalleryVerticalEnd,
  Plus,
  Search,
  Settings,
  ShoppingBasket,
  Users2,
} from 'lucide-vue-next';
import type { FunctionalComponent, VNode } from 'vue';
import type { RouteLocationAsString } from 'vue-router';
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
  route: RouteLocationAsString;
} & CommandRaw;

type Command = ActionCommand | RouteCommand;

const commands: Record<string, Record<string, Command>> = {
  General: {},
  Analitikler: {
    'İşlenmiş Analitikler': {
      icon: ChartAreaIcon,
      type: 'route',
      route: '/dash/analytics/aggregated',
    },
    'Saf Analitikler': {
      icon: ChartBarIcon,
      type: 'route',
      route: '/dash/analytics/raw',
    },
  },
  POS: {
    Satışlar: {
      icon: ShoppingBasket,
      type: 'route',
      route: '/dash/pos/sells',
    },
    Siparişler: {
      icon: ShoppingBasket,
      type: 'route',
      route: '/dash/pos/orders',
    },
  },
  Envanter: {
    Ürünler: {
      icon: Box,
      type: 'route',
      route: '/dash/inventory/products',
    },
    'Yeni Ürün': {
      icon: Plus,
      type: 'route',
      route: '/dash/inventory/products/create',
    },
    Kategoriler: {
      icon: Boxes,
      type: 'route',
      route: '/dash/inventory/categories',
    },
    'Yeni Kategori': {
      icon: Plus,
      type: 'route',
      route: '/dash/inventory/categories/create',
    },
    Stoklar: {
      icon: GalleryVerticalEnd,
      type: 'route',
      route: '/dash/inventory/stocks',
    },
    'Yeni Stok': {
      icon: Plus,
      type: 'route',
      route: '/dash/inventory/stocks/create',
    },
    Hareketler: {
      icon: ArrowRightLeft,
      type: 'route',
      route: '/dash/inventory/audit',
    },
  },
  Yönetim: {
    Genel: {
      icon: Settings,
      type: 'route',
      route: '/dash/management/general',
    },
    Vergiler: {
      icon: BadgeDollarSign,
      type: 'route',
      route: '/dash/management/taxes',
    },
    Kampanyalar: {
      icon: BadgePercent,
      type: 'route',
      route: '/dash/management/campaigns',
    },
    Üyeler: {
      icon: Users2,
      type: 'route',
      route: '/dash/management/members',
    },
  },
};
</script>

<style></style>
