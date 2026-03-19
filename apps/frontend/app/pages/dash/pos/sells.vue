<script setup lang="ts">
import type { ColumnDef } from '@tanstack/vue-table';
import { h } from 'vue';
import ServerDataTable from '~/components/DataTable.vue';
import client from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Eye, Undo2 } from 'lucide-vue-next';
import DataTableActions from '~/components/DataTableActions.vue';
import toLocaleDate from '~/lib/toLocaleDate';
import type { SellPlain } from '@database/prismabox';

const columns: ColumnDef<typeof SellPlain.static, unknown>[] = [
  {
    header: 'Oluşturuldu',
    accessorFn: (a) => {
      return toLocaleDate(a.createdAt);
    },
  },
  {
    header: 'Ödeme',
    accessorFn: () => {
      return 'Payment';
    },
    cell: (a) =>
      h(
        Button,
        { size: 'sm', variant: 'outline', class: 'text-xs px-2 h-6' },
        { default: () => a.renderValue() }
      ),
  },
  {
    header: 'İade',
    accessorFn: (a) => {
      return a.isReversal + '';
    },
    cell: (a) => {
      return h(
        Button,
        {
          size: 'sm',
          variant: a.renderValue() === 'true' ? 'destructive' : 'outline',
          class: 'text-xs px-2 h-6',
        },
        {
          default: () =>
            a.renderValue() === 'true' ? 'İade Edilmiş' : 'İade Edilmemiş',
        }
      );
    },
  },
  {
    accessorFn: (a) => {
      return a.isReversal;
    },
    header: 'İade Satışı',
    cell: () =>
      h(
        Button,
        {
          size: 'sm',
          variant: 'outline',
          class: 'text-xs px-2 h-6',
        },
        { default: () => 'Sell' }
      ),
  },
  {
    header: 'Eylemler',
    cell: () =>
      h(DataTableActions, {
        actions: [
          {
            title: 'Detaylar',
            action: () => {},
            group: 'default',
            icon: Eye,
          },
          {
            title: 'İade',
            action: () => {},
            group: 'danger',
            icon: Undo2,
            type: 'destructive',
            needRequire: true,
          },
        ],
      }),
  },
];

async function fetchSells(params: { page: number; max: number }) {
  const { data, error } = await client.v1.pos.retail.sells.get({
    query: { page: params.page, max: params.max },
  });
  if ((error && error.status !== 422) || !data) {
    const reason =
      error.status !== 422
        ? error.value.reason
        : 'Satışlar çekilirken hata yaşandı.';
    throw new Error(reason);
  }
  return data;
}
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl md:text-4xl font-semibold">Sells</h1>
    </div>
    <ServerDataTable :columns="columns" :fetch-page="fetchSells" />
  </div>
</template>
