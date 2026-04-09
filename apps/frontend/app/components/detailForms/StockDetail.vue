<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next';
import OpenDetailsButton from './OpenDetailsButton.vue';

const detailsView = useDetailsView();
</script>

<template>
  <SidepanelHeader>
    <OpenDetailsButton
      :to="`/dash/inventory/categories/${detailsView.target.value}`"
    />
    Stok Detayları
  </SidepanelHeader>

  <div class="p-2.5 pt-0 flex flex-col gap-2.5">
    <AlternateHeading> Product </AlternateHeading>
    <button
      class="border rounded-xl p-2.5 flex cursor-pointer group/category items-center"
      @click="detailsView.open('0', 'product')"
    >
      <DetailHeading>Product 1</DetailHeading>
      <ArrowRight
        class="opacity-0 ml-auto group-hover/category:opacity-75 size-4 transition mr-1.5"
      />
    </button>

    <AlternateHeading>Products</AlternateHeading>
    <ScrollArea class="max-h-60 border rounded-xl group/area">
      <div v-for="n in 20" :key="n">
        <button
          class="flex transition items-center gap-4 p-2.5 group-hover/area:opacity-40 hover:opacity-100! group/productListItem cursor-pointer w-full"
          @click="detailsView.open(n + '', 'product')"
        >
          <Skeleton class="size-8" />
          <div class="flex flex-col">
            <DetailHeading>Product {{ n }}</DetailHeading>
          </div>
          <ArrowRight
            class="size-4 opacity-0 ml-auto mr-1.5 group-hover/productListItem:opacity-75 transition"
          />
        </button>
        <Separator
          v-if="n !== 20"
          orientation="horizontal"
          class="mx-auto max-w-[75%]"
        />
      </div>
    </ScrollArea>
  </div>
</template>
