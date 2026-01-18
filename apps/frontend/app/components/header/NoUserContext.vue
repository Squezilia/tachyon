<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next';
import MobileContext from './MobileContext.vue';
</script>

<template>
  <div class="hidden items-center gap-2.5 lg:flex">
    <NuxtLink to="/login">
      <Button variant="outline"> Oturum Aç </Button>
    </NuxtLink>
    <NuxtLink to="/register">
      <Button>
        Şimdi Başla
        <ArrowRight />
      </Button>
    </NuxtLink>
  </div>
  <div class="flex lg:hidden items-center">
    <MobileContext />
  </div>
</template>
