<script setup lang="ts">
import { useColorMode } from '@vueuse/core';
import { Toaster } from '@/components/ui/sonner';
import 'vue-sonner/style.css';

useColorMode().value = 'auto';
</script>

<template>
  <Toaster />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
