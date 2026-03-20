import { PaginateResponse } from '@/globals';
import {
  CategoryPlain,
  CategoryPlainInputCreate,
  CategoryPlainInputUpdate,
} from '@database/prismabox';
import Elysia, { t } from 'elysia';

export default new Elysia().model({
  category: CategoryPlain,
  categoryCreate: CategoryPlainInputCreate,
  categoryUpdate: CategoryPlainInputUpdate,
  categoryRawList: t.Array(
    t.Object({
      name: t.String(),
      id: t.String(),
    })
  ),
  categoryPaginated: PaginateResponse(CategoryPlain),
});
