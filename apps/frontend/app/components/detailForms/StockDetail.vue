<script setup lang="ts">
import OpenDetailsButton from './OpenDetailsButton.vue';
import { Separator } from '../ui/separator';
import useDetailsView from '~/composables/useDetailsView';
import SidepanelHeader from '~/components/sidepanel/Header.vue';
import DetailHeading from '../DetailHeading.vue';
import ItemList from '~/components/itemList/index.vue';
import ItemListItemArrow from '~/components/itemList/ItemArrow.vue';
import ItemListItem from '~/components/itemList/Item.vue';
import Chip from '../Chip.vue';

const detailsView = useDetailsView();
</script>

<template>
  <SidepanelHeader class="mb-2.5">
    <OpenDetailsButton
      :to="`/dash/inventory/stocks/${detailsView.target.value}`"
    />
    Stok Detayları
  </SidepanelHeader>

  <div class="p-2.5 pt-0 flex flex-col gap-2.5">
    <div class="flex items-center w-full gap-2.5">
      <div class="flex flex-col">
        <DetailHeading class="scroll-m-0">Stock</DetailHeading>
        <span class="text-xs opacity-60">Product</span>
      </div>
      <Chip class="text-xs ml-auto">
        {{ Math.round(Math.random() * 20) }}/{{ 20 }}
      </Chip>
    </div>
    <div class="flex items-center justify-around w-full">
      <div>
        <DetailHeading class="text-sm">Created At</DetailHeading>
        <span class="text-xs">19 Jul 2019</span>
      </div>
      <Separator orientation="vertical" class="h-full" />
      <div>
        <DetailHeading class="text-sm">Restocked By</DetailHeading>
        <span class="text-xs flex items-center gap-1.5">
          <Avatar class="size-5">
            <AvatarImage src="" />
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          Adam
        </span>
      </div>
      <Separator orientation="vertical" class="h-full" />
      <div>
        <DetailHeading class="text-sm">Last Restock</DetailHeading>
        <span class="text-xs">19 Jul 2019</span>
      </div>
    </div>

    <Separator orientation="horizontal" class="w-full" />

    <DetailHeading class="font-heading">Product</DetailHeading>
    <div class="border rounded-xl">
      <ItemListItem @click="detailsView.open('0', 'product')">
        <Skeleton class="size-8" />
        <div class="flex items-start flex-col">
          <span class="text-sm">Product</span>
          <span class="text-xs opacity-70">Category</span>
        </div>
        <ItemListItemArrow />
      </ItemListItem>
    </div>

    <Separator orientation="horizontal" class="w-full" />

    <DetailHeading class="font-heading">Movements (20)</DetailHeading>
    <ItemList>
      <div v-for="n in 20" :key="n">
        <ItemListItem @click="detailsView.open(n + '', 'stock')">
          <Skeleton class="size-8 shrink-0" />
          <div class="flex w-full items-center">
            <div class="items-start w-full flex flex-col">
              <span class="text-sm flex w-full items-center">19 Jul 2019 </span>
              <span class="text-xs opacity-70">Product</span>
            </div>
            <Chip class="text-xs ml-auto opacity-70 h-5 px-1.5">{{
              Math.round(Math.random() * 500) - 250
            }}</Chip>
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
