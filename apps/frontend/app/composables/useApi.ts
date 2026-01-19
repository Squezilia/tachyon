import type { UseFetchOptions } from '#app';

export default function useApi<T>(
  url: string | (() => string),
  options?: UseFetchOptions<T>
) {
  return useFetch(url, {
    ...options,
    $fetch: useNuxtApp().$api as typeof $fetch,
    credentials: 'include',
    responseType: 'json',
  });
}
