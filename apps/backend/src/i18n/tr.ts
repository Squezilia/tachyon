import type Language from '.';

export default {
  error: {
    organization: {
      noActive: {
        error: 'Organizasyon seçili değil.',
        reason: 'Aktif seçili organizasyon bulunmamaktadır.',
      },
      insufficentPermission: {
        error: 'Geçersiz yetki',
        reason:
          'Bu eylemi gerçekleştirmek için gereken yetkiye sahip değilsiniz.',
      },
    },
    retail: {
      stockError: {
        error: 'Hatalı Stok',
        reason:
          'Girilen stok detayları hatalı, verinin güncelliğini kontrol edin.',
      },
      sellIsAlreadyReversed: {
        error: 'Satış zaten iade edilmiş.',
        reason: 'İadesi istenilen satışın halihazırda bir iadesi bulunmakta.',
      },
      notFound: {
        error: 'Satış Bulunamadı',
        reason: 'İstenilen satış sistemde mevcut değil.',
      },
    },
    campaign: {
      notFound: {
        error: 'Kampanya Bulunamadı',
        reason: 'İstenilen kampanya sistemde mevcut değil.',
      },
    },
    product: {
      notFound: {
        error: 'Ürün Bulunamadı',
        reason: 'İstenilen ürün sistemde mevcut değil.',
      },
    },
    category: {
      notFound: {
        error: 'Kategori Bulunamadı',
        reason: 'İstenilen kategori sistemde mevcut değil.',
      },
    },
    tax: {
      notFound: {
        error: 'Vergi Bulunamadı',
        reason: 'İstenilen vergi sistemde mevcut değil.',
      },
    },
    assistant: {
      notFound: {
        error: 'Sohbet Bulunamadı',
        reason: 'İstenilen sohbet sistemde mevcut değil.',
      },
    },
  },
} satisfies Language;
