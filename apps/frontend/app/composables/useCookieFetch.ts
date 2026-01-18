import type { UseFetchOptions } from '#app';

export default function useCookieApi<T>(
  url: string | (() => string),
  options?: UseFetchOptions<T>
) {
  return useFetch(url, {
    ...options,
    $fetch: useNuxtApp().$api as typeof $fetch,
    credentials: 'include',
  });
}
