<script setup lang="ts">
import { AlignRight } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
</script>

<template>
  <ClientOnly>
    <Drawer>
      <DrawerTrigger>
        <Button variant="outline" size="icon">
          <AlignRight />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div class="flex flex-col p-8 gap-12">
          <div class="flex flex-col gap-1.5">
            <h3 class="text-lg text-muted-foreground">Temel Sayfalar</h3>
            <div class="flex flex-col gap-2.5">
              <NuxtLink class="text-xl" to="/"> Ana Sayfa </NuxtLink>
              <NuxtLink class="text-xl" to="/"> Hizmetler </NuxtLink>
              <NuxtLink class="text-xl" to="/pricing"> Ücretlendirme </NuxtLink>
              <NuxtLink class="text-xl" to="/"> Yardım </NuxtLink>
              <NuxtLink class="text-xl" to="/"> Hakkımızda </NuxtLink>
            </div>
          </div>
          <div class="flex flex-col gap-1.5">
            <h3 class="text-lg text-muted-foreground">Hareket Alın</h3>
            <div class="flex flex-col gap-2.5">
              <NuxtLink class="text-xl" to="/login"> Giriş Yap </NuxtLink>
              <NuxtLink class="text-xl" to="/register"> Hemen Başla </NuxtLink>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  </ClientOnly>
</template>
