import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const PaymentPlain = t.Object(
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
);

export const PaymentRelations = t.Object(
  {
    sell: t.Object(
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
    order: t.Object(
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
  },
  { additionalProperties: false },
);

export const PaymentPlainInputCreate = t.Object(
  {
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
    status: t.Optional(
      t.Union(
        [
          t.Literal("PENDING"),
          t.Literal("COMPLETED"),
          t.Literal("FAILED"),
          t.Literal("REFUNDED"),
        ],
        { additionalProperties: false },
      ),
    ),
    paidAt: t.Optional(__nullable__(t.Date())),
  },
  { additionalProperties: false },
);

export const PaymentPlainInputUpdate = t.Object(
  {
    amount: t.Optional(t.String()),
    method: t.Optional(
      t.Union(
        [
          t.Literal("CASH"),
          t.Literal("CREDIT_CARD"),
          t.Literal("DEBIT_CARD"),
          t.Literal("MOBILE_PAYMENT"),
        ],
        { additionalProperties: false },
      ),
    ),
    status: t.Optional(
      t.Union(
        [
          t.Literal("PENDING"),
          t.Literal("COMPLETED"),
          t.Literal("FAILED"),
          t.Literal("REFUNDED"),
        ],
        { additionalProperties: false },
      ),
    ),
    paidAt: t.Optional(__nullable__(t.Date())),
  },
  { additionalProperties: false },
);

export const PaymentRelationsInputCreate = t.Object(
  {
    sell: t.Object(
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
    order: t.Object(
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

export const PaymentRelationsInputUpdate = t.Partial(
  t.Object(
    {
      sell: t.Object(
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
      order: t.Object(
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

export const PaymentWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
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
          paidAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    { $id: "Payment" },
  ),
);

export const PaymentWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            { id: t.String(), sellId: t.String(), orderId: t.String() },
            { additionalProperties: false },
          ),
          { additionalProperties: false },
        ),
        t.Union(
          [
            t.Object({ id: t.String() }),
            t.Object({ sellId: t.String() }),
            t.Object({ orderId: t.String() }),
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
              paidAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Payment" },
);

export const PaymentSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      amount: t.Boolean(),
      method: t.Boolean(),
      status: t.Boolean(),
      sell: t.Boolean(),
      sellId: t.Boolean(),
      order: t.Boolean(),
      orderId: t.Boolean(),
      createdAt: t.Boolean(),
      paidAt: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const PaymentInclude = t.Partial(
  t.Object(
    {
      method: t.Boolean(),
      status: t.Boolean(),
      sell: t.Boolean(),
      order: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const PaymentOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      amount: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      sellId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      orderId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      createdAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      paidAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const Payment = t.Composite([PaymentPlain, PaymentRelations], {
  additionalProperties: false,
});

export const PaymentInputCreate = t.Composite(
  [PaymentPlainInputCreate, PaymentRelationsInputCreate],
  { additionalProperties: false },
);

export const PaymentInputUpdate = t.Composite(
  [PaymentPlainInputUpdate, PaymentRelationsInputUpdate],
  { additionalProperties: false },
);
