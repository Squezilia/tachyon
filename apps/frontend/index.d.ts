import type { Tabs } from '~/components/navigation/Navigation.vue';

declare module 'nuxt/schema' {
  interface AppConfig {
    navigation: Tabs;
    emailRegex: RegExp;
    passwordRegex: RegExp;
    nameRegex: RegExp;
  }
}
