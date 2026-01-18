import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const CampaignTargetPlain = t.Object(
  {
    id: t.String(),
    active: t.Boolean(),
    type: t.Union([t.Literal("PRODUCTS"), t.Literal("CATEGORIES")], {
      additionalProperties: false,
    }),
    campaignId: __nullable__(t.String()),
  },
  { additionalProperties: false },
);

export const CampaignTargetRelations = t.Object(
  {
    products: t.Array(
      t.Object(
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
      { additionalProperties: false },
    ),
    categories: t.Array(
      t.Object(
        {
          id: t.String(),
          name: t.String(),
          organizationId: t.String(),
          createdAt: t.Date(),
          campaignTargetId: __nullable__(t.String()),
        },
        { additionalProperties: false },
      ),
      { additionalProperties: false },
    ),
    campaign: __nullable__(
      t.Object(
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
    ),
  },
  { additionalProperties: false },
);

export const CampaignTargetPlainInputCreate = t.Object(
  {
    active: t.Optional(t.Boolean()),
    type: t.Union([t.Literal("PRODUCTS"), t.Literal("CATEGORIES")], {
      additionalProperties: false,
    }),
  },
  { additionalProperties: false },
);

export const CampaignTargetPlainInputUpdate = t.Object(
  {
    active: t.Optional(t.Boolean()),
    type: t.Optional(
      t.Union([t.Literal("PRODUCTS"), t.Literal("CATEGORIES")], {
        additionalProperties: false,
      }),
    ),
  },
  { additionalProperties: false },
);

export const CampaignTargetRelationsInputCreate = t.Object(
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
    categories: t.Optional(
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
    campaign: t.Optional(
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

export const CampaignTargetRelationsInputUpdate = t.Partial(
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
      categories: t.Partial(
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
      campaign: t.Partial(
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

export const CampaignTargetWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          active: t.Boolean(),
          type: t.Union([t.Literal("PRODUCTS"), t.Literal("CATEGORIES")], {
            additionalProperties: false,
          }),
          campaignId: t.String(),
        },
        { additionalProperties: false },
      ),
    { $id: "CampaignTarget" },
  ),
);

export const CampaignTargetWhereUnique = t.Recursive(
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
              active: t.Boolean(),
              type: t.Union([t.Literal("PRODUCTS"), t.Literal("CATEGORIES")], {
                additionalProperties: false,
              }),
              campaignId: t.String(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "CampaignTarget" },
);

export const CampaignTargetSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      active: t.Boolean(),
      type: t.Boolean(),
      products: t.Boolean(),
      categories: t.Boolean(),
      campaign: t.Boolean(),
      campaignId: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const CampaignTargetInclude = t.Partial(
  t.Object(
    {
      type: t.Boolean(),
      products: t.Boolean(),
      categories: t.Boolean(),
      campaign: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const CampaignTargetOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      active: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      campaignId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const CampaignTarget = t.Composite(
  [CampaignTargetPlain, CampaignTargetRelations],
  { additionalProperties: false },
);

export const CampaignTargetInputCreate = t.Composite(
  [CampaignTargetPlainInputCreate, CampaignTargetRelationsInputCreate],
  { additionalProperties: false },
);

export const CampaignTargetInputUpdate = t.Composite(
  [CampaignTargetPlainInputUpdate, CampaignTargetRelationsInputUpdate],
  { additionalProperties: false },
);
