<script setup lang="ts">
import { ArrowLeftFromLine } from 'lucide-vue-next';
import type { RouteLocationAsString } from 'vue-router';
import useSideView from '~/composables/useSideView';

defineProps<{
  to: RouteLocationAsString;
}>();
</script>

<template>
  <Button
    variant="ghost"
    size="icon"
    class="size-6"
    @click="
      () => {
        useSideView().close();
        navigateTo(to);
      }
    "
  >
    <ArrowLeftFromLine />
  </Button>
</template>
