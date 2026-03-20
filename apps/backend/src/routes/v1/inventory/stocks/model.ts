import { PaginateResponse } from '@/globals';
import {
  ProductPlain,
  StockMovementPlain,
  StockMovementPlainInputCreate,
  StockPlain,
  StockPlainInputCreate,
} from '@database/prismabox';
import Elysia, { t } from 'elysia';

export const StockListItem = t.Composite([
  StockPlain,
  t.Object({ product: ProductPlain }),
]);

export default new Elysia().model({
  stockListItem: StockListItem,
  stock: StockPlain,
  stockCreate: t.Composite([
    StockPlainInputCreate,
    t.Object({ productId: t.String() }),
  ]),
  stockPaginated: PaginateResponse(StockListItem),
  movement: StockMovementPlain,
  movementsPaginated: PaginateResponse(
    t.Composite([
      StockMovementPlain,
      t.Object({ createdBy: t.Object({ name: t.String() }) }),
    ])
  ),
  move: t.Intersect([
    StockMovementPlainInputCreate,
    t.Object({
      quantityChange: t.Integer({
        minimum: 1,
      }),
    }),
  ]),
});
