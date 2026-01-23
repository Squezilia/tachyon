<script setup lang="ts">
import Navigation from '~/components/navigation/Navigation.vue';
</script>

<template>
  <TooltipProvider :delay-duration="800">
    <main>
      <Navigation />
      <div
        id="container"
        class="[background-image:var(--background-grid)] bg-size-[20px_20px] min-h-screen flex"
      >
        <div
          class="py-6 z-10 container mx-auto md:px-8 px-2 bg-background min-h-screen border-x shadow-[0_0_2rem_0]/10"
        >
          <slot />
        </div>
      </div>
    </main>
  </TooltipProvider>
</template>
