<script setup lang="ts">
import { Badge } from './ui/badge';
</script>

<template>
  <Badge
    variant="outline"
    class="rounded-sm px-1 [&_svg:not([class*='size-'])]:size-2.5 pr-1.5 cursor-pointer transition hover:bg-input/30"
  >
    <slot />
  </Badge>
</template>
