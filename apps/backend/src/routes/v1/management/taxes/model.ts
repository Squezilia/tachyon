import { PaginateResponse } from '@/globals';
import {
  TaxPlain,
  TaxPlainInputCreate,
  TaxPlainInputUpdate,
} from '@database/prismabox/Tax';
import Elysia from 'elysia';

export default new Elysia().model({
  tax: TaxPlain,
  createTax: TaxPlainInputCreate,
  updateTax: TaxPlainInputUpdate,
  taxPaginated: PaginateResponse(TaxPlain),
});
