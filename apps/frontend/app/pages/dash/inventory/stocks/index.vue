<script setup lang="ts">
import type { ColumnDef } from '@tanstack/vue-table';
import { h } from 'vue';
import ServerDataTable from '~/components/DataTable.vue';
import client from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ArrowRight, Eye, Trash2 } from 'lucide-vue-next';
import DataTableActions from '~/components/DataTableActions.vue';
import toLocaleDate from '~/lib/toLocaleDate';
import type { StockListItem } from '@backend/routes/v1/inventory/stocks/index.model';

const columns: ColumnDef<typeof StockListItem.static, unknown>[] = [
  {
    header: 'Ürün',
    accessorFn: (a) => {
      return a.product.name;
    },
    cell: (a) =>
      h(
        Button,
        { size: 'sm', variant: 'outline', class: 'text-xs px-2 h-6' },
        { default: () => a.renderValue() }
      ),
  },
  {
    header: 'Miktar',
    accessorFn: (a) => {
      return `${a.quantity}/${a.maxQuantity || '∞'}`;
    },
  },
  {
    header: 'Son Doldurma',
    accessorFn: (a) => {
      return a.lastRestockedAt ? toLocaleDate(a.lastRestockedAt) : 'Never';
    },
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
            title: 'Sil',
            action: () => {},
            group: 'danger',
            icon: Trash2,
            type: 'destructive',
            needRequire: true,
          },
        ],
      }),
  },
];

async function fetchStocks(params: { page: number; max: number }) {
  const { data, error } = await client.v1.inventory.stocks.get.get({
    query: { page: params.page, max: params.max },
  });
  if (error)
    throw new Error(
      String(error.value?.reason ?? 'Stoklar çekilirken hata yaşandı.')
    );
  return data;
}
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl md:text-4xl font-semibold">Stoklar</h1>

      <NuxtLink to="/dash/inventory/stocks/create">
        <Button size="sm" variant="secondary">
          Yeni Stok
          <ArrowRight />
        </Button>
      </NuxtLink>
    </div>

    <ServerDataTable :columns="columns" :fetch-page="fetchStocks" />
  </div>
</template>
