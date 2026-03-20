import Elysia, { t, type TSchema } from 'elysia';

export const ErrorResponse = t.Object({
  error: t.String(),
  reason: t.String(),
});

export function CursorPaginateResponse<T extends TSchema>(type: T) {
  return t.Object({
    data: t.Array(type),
    meta: t.Object({
      cursor: t.Optional(t.String()),
      nextCursor: t.Optional(t.String()),
      cursorLength: t.Integer(),
    }),
  });
}

export function PaginateResponse<T extends TSchema>(type: T) {
  return t.Object({
    data: t.Array(type),
    meta: t.Object({
      total: t.Integer(),
      max: t.Integer(),
      page: t.Integer(),
    }),
  });
}

export function EditPaginationQuery<T extends TSchema>(type: T) {
  return t.Composite([
    t.Omit(
      type,
      t.Union([
        t.Literal('organizationId'),
        t.Literal('AND'),
        t.Literal('OR'),
        t.Literal('NOT'),
      ])
    ),
    PaginationQuery,
  ]);
}

export const PaginationQuery = t.Object({
  page: t.Integer({ default: 0 }),
  max: t.Integer({
    maximum: 50,
    minimum: 5,
    default: 25,
  }),
});

export const CursorPaginationQuery = t.Object({
  cursor: t.Optional(t.String()),
});

export default new Elysia().model({
  error: ErrorResponse,
  paginationQuery: PaginationQuery,
  cursorPaginationQuery: CursorPaginationQuery,
});
