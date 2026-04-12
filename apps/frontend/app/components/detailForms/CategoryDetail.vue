<script setup lang="ts">
import OpenDetailsButton from './OpenDetailsButton.vue';
import { Separator } from '../ui/separator';

const detailsView = useDetailsView();
</script>

<template>
  <SidepanelHeader class="mb-1.5">
    <OpenDetailsButton
      :to="`/dash/inventory/categories/${detailsView.target.value}`"
    />
    Kategori Detayları
  </SidepanelHeader>

  <div class="p-2.5 pt-0 flex flex-col gap-2.5">
    <div class="flex items-center w-full gap-2.5">
      <div class="flex flex-col">
        <DetailHeading class="scroll-m-0">Category</DetailHeading>
      </div>
    </div>
    <div class="flex items-center justify-around w-full">
      <div>
        <DetailHeading class="text-sm">Created At</DetailHeading>
        <span class="text-xs">19 Jul 2019</span>
      </div>
      <Separator orientation="vertical" class="h-full" />
      <div>
        <DetailHeading class="text-sm">Created By</DetailHeading>
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
        <DetailHeading class="text-sm">Updated At</DetailHeading>
        <span class="text-xs">19 Jul 2019</span>
      </div>
    </div>

    <Separator orientation="horizontal" class="w-full" />

    <DetailHeading class="font-heading">Products (20)</DetailHeading>
    <ItemList>
      <div v-for="n in 20" :key="n">
        <ItemListItem @click="detailsView.open(n + '', 'product')">
          <Skeleton class="size-8" />
          <div class="flex items-start flex-col">
            <span class="text-sm">Product {{ n }}</span>
            <span class="text-xs opacity-70">Category</span>
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
