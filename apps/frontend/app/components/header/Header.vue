<script setup lang="ts">
import { authClient } from '~/lib/auth';
import Skeleton from '../ui/skeleton/Skeleton.vue';
import UserContext from './UserContext.vue';
import NoUserContext from './NoUserContext.vue';
import type { Tab } from '../navigation/Navigation.vue';
import NavTabs from '../navigation/NavTabs.vue';
const session = authClient.useSession();

const tabs = ref<Tab>({
  default: '',
  routes: {
    Hizmetler: '/',
    Ücretlendirme: '',
    İletişim: '',
    Yardım: '',
  },
});
</script>

<template>
  <header
    class="z-50 w-full fixed top-0 left-0 flex items-center justify-center md:px-12 px-4"
  >
    <div
      class="h-14 z-50 bg-navigation px-2.5 rounded-xl backdrop-blur-sm border rounded-t-none border-t-0 max-w-[1300px] w-full flex justify-between"
    >
      <div class="flex items-center">
        <div class="flex gap-2.5 items-center">
          <NuxtLink to="/">
            <Skeleton class="size-8 ml-1 rounded-lg" />
          </NuxtLink>
        </div>
        <NavTabs :tab="tabs" class="h-14!" />
      </div>
      <UserContext v-if="session.data" />
      <NoUserContext v-else />

      <div class="absolute -top-px -right-3.5 size-3.5 bg-navigation">
        <div
          class="absolute top-0 right-0 size-3.5 rounded-full border-l border-t rounded-b-none rounded-tr-none bg-background"
        ></div>
      </div>
      <div class="absolute -top-px -left-3.5 size-3.5 bg-navigation">
        <div
          class="absolute top-0 left-0 size-3.5 rounded-full border-r border-t rounded-b-none rounded-tl-none bg-background"
        ></div>
      </div>
    </div>
    <div
      class="fixed bg-linear-to-b z-10 h-24 from-background from-10% to-background/0 top-0 left-0 w-screen"
    ></div>
  </header>
</template>
