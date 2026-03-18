import { ProductPlain, StockPlain } from '@database/prismabox';
import { t } from 'elysia';

export const StockListItem = t.Composite([
  StockPlain,
  t.Object({ product: ProductPlain }),
]);
