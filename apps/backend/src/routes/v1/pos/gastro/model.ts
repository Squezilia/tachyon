import { OrderPlain } from '@database/prismabox/Order';
import Elysia, { t } from 'elysia';

export default new Elysia().model({
  order: OrderPlain,
  createOrder: t.Object({
    tableId: t.Optional(t.String()),
    stocks: t.Record(t.String(), t.Integer()),
  }),
  updateOrder: t.Object({
    stocks: t.Record(t.String(), t.Integer()),
  }),
});
