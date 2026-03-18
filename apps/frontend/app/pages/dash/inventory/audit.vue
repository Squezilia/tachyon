<script setup lang="ts">
import type { ColumnDef } from '@tanstack/vue-table';
import { h } from 'vue';
import ServerDataTable from '~/components/DataTable.vue';
import client from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ArrowRight, Eye } from 'lucide-vue-next';
import DataTableActions from '~/components/DataTableActions.vue';
import toLocaleDate from '~/lib/toLocaleDate';
import type { StockMovementPlain } from '@database/prismabox';
import type { StockMovementReason } from '@database/prisma';

const auditReasonLocaleMap: Record<StockMovementReason, string> = {
  SALE: 'Satış',
  ADJUSTMENT: 'Ayarlama',
  RESTOCK: 'Dolum',
  REVERSAL: 'İade',
};

const columns: ColumnDef<
  typeof StockMovementPlain.static & { createdBy: { name: string } },
  unknown
>[] = [
  {
    accessorFn: (a) => {
      return toLocaleDate(a.createdAt);
    },
    header: 'Tarih',
  },
  {
    header: 'Sebep',
    accessorFn: (a) => {
      return auditReasonLocaleMap[a.reason];
    },
  },
  {
    header: 'Miktar Değişimi',
    accessorFn: (a) => {
      return `${a.quantityChange > 0 ? '+' : ''}${a.quantityChange}`;
    },
    cell: (a) =>
      h(
        Button,
        { size: 'sm', variant: 'outline', class: 'text-xs px-2 h-6' },
        { default: () => a.renderValue() }
      ),
  },
  {
    header: 'Gerçekleştiren',
    accessorFn: (a) => {
      return a.createdBy.name;
    },
    cell: (a) =>
      h(
        Button,
        { size: 'sm', variant: 'outline', class: 'text-xs px-2 h-6' },
        { default: () => a.renderValue() }
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
            group: 'details',
            icon: Eye,
          },
          {
            title: 'Stoğu Görüntüle',
            action: () => {},
            group: 'default',
            icon: ArrowRight,
          },
          {
            title: 'Ürünü Görüntüle',
            action: () => {},
            group: 'default',
            icon: ArrowRight,
          },
        ],
      }),
  },
];

async function fetchAudit(params: { page: number; max: number }) {
  const { data, error } = await client.v1.inventory.stocks.movements.get({
    query: { page: params.page, max: params.max },
  });
  if ((error && error.status !== 422) || !data) {
    const reason =
      error.status !== 422
        ? error.value.reason
        : 'Hareketler çekilirken hata yaşandı.';
    throw new Error(reason);
  }
  return data;
}
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl md:text-4xl font-semibold">Hareketler</h1>
    </div>
    <ServerDataTable :columns="columns" :fetch-page="fetchAudit" />
  </div>
</template>
