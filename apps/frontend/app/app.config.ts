export default defineAppConfig({
  navigation: {
    Analitikler: {
      default: '/dash/analytics',
      routes: {
        'İşlenmiş Analitikler': '/dash/analytics/aggregated',
        'Saf Analitikler': '/dash/analytics/raw',
      },
    },
    POS: {
      default: '/dash/pos',
      routes: {
        Satışlar: '/dash/pos/sells',
        Siparişler: '/dash/pos/orders',
      },
    },
    Envanter: {
      default: '/dash/inventory',
      routes: {
        Ürünler: '/dash/inventory/products',
        Kategoriler: '/dash/inventory/categories',
        Stoklar: '/dash/inventory/stocks',
        Hareketler: '/dash/inventory/audit',
      },
    },
    Yönetim: {
      default: '/dash/management',
      routes: {
        Genel: '/dash/management/general',
        Vergiler: '/dash/management/taxes',
        Kampanyalar: '/dash/management/campaigns',
        Üyeler: '/dash/management/members',
      },
    },
  },
  emailRegex:
    /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
  passwordRegex:
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-.]).{8,}$/,
  nameRegex: /^[a-z ,.'-]+$/i,
});
