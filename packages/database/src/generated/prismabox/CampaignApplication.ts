import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const CampaignApplicationPlain = t.Object(
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
);

export const CampaignApplicationRelations = t.Object(
  {
    campaign: t.Object(
      {
        id: t.String(),
        name: t.String(),
        code: t.String(),
        value: t.String(),
        isFixed: t.Boolean(),
        type: t.Union([t.Literal("BASKET"), t.Literal("PRODUCT")], {
          additionalProperties: false,
        }),
        organizationId: t.String(),
      },
      { additionalProperties: false },
    ),
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

export const CampaignApplicationPlainInputCreate = t.Object(
  { discountAmount: t.String(), appliedAt: t.Optional(t.Date()) },
  { additionalProperties: false },
);

export const CampaignApplicationPlainInputUpdate = t.Object(
  { discountAmount: t.Optional(t.String()), appliedAt: t.Optional(t.Date()) },
  { additionalProperties: false },
);

export const CampaignApplicationRelationsInputCreate = t.Object(
  {
    campaign: t.Object(
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

export const CampaignApplicationRelationsInputUpdate = t.Partial(
  t.Object(
    {
      campaign: t.Object(
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

export const CampaignApplicationWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          campaignId: t.String(),
          discountAmount: t.String(),
          productId: t.String(),
          sellId: t.String(),
          orderId: t.String(),
          appliedAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    { $id: "CampaignApplication" },
  ),
);

export const CampaignApplicationWhereUnique = t.Recursive(
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
              campaignId: t.String(),
              discountAmount: t.String(),
              productId: t.String(),
              sellId: t.String(),
              orderId: t.String(),
              appliedAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "CampaignApplication" },
);

export const CampaignApplicationSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      campaign: t.Boolean(),
      campaignId: t.Boolean(),
      discountAmount: t.Boolean(),
      product: t.Boolean(),
      productId: t.Boolean(),
      sell: t.Boolean(),
      sellId: t.Boolean(),
      order: t.Boolean(),
      orderId: t.Boolean(),
      appliedAt: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const CampaignApplicationInclude = t.Partial(
  t.Object(
    {
      campaign: t.Boolean(),
      product: t.Boolean(),
      sell: t.Boolean(),
      order: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const CampaignApplicationOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      campaignId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      discountAmount: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      productId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      sellId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      orderId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      appliedAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const CampaignApplication = t.Composite(
  [CampaignApplicationPlain, CampaignApplicationRelations],
  { additionalProperties: false },
);

export const CampaignApplicationInputCreate = t.Composite(
  [
    CampaignApplicationPlainInputCreate,
    CampaignApplicationRelationsInputCreate,
  ],
  { additionalProperties: false },
);

export const CampaignApplicationInputUpdate = t.Composite(
  [
    CampaignApplicationPlainInputUpdate,
    CampaignApplicationRelationsInputUpdate,
  ],
  { additionalProperties: false },
);
