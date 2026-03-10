<script setup lang="ts">
import type { ColumnDef } from '@tanstack/vue-table';
import { h } from 'vue';
import ServerDataTable from '~/components/DataTable.vue';
import { Button } from '@/components/ui/button';
import { Copy, Edit3, Eye, Trash2 } from 'lucide-vue-next';
import DataTableActions from '~/components/DataTableActions.vue';
import { authClient } from '~/lib/auth';
import type { organizationSettings } from '@backend/lib/organizations';
import type { InferMember } from 'better-auth/plugins/organization';
import toLocaleDate from '~/lib/toLocaleDate';

type OrganizationMember = InferMember<typeof organizationSettings>;

const columns: ColumnDef<OrganizationMember, unknown>[] = [
  {
    header: 'Name',
    accessorKey: 'code',
  },
  {
    accessorKey: 'code',
    header: 'Code',
  },
  {
    accessorFn: (a) => {
      return a.user.name;
    },
    header: 'Ad',
    cell: ({ row }) => toLocaleDate(new Date(row.getValue('createdAt'))),
  },
  {
    accessorFn: (a) => {
      return a.user.email;
    },
    header: 'E-Posta',
  },
  {
    accessorKey: 'createdAt',
    header: 'Tarih',
    cell: ({ row }) => toLocaleDate(new Date(row.getValue('createdAt'))),
  },
  {
    header: 'Type',
    accessorFn: (a) => {
      return a.role;
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

async function fetchMembers() {
  const organization = authClient.useActiveOrganization();

  if (!organization.value.data)
    throw new Error(String('Failed to fetch members'));

  const data = organization.value.data.members;

  return data;
}
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl md:text-4xl font-semibold">Üyeler</h1>
    </div>
    <!-- <ServerDataTable :columns="columns" /> -->
  </div>
</template>
