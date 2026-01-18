<script setup lang="ts">
import Navigation from '~/components/navigation/Navigation.vue';
</script>

<template>
  <main>
    <Navigation />
    <div
      class="[background-image:var(--background-grid)] bg-size-[20px_20px] min-h-screen"
    >
      <div
        class="py-6 container mx-auto md:px-8 px-2 bg-background min-h-screen border-x"
      >
        <slot />
      </div>
    </div>
  </main>
</template>
