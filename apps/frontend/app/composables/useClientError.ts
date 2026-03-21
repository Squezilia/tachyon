import { EdenFetchError } from '@elysiajs/eden';
import { ErrorResponse } from '@backend/globals';

export default function useClientError(error: EdenFetchError) {
  if (error.value) {
    const res = error.value as typeof ErrorResponse.static;
    if (res.error && res.reason) {
      useToast(res.error, { description: res.reason, type: 'error' });
      return;
    }
    useToast('Bilinmeyen bir hata ile karşılaşıldı.', { type: 'error' });
    return;
  }
  useToast(
    'Sunucuya erişilemiyor, internet bağlantınızı kontrol edin lütfen.',
    { type: 'error' }
  );
}
