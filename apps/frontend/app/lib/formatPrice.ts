const DEFAULT_LOCALE = 'en-US';

export function formatPrice(
  amount: number | string,
  currency = 'TRY',
  locale = DEFAULT_LOCALE
) {
  const numeric = typeof amount === 'string' ? Number(amount) : amount;
  if (Number.isNaN(numeric)) return '—';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(numeric);
}

export default formatPrice;
