<script setup lang="ts">
import type { ColumnDef } from '@tanstack/vue-table';
import { h } from 'vue';
import ServerDataTable from '~/components/DataTable.vue';
import client from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ArrowRight, Copy, Edit3, Eye, Trash2 } from 'lucide-vue-next';
import DataTableActions from '~/components/DataTableActions.vue';
import type { TaxPlain } from 'database';

const columns: ColumnDef<typeof TaxPlain.static, unknown>[] = [
  {
    header: 'Name',
    accessorKey: 'name',
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
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
    header: 'Cumulative',
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
    header: 'Rate',
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
    header: 'Actions',
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
            title: 'Kopyala',
            action: () => {},
            group: 'default',
            icon: Copy,
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

async function fetchTaxes(params: { page: number; max: number }) {
  const { data, error } = await client.v1.management.taxes.get.get({
    query: { page: params.page, max: params.max },
  });
  if (error)
    throw new Error(String(error.value?.reason ?? 'Failed to fetch taxes'));
  return data;
}
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl md:text-4xl font-semibold">Taxes</h1>

      <NuxtLink to="/dash/management/taxes/create">
        <Button size="sm" variant="secondary">
          Create Tax
          <ArrowRight />
        </Button>
      </NuxtLink>
    </div>
    <ServerDataTable :columns="columns" :fetch-page="fetchTaxes" />
  </div>
</template>
