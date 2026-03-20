import { PaginateResponse } from '@/globals';
import {
  TablePlain,
  TablePlainInputCreate,
  TablePlainInputUpdate,
} from '@database/prismabox/Table';
import Elysia from 'elysia';

export default new Elysia().model({
  table: TablePlain,
  createTable: TablePlainInputCreate,
  updateTable: TablePlainInputUpdate,
  tablePaginated: PaginateResponse(TablePlain),
});
