<script setup lang="ts">
import { ArrowRight, Edit3 } from 'lucide-vue-next';
import OpenDetailsButton from './OpenDetailsButton.vue';
import { ScrollArea } from '../ui/scroll-area';

const detailsView = useDetailsView();
</script>

<template>
  <SidepanelHeader>
    <OpenDetailsButton
      :to="`/dash/inventory/products/${detailsView.target.value}`"
    />
    Ürün Detayları
  </SidepanelHeader>

  <div class="p-2.5 pt-0 flex flex-col gap-2">
    <SmallHeading class="flex group/name">
      Product Name
      <NuxtLink
        :to="`/dash/inventory/products/${detailsView.target.value}/update`"
        class="ml-auto opacity-0 transition-opacity group-hover/name:opacity-75"
      >
        <Button class="size-8" variant="ghost" size="icon"><Edit3 /></Button>
      </NuxtLink>
    </SmallHeading>

    <AlternateHeading> Category </AlternateHeading>
    <button
      class="border rounded-xl p-2.5 flex cursor-pointer group/category items-center"
      @click="detailsView.open('0', 'category')"
    >
      <DetailHeading>Category 1</DetailHeading>
      <ArrowRight
        class="opacity-0 ml-auto group-hover/category:opacity-75 size-4 transition mr-1.5"
      />
    </button>

    <AlternateHeading>Stocks</AlternateHeading>
    <ScrollArea class="max-h-60 border rounded-xl group/area">
      <div v-for="n in 8" :key="n">
        <button
          class="flex transition items-center gap-4 p-2.5 group-hover/area:opacity-40 hover:opacity-100! group/productListItem cursor-pointer w-full"
          @click="detailsView.open(n + '', 'stock')"
        >
          <div class="flex flex-col">
            <DetailHeading>Stocks {{ n }}</DetailHeading>
          </div>
          <Chip>19/20</Chip>
          <ArrowRight
            class="size-4 opacity-0 ml-auto mr-1.5 group-hover/productListItem:opacity-75 transition"
          />
        </button>
        <Separator
          v-if="n !== 8"
          orientation="horizontal"
          class="mx-auto max-w-[75%]"
        />
      </div>
    </ScrollArea>
  </div>
</template>
