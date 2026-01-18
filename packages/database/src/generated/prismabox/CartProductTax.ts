import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const CartProductTaxPlain = t.Object(
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
);

export const CartProductTaxRelations = t.Object(
  {
    cartProduct: t.Object(
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
    ),
    tax: t.Object(
      {
        id: t.String(),
        name: t.String(),
        priority: t.Integer(),
        rate: t.String(),
        isFixed: t.Boolean(),
        isCumulative: t.Boolean(),
        organizationId: t.String(),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const CartProductTaxPlainInputCreate = t.Object(
  {
    taxName: t.String(),
    isFixed: t.Boolean(),
    priority: t.Integer(),
    taxRate: t.String(),
    taxAmount: t.String(),
    baseAmount: t.String(),
  },
  { additionalProperties: false },
);

export const CartProductTaxPlainInputUpdate = t.Object(
  {
    taxName: t.Optional(t.String()),
    isFixed: t.Optional(t.Boolean()),
    priority: t.Optional(t.Integer()),
    taxRate: t.Optional(t.String()),
    taxAmount: t.Optional(t.String()),
    baseAmount: t.Optional(t.String()),
  },
  { additionalProperties: false },
);

export const CartProductTaxRelationsInputCreate = t.Object(
  {
    cartProduct: t.Object(
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
    tax: t.Object(
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

export const CartProductTaxRelationsInputUpdate = t.Partial(
  t.Object(
    {
      cartProduct: t.Object(
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
      tax: t.Object(
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

export const CartProductTaxWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
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
    { $id: "CartProductTax" },
  ),
);

export const CartProductTaxWhereUnique = t.Recursive(
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
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "CartProductTax" },
);

export const CartProductTaxSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      cartProduct: t.Boolean(),
      cartProductId: t.Boolean(),
      tax: t.Boolean(),
      taxId: t.Boolean(),
      taxName: t.Boolean(),
      isFixed: t.Boolean(),
      priority: t.Boolean(),
      taxRate: t.Boolean(),
      taxAmount: t.Boolean(),
      baseAmount: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const CartProductTaxInclude = t.Partial(
  t.Object(
    { cartProduct: t.Boolean(), tax: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const CartProductTaxOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      cartProductId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      taxId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      taxName: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      isFixed: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      priority: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      taxRate: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      taxAmount: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      baseAmount: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const CartProductTax = t.Composite(
  [CartProductTaxPlain, CartProductTaxRelations],
  { additionalProperties: false },
);

export const CartProductTaxInputCreate = t.Composite(
  [CartProductTaxPlainInputCreate, CartProductTaxRelationsInputCreate],
  { additionalProperties: false },
);

export const CartProductTaxInputUpdate = t.Composite(
  [CartProductTaxPlainInputUpdate, CartProductTaxRelationsInputUpdate],
  { additionalProperties: false },
);
