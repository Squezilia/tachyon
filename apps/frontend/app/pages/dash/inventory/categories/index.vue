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
import type { CategoryPlain } from 'database';
import toLocaleDate from '~/lib/toLocaleDate';
import DataTableActions from '~/components/DataTableActions.vue';

const columns: ColumnDef<typeof CategoryPlain.static, unknown>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) =>
      h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => ['Ad', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
      ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Tarih',
    cell: ({ row }) => toLocaleDate(new Date(row.getValue('createdAt'))),
  },
  {
    header: 'Eylemler',
    accessorKey: 'id',
    cell: (a) =>
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
            action: () => {
              useRouter().push(`/dash/inventory/categories/${a.renderValue()}`);
            },
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

async function fetchCategories(params: { page: number; max: number }) {
  const { data, error } = await client.v1.inventory.categories.get.get({
    query: { page: params.page, max: params.max },
  });
  if (error)
    throw new Error(
      String(error.value?.reason ?? 'Kategoriler çekilirken hata yaşandı.')
    );
  return data;
}
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl md:text-4xl font-semibold">Kategoriler</h1>

      <NuxtLink to="/dash/inventory/categories/create">
        <Button size="sm" variant="secondary">
          Kategori Oluştur
          <ArrowRight />
        </Button>
      </NuxtLink>
    </div>

    <ServerDataTable :columns="columns" :fetch-page="fetchCategories" />
  </div>
</template>
