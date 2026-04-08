<script setup lang="ts">
import { motion } from 'motion-v';
import CategoryDetail from './CategoryDetail.vue';
import ProductDetail from './ProductDetail.vue';
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

const detailsView = useDetailsView();

const selectedView = computed(() => {
  switch (detailsView.resource.value) {
    case 'category':
      return CategoryDetail;

    case 'product':
      return ProductDetail;
  }

  return null;
});
</script>

<template>
  <component :is="selectedView" v-if="selectedView" />
</template>
