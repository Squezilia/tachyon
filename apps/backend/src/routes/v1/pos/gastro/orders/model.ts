import { PaginateResponse } from '@/globals';
import { OrderPlain } from '@database/prismabox/Order';
import Elysia, { t } from 'elysia';

export const OrderWithIssuerName = t.Composite([
  OrderPlain,
  t.Object({
    issuer: t.Object({ name: t.String() }),
  }),
]);

export default new Elysia().model({
  orderWithIssuerName: OrderWithIssuerName,
  orderPaginated: PaginateResponse(OrderWithIssuerName),
});
