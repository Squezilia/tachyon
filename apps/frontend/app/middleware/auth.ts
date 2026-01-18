import { authClient } from '~/lib/auth';

export default defineNuxtRouteMiddleware(async () => {
  if (!import.meta.client) return;

  const { data: session } = await authClient.useSession(useCookieFetch);

  if (!session.value) {
    authClient.signOut();
    return navigateTo('/login');
  }
});
