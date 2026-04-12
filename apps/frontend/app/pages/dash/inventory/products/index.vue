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
import type { ProductListItem } from '@backend/routes/v1/inventory/products/model';
import toLocaleDate from '~/lib/toLocaleDate';
import Chip from '~/components/Chip.vue';
import useDetailsView from '~/composables/useDetailsView';
import useClientError from '~/composables/useClientError';
import useToast from '~/composables/useToast';

const updateState = ref(0);
const detailsView = useDetailsView();

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
    cell: (a) => h(Chip, a.renderValue),
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
            action: () => {
              detailsView.open(a.renderValue() + '', 'product');
            },
            group: 'default',
            icon: Eye,
          },
          {
            title: 'Düzenle',
            action: () => {
              useRouter().push(
                `/dash/inventory/products/${a.renderValue()}/update`
              );
            },
            group: 'default',
            icon: Edit3,
          },
          {
            title: 'Kopyala',
            action: async () => {
              const res = await client.v1.inventory.products
                .dupe({ id: a.renderValue() + '' })
                .post()
                .catch(useClientError);

              if (!res) return;

              useToast('Ürün Kopyalandı!', { type: 'success' });
              updateState.value++;
            },
            group: 'default',
            icon: Copy,
          },
          {
            title: 'Sil',
            action: async () => {
              const res = await client.v1.inventory
                .products({ id: a.renderValue() + '' })
                .delete()
                .catch(useClientError);

              if (!res) return;

              useToast('Ürün Silindi!', { type: 'success' });
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

async function fetchProducts(params: { page: number; max: number }) {
  const { data, error } = await client.v1.inventory.products.get({
    query: { page: params.page, max: params.max },
  });
  if ((error && error.status !== 422) || !data) {
    const reason =
      error.status !== 422
        ? error.value.reason
        : 'Ürünler çekilirken hata yaşandı.';
    throw new Error(reason);
  }
  return data;
}
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl md:text-4xl font-semibold">Ürünler</h1>

      <NuxtLink to="/dash/inventory/products/create">
        <Button size="sm" variant="secondary">
          Yeni Ürün
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
