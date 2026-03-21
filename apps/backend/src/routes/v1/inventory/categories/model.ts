import { PaginateResponse } from '@/globals';
import {
  CategoryPlain,
  CategoryPlainInputCreate,
  CategoryPlainInputUpdate,
} from '@database/prismabox';
import Elysia, { t } from 'elysia';

export const CategoryRaw = t.Object({
  name: t.String(),
  id: t.String(),
});

export default new Elysia().model({
  category: CategoryPlain,
  categoryCreate: CategoryPlainInputCreate,
  categoryUpdate: CategoryPlainInputUpdate,
  categoryRawList: t.Array(CategoryRaw),
  categoryPaginated: PaginateResponse(CategoryPlain),
});
