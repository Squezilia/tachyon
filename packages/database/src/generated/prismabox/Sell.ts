import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const SellPlain = t.Object(
  {
    id: t.String(),
    createdAt: t.Date(),
    isReversal: t.Boolean(),
    reversedSellId: __nullable__(t.String()),
    organizationId: t.String(),
    issuerId: t.String(),
  },
  { additionalProperties: false },
);

export const SellRelations = t.Object(
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
    reversedSell: __nullable__(
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
    reversalOf: __nullable__(
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
  },
  { additionalProperties: false },
);

export const SellPlainInputCreate = t.Object(
  { isReversal: t.Optional(t.Boolean()) },
  { additionalProperties: false },
);

export const SellPlainInputUpdate = t.Object(
  { isReversal: t.Optional(t.Boolean()) },
  { additionalProperties: false },
);

export const SellRelationsInputCreate = t.Object(
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
    reversedSell: t.Optional(
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
    reversalOf: t.Optional(
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
  },
  { additionalProperties: false },
);

export const SellRelationsInputUpdate = t.Partial(
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
      reversedSell: t.Partial(
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
      reversalOf: t.Partial(
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
    },
    { additionalProperties: false },
  ),
);

export const SellWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          createdAt: t.Date(),
          isReversal: t.Boolean(),
          reversedSellId: t.String(),
          organizationId: t.String(),
          issuerId: t.String(),
        },
        { additionalProperties: false },
      ),
    { $id: "Sell" },
  ),
);

export const SellWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            { id: t.String(), reversedSellId: t.String() },
            { additionalProperties: false },
          ),
          { additionalProperties: false },
        ),
        t.Union(
          [
            t.Object({ id: t.String() }),
            t.Object({ reversedSellId: t.String() }),
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
              createdAt: t.Date(),
              isReversal: t.Boolean(),
              reversedSellId: t.String(),
              organizationId: t.String(),
              issuerId: t.String(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Sell" },
);

export const SellSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      products: t.Boolean(),
      createdAt: t.Boolean(),
      isReversal: t.Boolean(),
      reversedSell: t.Boolean(),
      reversedSellId: t.Boolean(),
      reversalOf: t.Boolean(),
      organization: t.Boolean(),
      organizationId: t.Boolean(),
      payment: t.Boolean(),
      campaignApplications: t.Boolean(),
      issuer: t.Boolean(),
      issuerId: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const SellInclude = t.Partial(
  t.Object(
    {
      products: t.Boolean(),
      reversedSell: t.Boolean(),
      reversalOf: t.Boolean(),
      organization: t.Boolean(),
      payment: t.Boolean(),
      campaignApplications: t.Boolean(),
      issuer: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const SellOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      createdAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      isReversal: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      reversedSellId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      organizationId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      issuerId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const Sell = t.Composite([SellPlain, SellRelations], {
  additionalProperties: false,
});

export const SellInputCreate = t.Composite(
  [SellPlainInputCreate, SellRelationsInputCreate],
  { additionalProperties: false },
);

export const SellInputUpdate = t.Composite(
  [SellPlainInputUpdate, SellRelationsInputUpdate],
  { additionalProperties: false },
);
