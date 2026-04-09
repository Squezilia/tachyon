<script setup lang="ts">
import type { Component } from 'vue';

defineEmits<{
  close: [];
}>();

export type ResourceType =
  | 'category'
  | 'product'
  | 'stock'
  | 'movement'
  | 'tax'
  | 'campaign'
  | 'sell'
  | 'order'
  | 'table';

const ViewTable: Record<ResourceType, Component> = {
  category: defineAsyncComponent(() => import('./CategoryDetail.vue')),
  campaign: defineAsyncComponent(() => import('./CampaignDetail.vue')),
  movement: defineAsyncComponent(() => import('./MovementDetail.vue')),
  order: defineAsyncComponent(() => import('./OrderDetail.vue')),
  product: defineAsyncComponent(() => import('./ProductDetail.vue')),
  sell: defineAsyncComponent(() => import('./SellDetail.vue')),
  stock: defineAsyncComponent(() => import('./StockDetail.vue')),
  table: defineAsyncComponent(() => import('./TableDetail.vue')),
  tax: defineAsyncComponent(() => import('./TaxDetail.vue')),
};

const detailsView = useDetailsView();

const selectedView = computed(() => {
  const res = detailsView.resource.value
    ? ViewTable[detailsView.resource.value]
    : null;

  if (res === null) detailsView.close();

  return res;
});
</script>

<template>
  <component :is="selectedView" v-if="selectedView" />
</template>
