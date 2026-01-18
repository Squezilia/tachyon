import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const CartProductPlain = t.Object(
  {
    id: t.String(),
    quantity: t.Integer(),
    productId: t.String(),
    productName: t.String(),
    priceAtSale: t.String(),
    subtotal: t.String(),
    totalTax: t.String(),
    total: t.String(),
    sellId: __nullable__(t.String()),
    orderId: __nullable__(t.String()),
  },
  { additionalProperties: false },
);

export const CartProductRelations = t.Object(
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
    appliedTaxes: t.Array(
      t.Object(
        {
          id: t.String(),
          cartProductId: t.String(),
          taxId: t.String(),
          taxName: t.String(),
          isFixed: t.Boolean(),
          priority: t.Integer(),
          taxRate: t.String(),
          taxAmount: t.String(),
          baseAmount: t.String(),
        },
        { additionalProperties: false },
      ),
      { additionalProperties: false },
    ),
    sell: __nullable__(
      t.Object(
        {
          id: t.String(),
          createdAt: t.Date(),
          isReversal: t.Boolean(),
          reversedSellId: __nullable__(t.String()),
          organizationId: t.String(),
          issuerId: t.String(),
        },
        { additionalProperties: false },
      ),
    ),
    order: __nullable__(
      t.Object(
        {
          id: t.String(),
          status: t.Union([t.Literal("OPEN"), t.Literal("CLOSED")], {
            additionalProperties: false,
          }),
          createdAt: t.Date(),
          updatedAt: t.Date(),
          organizationId: t.String(),
          issuerId: t.String(),
          tableId: __nullable__(t.String()),
        },
        { additionalProperties: false },
      ),
    ),
  },
  { additionalProperties: false },
);

export const CartProductPlainInputCreate = t.Object(
  {
    quantity: t.Integer(),
    productName: t.String(),
    priceAtSale: t.String(),
    subtotal: t.String(),
    totalTax: t.String(),
    total: t.String(),
  },
  { additionalProperties: false },
);

export const CartProductPlainInputUpdate = t.Object(
  {
    quantity: t.Optional(t.Integer()),
    productName: t.Optional(t.String()),
    priceAtSale: t.Optional(t.String()),
    subtotal: t.Optional(t.String()),
    totalTax: t.Optional(t.String()),
    total: t.Optional(t.String()),
  },
  { additionalProperties: false },
);

export const CartProductRelationsInputCreate = t.Object(
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
    appliedTaxes: t.Optional(
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
    sell: t.Optional(
      t.Object(
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
    ),
    order: t.Optional(
      t.Object(
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
    ),
  },
  { additionalProperties: false },
);

export const CartProductRelationsInputUpdate = t.Partial(
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
      appliedTaxes: t.Partial(
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
      sell: t.Partial(
        t.Object(
          {
            connect: t.Object(
              {
                id: t.String({ additionalProperties: false }),
              },
              { additionalProperties: false },
            ),
            disconnect: t.Boolean(),
          },
          { additionalProperties: false },
        ),
      ),
      order: t.Partial(
        t.Object(
          {
            connect: t.Object(
              {
                id: t.String({ additionalProperties: false }),
              },
              { additionalProperties: false },
            ),
            disconnect: t.Boolean(),
          },
          { additionalProperties: false },
        ),
      ),
    },
    { additionalProperties: false },
  ),
);

export const CartProductWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          quantity: t.Integer(),
          productId: t.String(),
          productName: t.String(),
          priceAtSale: t.String(),
          subtotal: t.String(),
          totalTax: t.String(),
          total: t.String(),
          sellId: t.String(),
          orderId: t.String(),
        },
        { additionalProperties: false },
      ),
    { $id: "CartProduct" },
  ),
);

export const CartProductWhereUnique = t.Recursive(
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
              quantity: t.Integer(),
              productId: t.String(),
              productName: t.String(),
              priceAtSale: t.String(),
              subtotal: t.String(),
              totalTax: t.String(),
              total: t.String(),
              sellId: t.String(),
              orderId: t.String(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "CartProduct" },
);

export const CartProductSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      quantity: t.Boolean(),
      product: t.Boolean(),
      productId: t.Boolean(),
      productName: t.Boolean(),
      priceAtSale: t.Boolean(),
      appliedTaxes: t.Boolean(),
      subtotal: t.Boolean(),
      totalTax: t.Boolean(),
      total: t.Boolean(),
      sell: t.Boolean(),
      sellId: t.Boolean(),
      order: t.Boolean(),
      orderId: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const CartProductInclude = t.Partial(
  t.Object(
    {
      product: t.Boolean(),
      appliedTaxes: t.Boolean(),
      sell: t.Boolean(),
      order: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const CartProductOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      quantity: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      productId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      productName: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      priceAtSale: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      subtotal: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      totalTax: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      total: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      sellId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      orderId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const CartProduct = t.Composite(
  [CartProductPlain, CartProductRelations],
  { additionalProperties: false },
);

export const CartProductInputCreate = t.Composite(
  [CartProductPlainInputCreate, CartProductRelationsInputCreate],
  { additionalProperties: false },
);

export const CartProductInputUpdate = t.Composite(
  [CartProductPlainInputUpdate, CartProductRelationsInputUpdate],
  { additionalProperties: false },
);
