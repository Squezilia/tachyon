import { PaginateResponse } from '@/globals';
import { SellPlain } from '@database/prismabox/Sell';
import Elysia from 'elysia';

export default new Elysia().model({
  sellPaginated: PaginateResponse(SellPlain),
});
