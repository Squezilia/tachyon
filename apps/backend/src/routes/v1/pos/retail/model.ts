import { SellPlain } from '@database/prismabox/Sell';
import Elysia, { t } from 'elysia';

export default new Elysia().model({
  sell: SellPlain,
  createSell: t.Object({
    stocks: t.Record(t.String(), t.Integer()),
    campaigns: t.Array(t.String()),
  }),
  refundSell: t.Object({
    reverseStocks: t.Boolean(),
  }),
});
