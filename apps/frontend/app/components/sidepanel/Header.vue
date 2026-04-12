<script setup lang="ts">
import { X } from 'lucide-vue-next';
</script>

<template>
  <div class="flex items-center gap-2 p-2.5 py-1.5 border-b">
    <DetailHeading
      class="flex text-sm items-center gap-2 truncate text-ellipsis max-w-67"
    >
      <slot />
    </DetailHeading>

    <Button
      variant="ghost"
      size="icon"
      class="ml-auto size-6"
      @click="useSideView().close"
    >
      <X />
    </Button>
  </div>
</template>
