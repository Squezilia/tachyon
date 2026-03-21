import { PaginateResponse } from '@/globals';
import {
  CategoryPlain,
  ProductPlain,
  ProductPlainInputCreate,
  ProductPlainInputUpdate,
} from '@database/prismabox';
import Elysia, { t } from 'elysia';

export const ProductRaw = t.Object({
  name: t.String(),
  id: t.String(),
  price: t.String(),
});

export const ProductListItem = t.Composite([
  ProductPlain,
  t.Object({ category: CategoryPlain }),
]);

export default new Elysia().model({
  paginatedProduct: PaginateResponse(ProductListItem),
  productListItem: ProductListItem,
  productListRaw: t.Array(ProductRaw),
  product: ProductPlain,
  productCreate: t.Composite([
    ProductPlainInputCreate,
    t.Object({
      categoryId: t.String(),
    }),
  ]),
  productUpdate: t.Composite([
    ProductPlainInputUpdate,
    t.Object({ categoryId: t.Optional(t.String()) }),
  ]),
});
