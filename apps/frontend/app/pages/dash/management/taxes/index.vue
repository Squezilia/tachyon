<script setup lang="ts">
import type { ColumnDef } from '@tanstack/vue-table';
import { h } from 'vue';
import ServerDataTable from '~/components/DataTable.vue';
import client from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ArrowRight, Copy, Edit3, Eye, Trash2 } from 'lucide-vue-next';
import DataTableActions from '~/components/DataTableActions.vue';
import type { TaxPlain } from '@database/prismabox';

const updateState = ref(0);

const columns: ColumnDef<typeof TaxPlain.static, unknown>[] = [
  {
    header: 'Ad',
    accessorKey: 'name',
  },
  {
    accessorKey: 'priority',
    header: 'Sıra',
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
    header: 'Kümulatif',
    accessorFn: (a) => {
      return a.isCumulative + '';
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
          default: () =>
            a.renderValue() === 'true' ? 'Cumulative' : 'Non Cumulative',
        }
      );
    },
  },
  {
    header: 'Değer',
    accessorFn: (a) => {
      return a.isFixed
        ? new Intl.NumberFormat(navigator.language, {
            style: 'currency',
            currency: 'TRY',
          }).format(Number(a.rate))
        : `${a.rate}%`;
    },
  },
  {
    accessorKey: 'id',
    header: 'Eylemler',
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
              useRouter().push(`/dash/management/taxes/${a.renderValue()}`);
            },
            group: 'default',
            icon: Edit3,
          },
          {
            title: 'Kopyala',
            action: () =>
              useToastFetch(`/v1/management/taxes/dupe/${a.renderValue()}`, {
                fetchOptions: {
                  method: 'POST',
                },
                toastOptions: {
                  loading: 'Vergi Kopyalanıyor...',
                  success: 'Vergi Kopyalandı!',
                  onResult: () => updateState.value++,
                },
              }),
            group: 'default',
            icon: Copy,
          },
          {
            title: 'Sil',
            action: () =>
              useToastFetch(`/v1/management/taxes/delete/${a.renderValue()}`, {
                fetchOptions: {
                  method: 'DELETE',
                },
                toastOptions: {
                  loading: 'Vergi Siliniyor...',
                  success: 'Vergi Silindi!',
                  onResult: () => updateState.value++,
                },
              }),
            group: 'danger',
            icon: Trash2,
            type: 'destructive',
            needRequire: true,
          },
        ],
      }),
  },
];

async function fetchTaxes(params: { page: number; max: number }) {
  const { data, error } = await client.v1.management.taxes.get({
    query: { page: params.page, max: params.max },
  });
  if ((error && error.status !== 422) || !data) {
    const reason =
      error.status !== 422
        ? error.value.reason
        : 'Vergiler çekilirken hata yaşandı.';
    throw new Error(reason);
  }
  return data;
}
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl md:text-4xl font-semibold">Taxes</h1>

      <NuxtLink to="/dash/management/taxes/create">
        <Button size="sm" variant="secondary">
          Yeni Vergi
          <ArrowRight />
        </Button>
      </NuxtLink>
    </div>
    <ServerDataTable
      :columns="columns"
      :fetch-page="fetchTaxes"
      :update-state="updateState"
    />
  </div>
</template>
