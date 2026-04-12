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
import type { CategoryPlain } from '@database/prismabox';
import toLocaleDate from '~/lib/toLocaleDate';
import DataTableActions from '~/components/DataTableActions.vue';
import useDetailsView from '~/composables/useDetailsView';
import useClientError from '~/composables/useClientError';
import useToast from '~/composables/useToast';

const updateState = ref(0);
const detailsView = useDetailsView();

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
    accessorFn: (a) => a.id,
    cell: (a) =>
      h(DataTableActions, {
        actions: [
          {
            title: 'Detaylar',
            action: () => {
              detailsView.open(a.renderValue() + '', 'category');
            },
            group: 'default',
            icon: Eye,
          },
          {
            title: 'Düzenle',
            action: () => {
              useRouter().push(
                `/dash/inventory/categories/${a.renderValue()}/update`
              );
            },
            group: 'default',
            icon: Edit3,
          },
          {
            title: 'Kopyala',
            action: async () => {
              const res = await client.v1.inventory.categories
                .dupe({
                  id: a.renderValue() + '',
                })
                .post()
                .catch(useClientError);
              if (!res) return;

              useToast('Kategori Kopyalandı!', {
                type: 'success',
              });
              updateState.value++;
            },
            group: 'default',
            icon: Copy,
          },
          {
            title: 'Sil',
            action: async () => {
              const res = await client.v1.inventory
                .categories({ id: a.renderValue() + '' })
                .delete()
                .catch(useClientError);
              if (!res) return;

              useToast('Kategori Silindi!', { type: 'success' });
              updateState.value++;
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

async function fetchCategories(params: { page: number; max: number }) {
  const { data, error } = await client.v1.inventory.categories.get({
    query: { page: params.page, max: params.max },
  });
  if ((error && error.status !== 422) || !data) {
    const reason =
      error.status !== 422
        ? error.value.reason
        : 'Kategoriler çekilirken hata yaşandı.';
    throw new Error(reason);
  }
  return data;
}
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl md:text-4xl font-semibold">Kategoriler</h1>

      <NuxtLink to="/dash/inventory/categories/create">
        <Button size="sm" variant="secondary">
          Yeni Kategori
          <ArrowRight />
        </Button>
      </NuxtLink>
    </div>

    <ServerDataTable
      :columns="columns"
      :fetch-page="fetchCategories"
      :update-state="updateState"
    />
  </div>
</template>
