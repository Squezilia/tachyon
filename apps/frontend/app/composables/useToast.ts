import { toast, ExternalToast } from 'vue-sonner';

export default async function useToast(
  title: string,
  options?: ExternalToast & { type?: 'error' | 'info' | 'success' }
) {
  const { $sound } = useNuxtApp();
  switch (options?.type) {
    case 'error':
      $sound.play('error');
      return toast.error(title, options);

    case 'success':
      $sound.play('success');
      return toast.success(title, options);

    default:
      $sound.play('info');
      return toast.info(title, options);
  }
}
