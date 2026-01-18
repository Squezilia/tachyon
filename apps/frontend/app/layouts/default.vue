<template>
  <div
    class="[background-image:var(--background-grid)] bg-size-[20px_20px] h-screen min-h-screen"
  >
    <Header />
    <div
      class="py-24 container mx-auto md:px-8 px-2 bg-background min-h-screen h-screen border-x"
    >
      <slot />
    </div>
  </div>
</template>
