import { authClient } from '~/lib/auth';
import useCookieApi from '~/composables/useCookieFetch';

export default defineNuxtRouteMiddleware(async () => {
  if (!import.meta.client) return;

  const { data: session } = await authClient.useSession(useCookieApi);

  if (!session.value) {
    authClient.signOut();
    return navigateTo('/login');
  }
});
