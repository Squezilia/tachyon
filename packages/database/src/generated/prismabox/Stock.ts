import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const StockPlain = t.Object(
  {
    id: t.String(),
    productId: t.String(),
    quantity: t.Integer(),
    minQuantity: t.Integer(),
    maxQuantity: __nullable__(t.Integer()),
    lastRestockedAt: __nullable__(t.Date()),
    organizationId: t.String(),
  },
  { additionalProperties: false },
);

export const StockRelations = t.Object(
  {
    product: t.Object(
      {
        id: t.String(),
        name: t.String(),
        price: t.String(),
        organizationId: t.String(),
        categoryId: t.String(),
        createdAt: t.Date(),
        deletedAt: __nullable__(t.Date()),
        deletedById: __nullable__(t.String()),
        campaignTargetId: __nullable__(t.String()),
      },
      { additionalProperties: false },
    ),
    stockMovements: t.Array(
      t.Object(
        {
          id: t.String(),
          stockId: t.String(),
          quantityChange: t.Integer(),
          reason: t.Union(
            [
              t.Literal("SALE"),
              t.Literal("RESTOCK"),
              t.Literal("ADJUSTMENT"),
              t.Literal("REVERSAL"),
            ],
            { additionalProperties: false },
          ),
          createdAt: t.Date(),
          createdById: t.String(),
          organizationId: t.String(),
        },
        { additionalProperties: false },
      ),
      { additionalProperties: false },
    ),
    organization: t.Object(
      {
        id: t.String(),
        name: t.String(),
        slug: __nullable__(t.String()),
        logo: __nullable__(t.String()),
        createdAt: t.Date(),
        metadata: __nullable__(t.String()),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const StockPlainInputCreate = t.Object(
  {
    quantity: t.Integer(),
    minQuantity: t.Optional(t.Integer()),
    maxQuantity: t.Optional(__nullable__(t.Integer())),
    lastRestockedAt: t.Optional(__nullable__(t.Date())),
  },
  { additionalProperties: false },
);

export const StockPlainInputUpdate = t.Object(
  {
    quantity: t.Optional(t.Integer()),
    minQuantity: t.Optional(t.Integer()),
    maxQuantity: t.Optional(__nullable__(t.Integer())),
    lastRestockedAt: t.Optional(__nullable__(t.Date())),
  },
  { additionalProperties: false },
);

export const StockRelationsInputCreate = t.Object(
  {
    product: t.Object(
      {
        connect: t.Object(
          {
            id: t.String({ additionalProperties: false }),
          },
          { additionalProperties: false },
        ),
      },
      { additionalProperties: false },
    ),
    stockMovements: t.Optional(
      t.Object(
        {
          connect: t.Array(
            t.Object(
              {
                id: t.String({ additionalProperties: false }),
              },
              { additionalProperties: false },
            ),
            { additionalProperties: false },
          ),
        },
        { additionalProperties: false },
      ),
    ),
    organization: t.Object(
      {
        connect: t.Object(
          {
            id: t.String({ additionalProperties: false }),
          },
          { additionalProperties: false },
        ),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const StockRelationsInputUpdate = t.Partial(
  t.Object(
    {
      product: t.Object(
        {
          connect: t.Object(
            {
              id: t.String({ additionalProperties: false }),
            },
            { additionalProperties: false },
          ),
        },
        { additionalProperties: false },
      ),
      stockMovements: t.Partial(
        t.Object(
          {
            connect: t.Array(
              t.Object(
                {
                  id: t.String({ additionalProperties: false }),
                },
                { additionalProperties: false },
              ),
              { additionalProperties: false },
            ),
            disconnect: t.Array(
              t.Object(
                {
                  id: t.String({ additionalProperties: false }),
                },
                { additionalProperties: false },
              ),
              { additionalProperties: false },
            ),
          },
          { additionalProperties: false },
        ),
      ),
      organization: t.Object(
        {
          connect: t.Object(
            {
              id: t.String({ additionalProperties: false }),
            },
            { additionalProperties: false },
          ),
        },
        { additionalProperties: false },
      ),
    },
    { additionalProperties: false },
  ),
);

export const StockWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          productId: t.String(),
          quantity: t.Integer(),
          minQuantity: t.Integer(),
          maxQuantity: t.Integer(),
          lastRestockedAt: t.Date(),
          organizationId: t.String(),
        },
        { additionalProperties: false },
      ),
    { $id: "Stock" },
  ),
);

export const StockWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            {
              id: t.String(),
              organizationId_productId: t.Object(
                { organizationId: t.String(), productId: t.String() },
                { additionalProperties: false },
              ),
            },
            { additionalProperties: false },
          ),
          { additionalProperties: false },
        ),
        t.Union(
          [
            t.Object({ id: t.String() }),
            t.Object({
              organizationId_productId: t.Object(
                { organizationId: t.String(), productId: t.String() },
                { additionalProperties: false },
              ),
            }),
          ],
          { additionalProperties: false },
        ),
        t.Partial(
          t.Object({
            AND: t.Union([
              Self,
              t.Array(Self, { additionalProperties: false }),
            ]),
            NOT: t.Union([
              Self,
              t.Array(Self, { additionalProperties: false }),
            ]),
            OR: t.Array(Self, { additionalProperties: false }),
          }),
          { additionalProperties: false },
        ),
        t.Partial(
          t.Object(
            {
              id: t.String(),
              productId: t.String(),
              quantity: t.Integer(),
              minQuantity: t.Integer(),
              maxQuantity: t.Integer(),
              lastRestockedAt: t.Date(),
              organizationId: t.String(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Stock" },
);

export const StockSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      product: t.Boolean(),
      productId: t.Boolean(),
      quantity: t.Boolean(),
      minQuantity: t.Boolean(),
      maxQuantity: t.Boolean(),
      lastRestockedAt: t.Boolean(),
      stockMovements: t.Boolean(),
      organization: t.Boolean(),
      organizationId: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const StockInclude = t.Partial(
  t.Object(
    {
      product: t.Boolean(),
      stockMovements: t.Boolean(),
      organization: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const StockOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      productId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      quantity: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      minQuantity: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      maxQuantity: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      lastRestockedAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      organizationId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const Stock = t.Composite([StockPlain, StockRelations], {
  additionalProperties: false,
});

export const StockInputCreate = t.Composite(
  [StockPlainInputCreate, StockRelationsInputCreate],
  { additionalProperties: false },
);

export const StockInputUpdate = t.Composite(
  [StockPlainInputUpdate, StockRelationsInputUpdate],
  { additionalProperties: false },
);
