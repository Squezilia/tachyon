<script setup lang="ts">
import type { ColumnDef } from '@tanstack/vue-table';
import { h } from 'vue';
import ServerDataTable from '~/components/DataTable.vue';
import client from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Eye, Undo2 } from 'lucide-vue-next';
import DataTableActions from '~/components/DataTableActions.vue';
import toLocaleDate from '~/lib/toLocaleDate';
import type { OrderPlain } from 'database';

const columns: ColumnDef<
  typeof OrderPlain.static & { issuer: { name: string } },
  unknown
>[] = [
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
    header: 'Güncellendi',
    accessorFn: (a) => {
      return toLocaleDate(a.updatedAt);
    },
  },
  {
    header: 'Durum',
    accessorFn: (a) => {
      return a.status;
    },
    cell: (a) => {
      return h(
        Button,
        {
          size: 'sm',
          variant: a.renderValue() === 'OPEN' ? 'outline' : 'destructive',
          class: 'text-xs px-2 h-6',
        },
        {
          default: () => (a.renderValue() === 'OPEN' ? 'Açık' : 'Kapalı'),
        }
      );
    },
  },
  {
    header: 'Gerçekleştiren',
    accessorFn: (a) => {
      return a.issuer.name;
    },
    cell: (a) => {
      return h(
        Button,
        {
          size: 'sm',
          variant: 'outline',
          class: 'text-xs px-2 h-6',
        },
        {
          default: () => a.renderValue(),
        }
      );
    },
  },
  {
    accessorFn: (a) => {
      return a.tableId;
    },
    header: 'Masa',
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
  const { data, error } = await client.v1.pos.gastro.orders.get.get({
    query: { page: params.page, max: params.max },
  });
  if (error)
    throw new Error(
      String(error.value?.reason ?? 'Siparişler alınırken sorun yaşandı.')
    );
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
