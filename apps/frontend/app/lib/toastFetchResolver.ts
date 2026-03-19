import type { ErrorResponseSchema } from '@backend/model';
import type {
  AvailableRouterMethod,
  NitroFetchOptions,
  NitroFetchRequest,
} from 'nitropack/types';

export default function toastFetchResolver(options: {
  resolve: (message: string) => void;
  reject: (message: string) => void;
  success: string;
  callback?: string;
}): NitroFetchOptions<
  NitroFetchRequest,
  AvailableRouterMethod<NitroFetchRequest>
> {
  return {
    async onResponseError({ response }) {
      if (response.ok) return;
      const body = response._data as typeof ErrorResponseSchema.static;
      if (response.status === 401) navigateTo('/login');
      options.reject(body.error);
    },
    async onResponse({ response }) {
      if (!response.ok) return;
      options.resolve(options.success);
      if (options.callback) navigateTo(options.callback);
    },
  };
}
