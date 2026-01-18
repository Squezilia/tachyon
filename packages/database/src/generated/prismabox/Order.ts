import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const OrderPlain = t.Object(
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
);

export const OrderRelations = t.Object(
  {
    products: t.Array(
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
          sellId: __nullable__(t.String()),
          orderId: __nullable__(t.String()),
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
    payment: __nullable__(
      t.Object(
        {
          id: t.String(),
          amount: t.String(),
          method: t.Union(
            [
              t.Literal("CASH"),
              t.Literal("CREDIT_CARD"),
              t.Literal("DEBIT_CARD"),
              t.Literal("MOBILE_PAYMENT"),
            ],
            { additionalProperties: false },
          ),
          status: t.Union(
            [
              t.Literal("PENDING"),
              t.Literal("COMPLETED"),
              t.Literal("FAILED"),
              t.Literal("REFUNDED"),
            ],
            { additionalProperties: false },
          ),
          sellId: t.String(),
          orderId: t.String(),
          createdAt: t.Date(),
          paidAt: __nullable__(t.Date()),
        },
        { additionalProperties: false },
      ),
    ),
    campaignApplications: t.Array(
      t.Object(
        {
          id: t.String(),
          campaignId: t.String(),
          discountAmount: t.String(),
          productId: t.String(),
          sellId: __nullable__(t.String()),
          orderId: __nullable__(t.String()),
          appliedAt: t.Date(),
        },
        { additionalProperties: false },
      ),
      { additionalProperties: false },
    ),
    issuer: t.Object(
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
    table: __nullable__(
      t.Object(
        { id: t.String(), name: t.String(), organizationId: t.String() },
        { additionalProperties: false },
      ),
    ),
  },
  { additionalProperties: false },
);

export const OrderPlainInputCreate = t.Object(
  {
    status: t.Optional(
      t.Union([t.Literal("OPEN"), t.Literal("CLOSED")], {
        additionalProperties: false,
      }),
    ),
  },
  { additionalProperties: false },
);

export const OrderPlainInputUpdate = t.Object(
  {
    status: t.Optional(
      t.Union([t.Literal("OPEN"), t.Literal("CLOSED")], {
        additionalProperties: false,
      }),
    ),
  },
  { additionalProperties: false },
);

export const OrderRelationsInputCreate = t.Object(
  {
    products: t.Optional(
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
    payment: t.Optional(
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
    campaignApplications: t.Optional(
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
    issuer: t.Object(
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
    table: t.Optional(
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

export const OrderRelationsInputUpdate = t.Partial(
  t.Object(
    {
      products: t.Partial(
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
      payment: t.Partial(
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
      campaignApplications: t.Partial(
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
      issuer: t.Object(
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
      table: t.Partial(
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

export const OrderWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          status: t.Union([t.Literal("OPEN"), t.Literal("CLOSED")], {
            additionalProperties: false,
          }),
          createdAt: t.Date(),
          updatedAt: t.Date(),
          organizationId: t.String(),
          issuerId: t.String(),
          tableId: t.String(),
        },
        { additionalProperties: false },
      ),
    { $id: "Order" },
  ),
);

export const OrderWhereUnique = t.Recursive(
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
              status: t.Union([t.Literal("OPEN"), t.Literal("CLOSED")], {
                additionalProperties: false,
              }),
              createdAt: t.Date(),
              updatedAt: t.Date(),
              organizationId: t.String(),
              issuerId: t.String(),
              tableId: t.String(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Order" },
);

export const OrderSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      products: t.Boolean(),
      status: t.Boolean(),
      createdAt: t.Boolean(),
      updatedAt: t.Boolean(),
      organization: t.Boolean(),
      organizationId: t.Boolean(),
      payment: t.Boolean(),
      campaignApplications: t.Boolean(),
      issuer: t.Boolean(),
      issuerId: t.Boolean(),
      table: t.Boolean(),
      tableId: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const OrderInclude = t.Partial(
  t.Object(
    {
      products: t.Boolean(),
      status: t.Boolean(),
      organization: t.Boolean(),
      payment: t.Boolean(),
      campaignApplications: t.Boolean(),
      issuer: t.Boolean(),
      table: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const OrderOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      createdAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      updatedAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      organizationId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      issuerId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      tableId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const Order = t.Composite([OrderPlain, OrderRelations], {
  additionalProperties: false,
});

export const OrderInputCreate = t.Composite(
  [OrderPlainInputCreate, OrderRelationsInputCreate],
  { additionalProperties: false },
);

export const OrderInputUpdate = t.Composite(
  [OrderPlainInputUpdate, OrderRelationsInputUpdate],
  { additionalProperties: false },
);
