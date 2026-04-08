<script setup lang="ts">
import { ArrowRight, Edit3 } from 'lucide-vue-next';
import OpenDetailsButton from './OpenDetailsButton.vue';

const detailsView = useDetailsView();
</script>

<template>
  <SidepanelHeader>
    <OpenDetailsButton
      :to="`/dash/inventory/categories/${detailsView.target.value}`"
    />
    Kategori Detayları
  </SidepanelHeader>

  <div class="p-2.5 pt-0 flex flex-col gap-2.5">
    <SmallHeading class="flex group/name">
      Category Name
      <NuxtLink
        :to="`/dash/inventory/categories/${detailsView.target.value}/update`"
        class="ml-auto opacity-0 transition-opacity group-hover/name:opacity-75"
      >
        <Button class="size-8" variant="ghost" size="icon"><Edit3 /></Button>
      </NuxtLink>
    </SmallHeading>

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
