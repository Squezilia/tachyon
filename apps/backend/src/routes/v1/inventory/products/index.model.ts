import { CategoryPlain, ProductPlain } from '@database';
import { t } from 'elysia';

export const ProductListItem = t.Composite([
  ProductPlain,
  t.Object({ category: CategoryPlain }),
]);
