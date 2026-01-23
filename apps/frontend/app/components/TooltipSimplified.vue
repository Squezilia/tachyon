<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

defineProps<{
  text: string;
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <Tooltip>
    <TooltipTrigger :class="$props.class">
      <slot />
    </TooltipTrigger>
    <TooltipContent>{{ text }}</TooltipContent>
  </Tooltip>
</template>
