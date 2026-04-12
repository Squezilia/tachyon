<script setup lang="ts">
import OpenDetailsButton from './OpenDetailsButton.vue';
import { Separator } from '../ui/separator';

const detailsView = useDetailsView();
</script>

<template>
  <SidepanelHeader class="mb-2.5">
    <OpenDetailsButton
      :to="`/dash/inventory/products/${detailsView.target.value}`"
    />
    Ürün Detayları
  </SidepanelHeader>

  <div class="p-2.5 pt-0 flex flex-col gap-2.5">
    <div class="flex items-center gap-2.5">
      <Skeleton class="size-10" />
      <div class="flex flex-col">
        <DetailHeading class="scroll-m-0">Product Name</DetailHeading>
        <span class="text-xs opacity-60">Category</span>
      </div>
    </div>
    <div class="flex items-center justify-around w-full">
      <div>
        <DetailHeading class="text-sm">Created At</DetailHeading>
        <span class="text-xs">19 Jul 2019</span>
      </div>
      <Separator orientation="vertical" class="h-full" />
      <div>
        <DetailHeading class="text-sm">Price</DetailHeading>
        <span class="text-xs flex items-center gap-1.5"> 1,195.50₺ </span>
      </div>
      <Separator orientation="vertical" class="h-full" />
      <div>
        <DetailHeading class="text-sm">Updated At</DetailHeading>
        <span class="text-xs">19 Jul 2019</span>
      </div>
    </div>

    <Separator orientation="horizontal" class="w-full" />

    <DetailHeading class="font-heading">Category</DetailHeading>
    <div class="border rounded-xl">
      <ItemListItem @click="detailsView.open('0', 'category')">
        <Skeleton class="size-8" />
        <div class="flex items-start flex-col">
          <span class="text-sm">Category</span>
        </div>
        <ItemListItemArrow />
      </ItemListItem>
    </div>

    <Separator orientation="horizontal" class="w-full" />

    <DetailHeading class="font-heading">Stocks (20)</DetailHeading>
    <ItemList>
      <div v-for="n in 20" :key="n">
        <ItemListItem @click="detailsView.open(n + '', 'stock')">
          <Skeleton class="size-8 shrink-0" />
          <div class="flex items-start w-full flex-col">
            <span class="text-sm flex w-full items-center"
              >Stock {{ n }}
              <Chip class="text-xs ml-auto opacity-70 px-1 h-4"
                >{{ Math.round(Math.random() * n) }}/{{ n }}</Chip
              >
            </span>
          </div>
          <ItemListItemArrow />
        </ItemListItem>
        <Separator
          v-if="n !== 20"
          orientation="horizontal"
          class="mx-auto max-w-[75%]"
        />
      </div>
    </ItemList>
  </div>
</template>
