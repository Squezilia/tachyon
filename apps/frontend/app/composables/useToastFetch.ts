import {
  NitroFetchOptions,
  NitroFetchRequest,
  AvailableRouterMethod,
} from 'nitropack/types';
import { toast } from 'vue-sonner';
import toastFetchResolver from '~/lib/toastFetchResolver';

export default async function useToastFetch(
  uri: string,
  options: {
    fetchOptions?: NitroFetchOptions<
      NitroFetchRequest,
      AvailableRouterMethod<NitroFetchRequest>
    >;
    toastOptions: {
      loading: string;
      success: string;
      onSuccess?: () => void;
      onError?: () => void;
      onResult?: () => void;
    };
  }
) {
  const { $api, $sound } = useNuxtApp();
  return toast.promise<string>(
    new Promise((resolve, reject) =>
      $api(uri, {
        ...toastFetchResolver({
          reject,
          resolve,
          success: options.toastOptions.success,
        }),
        ...options.fetchOptions,
      })
    ),
    {
      loading: options.toastOptions.loading,
      success: (data: string) => {
        $sound.play('success');
        if (options.toastOptions.onResult) options.toastOptions.onResult();
        if (options.toastOptions.onSuccess) options.toastOptions.onSuccess();
        return data;
      },
      error: (data: string) => {
        $sound.play('error');
        if (options.toastOptions.onResult) options.toastOptions.onResult();
        if (options.toastOptions.onError) options.toastOptions.onError();
        return data;
      },
    }
  );
}
