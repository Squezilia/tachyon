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
import toLocaleDate from '~/lib/toLocaleDate';
import type { TablePlain } from '@database';

const updateState = ref(0);

const columns: ColumnDef<typeof TablePlain.static, unknown>[] = [
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
    accessorKey: 'createdAt',
    header: 'Tarih',
    cell: ({ row }) => toLocaleDate(new Date(row.getValue('createdAt'))),
  },
  {
    accessorFn: (a) => {
      return a.updatedAt
        ? toLocaleDate(new Date(a.updatedAt))
        : 'Güncellenmedi';
    },
    header: 'Güncellendi',
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
              useRouter().push(`/dash/pos/tables/${a.renderValue()}`);
            },
            group: 'default',
            icon: Edit3,
          },
          {
            title: 'Kopyala',
            action: () =>
              useToastFetch(`/v1/pos/tables/dupe/${a.renderValue()}`, {
                fetchOptions: {
                  method: 'POST',
                },
                toastOptions: {
                  loading: 'Masa Kopyalanıyor...',
                  success: 'Masa Kopyalandı!',
                  onResult: () => updateState.value++,
                },
              }),
            group: 'default',
            icon: Copy,
          },
          {
            title: 'Sil',
            action: () => {
              useToastFetch(`/v1/pos/tables/delete/${a.renderValue()}`, {
                fetchOptions: {
                  method: 'DELETE',
                },
                toastOptions: {
                  loading: 'Masa Siliniyor...',
                  success: 'Masa Silindi!',
                  onResult: () => updateState.value++,
                },
              });
            },
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
  const { data, error } = await client.v1.pos.gastro.tables.get.get({
    query: { page: params.page, max: params.max },
  });
  if (error)
    throw new Error(
      String(error.value?.reason ?? 'Masalar çekilirken hata yaşandı.')
    );
  return data;
}
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl md:text-4xl font-semibold">Masalar</h1>

      <NuxtLink to="/dash/pos/tables/create">
        <Button size="sm" variant="secondary">
          Yeni Masa
          <ArrowRight />
        </Button>
      </NuxtLink>
    </div>

    <ServerDataTable
      :columns="columns"
      :fetch-page="fetchProducts"
      :update-state="updateState"
    />
  </div>
</template>
