import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const StockMovementPlain = t.Object(
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
);

export const StockMovementRelations = t.Object(
  {
    stock: t.Object(
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
    ),
    createdBy: t.Object(
      {
        id: t.String(),
        name: t.String(),
        email: t.String(),
        emailVerified: t.Boolean(),
        image: __nullable__(t.String()),
        createdAt: t.Date(),
        updatedAt: t.Date(),
        role: __nullable__(t.String()),
        banned: __nullable__(t.Boolean()),
        banReason: __nullable__(t.String()),
        banExpires: __nullable__(t.Date()),
        twoFactorEnabled: __nullable__(t.Boolean()),
      },
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

export const StockMovementPlainInputCreate = t.Object(
  {
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
  },
  { additionalProperties: false },
);

export const StockMovementPlainInputUpdate = t.Object(
  {
    quantityChange: t.Optional(t.Integer()),
    reason: t.Optional(
      t.Union(
        [
          t.Literal("SALE"),
          t.Literal("RESTOCK"),
          t.Literal("ADJUSTMENT"),
          t.Literal("REVERSAL"),
        ],
        { additionalProperties: false },
      ),
    ),
  },
  { additionalProperties: false },
);

export const StockMovementRelationsInputCreate = t.Object(
  {
    stock: t.Object(
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
    createdBy: t.Object(
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

export const StockMovementRelationsInputUpdate = t.Partial(
  t.Object(
    {
      stock: t.Object(
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
      createdBy: t.Object(
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

export const StockMovementWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
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
    { $id: "StockMovement" },
  ),
);

export const StockMovementWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object({ id: t.String() }, { additionalProperties: false }),
          { additionalProperties: false },
        ),
        t.Union([t.Object({ id: t.String() })], {
          additionalProperties: false,
        }),
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
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "StockMovement" },
);

export const StockMovementSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      stock: t.Boolean(),
      stockId: t.Boolean(),
      quantityChange: t.Boolean(),
      reason: t.Boolean(),
      createdAt: t.Boolean(),
      createdBy: t.Boolean(),
      createdById: t.Boolean(),
      organization: t.Boolean(),
      organizationId: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const StockMovementInclude = t.Partial(
  t.Object(
    {
      stock: t.Boolean(),
      reason: t.Boolean(),
      createdBy: t.Boolean(),
      organization: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const StockMovementOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      stockId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      quantityChange: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      createdAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      createdById: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      organizationId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const StockMovement = t.Composite(
  [StockMovementPlain, StockMovementRelations],
  { additionalProperties: false },
);

export const StockMovementInputCreate = t.Composite(
  [StockMovementPlainInputCreate, StockMovementRelationsInputCreate],
  { additionalProperties: false },
);

export const StockMovementInputUpdate = t.Composite(
  [StockMovementPlainInputUpdate, StockMovementRelationsInputUpdate],
  { additionalProperties: false },
);
