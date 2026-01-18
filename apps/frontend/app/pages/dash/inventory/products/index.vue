<script setup lang="ts">
import type { ColumnDef } from '@tanstack/vue-table';
import { h } from 'vue';
import ServerDataTable from '~/components/DataTable.vue';
import client from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  ArrowUpDown,
  Copy,
  Edit3,
  Eye,
  Trash2,
} from 'lucide-vue-next';
import DataTableActions from '~/components/DataTableActions.vue';
import type { ProductListItem } from '@backend/routes/v1/inventory/products/index.model';
import toLocaleDate from '~/lib/toLocaleDate';

const columns: ColumnDef<typeof ProductListItem.static, unknown>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) =>
      h(
        Button,
        {
          variant: 'ghost',
          size: 'sm',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => ['Ad', h(ArrowUpDown, { class: 'ml-2' })]
      ),
  },
  {
    accessorKey: 'price',
    header: () => h('div', { class: 'text-right' }, 'Fiyat'),
    cell: ({ row }) =>
      h(
        'div',
        { class: 'text-right font-medium' },
        new Intl.NumberFormat(navigator.language, {
          style: 'currency',
          currency: 'TRY',
        }).format(Number(row.getValue('price')))
      ),
  },
  {
    header: 'Kategori',
    accessorFn: (a) => {
      return a.category.name;
    },
    cell: (a) =>
      h(
        Button,
        { size: 'sm', variant: 'outline', class: 'text-xs px-2 h-6' },
        { default: () => a.renderValue() }
      ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Tarih',
    cell: ({ row }) => toLocaleDate(new Date(row.getValue('createdAt'))),
  },
  {
    header: 'Eylemler',
    accessorFn: (a) => a.id,
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
            title: 'Düzenle',
            action: () => {},
            group: 'default',
            icon: Edit3,
          },
          {
            title: 'Kopyala',
            action: () => {},
            group: 'default',
            icon: Copy,
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

async function fetchProducts(params: { page: number; max: number }) {
  const { data, error } = await client.v1.inventory.products.get.get({
    query: { page: params.page, max: params.max },
  });
  if (error)
    throw new Error(
      String(error.value?.reason ?? 'Ürünler çekilirken hata yaşandı.')
    );
  return data;
}
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl md:text-4xl font-semibold">Ürünler</h1>

      <NuxtLink to="/dash/inventory/products/create">
        <Button size="sm" variant="secondary">
          Ürün Oluştur
          <ArrowRight />
        </Button>
      </NuxtLink>
    </div>

    <ServerDataTable :columns="columns" :fetch-page="fetchProducts" />
  </div>
</template>
