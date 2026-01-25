<script setup lang="ts" generic="TData, TValue">
import type {
  ColumnDef,
  SortingState,
  VisibilityState,
  PaginationState,
} from '@tanstack/vue-table';
import {
  FlexRender,
  getCoreRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { valueUpdater } from '@/utils/valueUpdater';

export type ServerMeta = { max: number; page: number; total: number };

export type ServerPaginate<T> = {
  data: T[];
  meta: ServerMeta;
};

const props = defineProps<{
  columns: ColumnDef<TData, TValue>[];
  fetchPage: (params: { page: number; max: number }) => Promise<{
    data: TData[];
    meta: ServerMeta;
  }>;
  pageSizeOptions?: number[];
  initialPageSize?: number;
  updateState?: number;
}>();

const pageSizeOptions = computed(() => props.pageSizeOptions ?? [10, 20, 50]);

const pagination = ref<PaginationState>({
  pageIndex: 0,
  pageSize: props.initialPageSize ?? pageSizeOptions.value[0] ?? 10,
});

const sorting = ref<SortingState>([]);
const columnVisibility = ref<VisibilityState>({});

const rows = ref<TData[]>([]);
const meta = ref<ServerMeta>({
  page: 0,
  max: pagination.value.pageSize,
  total: 0,
});
const loading = ref(false);
const errorMsg = ref<string | null>(null);

async function loadServerPage() {
  loading.value = true;
  errorMsg.value = null;
  try {
    const { pageIndex, pageSize } = pagination.value;
    const res = await props.fetchPage({ page: pageIndex, max: pageSize });
    rows.value = res.data;
    meta.value = res.meta;
  } catch (e) {
    if (!(e instanceof Error)) return;
    errorMsg.value = e?.message ?? 'Veriler yüklenirken hata yaşandı.';
    rows.value = [];
    meta.value = { page: 0, max: pagination.value.pageSize, total: 0 };
  } finally {
    loading.value = false;
  }
}

watch(
  [
    () => [pagination.value.pageIndex, pagination.value.pageSize],
    () => props.updateState,
  ],
  async () => {
    await loadServerPage();
  },
  { immediate: true }
);

const table = useVueTable({
  get data() {
    return rows.value;
  },
  get columns() {
    return props.columns;
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  manualPagination: true,
  get pageCount() {
    const total = meta.value.total ?? 0;
    const size = meta.value.max ?? pagination.value.pageSize;
    return Math.max(1, Math.ceil(total / size));
  },
  onSortingChange: (updaterOrValue) => valueUpdater(updaterOrValue, sorting),
  onColumnVisibilityChange: (updaterOrValue) =>
    valueUpdater(updaterOrValue, columnVisibility),
  onPaginationChange: (updaterOrValue) =>
    valueUpdater(updaterOrValue, pagination),
  state: {
    get sorting() {
      return sorting.value;
    },
    get columnVisibility() {
      return columnVisibility.value;
    },
    get pagination() {
      return pagination.value;
    },
  },
});

function prevPage() {
  if (table.getCanPreviousPage()) table.previousPage();
}
function nextPage() {
  if (table.getCanNextPage()) table.nextPage();
}

// helpers kept minimal in simplified variant
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-sm text-muted-foreground">Sayfa başına satır</span>
        <Select
          :model-value="String(pagination.pageSize)"
          @update:model-value="(v: string) => (pagination.pageSize = Number(v))"
        >
          <SelectTrigger size="sm" class="h-8 w-[120px]">
            <SelectValue placeholder="Page size" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem
                v-for="opt in pageSizeOptions"
                :key="opt"
                :value="String(opt)"
              >
                {{ opt }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div class="text-sm text-muted-foreground">
        <span
          >Sayfa {{ pagination.pageIndex + 1 }} /
          {{ table.getPageCount() }}</span
        >
        <span class="ml-2">Toplam: {{ meta.total }}</span>
      </div>
    </div>

    <div class="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
          >
            <TableHead v-for="header in headerGroup.headers" :key="header.id">
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="!loading && table.getRowModel().rows.length">
            <TableRow v-for="row in table.getRowModel().rows" :key="row.id">
              <TableCell
                v-for="cell in row.getVisibleCells()"
                :key="cell.id"
                class="relative"
              >
                <FlexRender
                  :render="cell.column.columnDef.cell"
                  :props="cell.getContext()"
                />
              </TableCell>
            </TableRow>
          </template>
          <template v-else>
            <TableRow>
              <TableCell
                :colspan="props.columns.length"
                class="h-24 text-center"
              >
                <template v-if="loading">Yükleniyor...</template>
                <template v-else-if="errorMsg">{{ errorMsg }}</template>
                <template v-else>Sonuç yok.</template>
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>

    <div class="flex items-center justify-end gap-2 py-2">
      <ClientOnly>
        <Button
          variant="outline"
          size="sm"
          :disabled="!table.getCanPreviousPage()"
          @click="prevPage"
        >
          Geri
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="!table.getCanNextPage()"
          @click="nextPage"
        >
          İleri
        </Button>
      </ClientOnly>
    </div>
  </div>
</template>
