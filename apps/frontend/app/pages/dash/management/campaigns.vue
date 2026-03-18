<script setup lang="ts">
import type { ColumnDef } from '@tanstack/vue-table';
import { h } from 'vue';
import ServerDataTable from '~/components/DataTable.vue';
import client from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Copy, Edit3, Eye, Trash2 } from 'lucide-vue-next';
import DataTableActions from '~/components/DataTableActions.vue';
import type { CampaignPlain } from 'database';

const columns: ColumnDef<typeof CampaignPlain.static, unknown>[] = [
  {
    header: 'Name',
    accessorKey: 'code',
  },
  {
    accessorKey: 'code',
    header: 'Code',
  },
  {
    header: 'Type',
    accessorFn: (a) => {
      return a.type;
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
    header: 'Rate',
    accessorFn: (a) => {
      return a.isFixed
        ? new Intl.NumberFormat(navigator.language, {
            style: 'currency',
            currency: 'TRY',
          }).format(Number(a.value))
        : `${a.value}%`;
    },
  },
  {
    header: 'Actions',
    cell: () =>
      h(DataTableActions, {
        actions: [
          {
            title: 'Details',
            action: () => {},
            group: 'default',
            icon: Eye,
          },
          {
            title: 'Duplicate',
            action: () => {},
            group: 'default',
            icon: Copy,
          },
          {
            title: 'Edit',
            action: () => {},
            group: 'default',
            icon: Edit3,
          },

          {
            title: 'Delete',
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

async function fetchCampaigns(params: { page: number; max: number }) {
  const { data, error } = await client.v1.management.campaigns.get({
    query: { page: params.page, max: params.max },
  });
  if ((error && error.status !== 422) || !data) {
    const reason =
      error.status !== 422
        ? error.value.reason
        : 'Kampanyalar çekilirken hata yaşandı.';
    throw new Error(reason);
  }
  return data;
}
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl md:text-4xl font-semibold">Campaigns</h1>
    </div>
    <ServerDataTable :columns="columns" :fetch-page="fetchCampaigns" />
  </div>
</template>
