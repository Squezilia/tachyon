import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const CampaignPlain = t.Object(
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
);

export const CampaignRelations = t.Object(
  {
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
    application: t.Array(
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
    availabilities: t.Array(
      t.Object(
        {
          id: t.String(),
          active: t.Boolean(),
          before: __nullable__(t.Date()),
          after: __nullable__(t.Date()),
          campaignId: __nullable__(t.String()),
        },
        { additionalProperties: false },
      ),
      { additionalProperties: false },
    ),
    targets: t.Array(
      t.Object(
        {
          id: t.String(),
          active: t.Boolean(),
          type: t.Union([t.Literal("PRODUCTS"), t.Literal("CATEGORIES")], {
            additionalProperties: false,
          }),
          campaignId: __nullable__(t.String()),
        },
        { additionalProperties: false },
      ),
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const CampaignPlainInputCreate = t.Object(
  {
    name: t.String(),
    code: t.String(),
    value: t.String(),
    isFixed: t.Optional(t.Boolean()),
    type: t.Union([t.Literal("BASKET"), t.Literal("PRODUCT")], {
      additionalProperties: false,
    }),
  },
  { additionalProperties: false },
);

export const CampaignPlainInputUpdate = t.Object(
  {
    name: t.Optional(t.String()),
    code: t.Optional(t.String()),
    value: t.Optional(t.String()),
    isFixed: t.Optional(t.Boolean()),
    type: t.Optional(
      t.Union([t.Literal("BASKET"), t.Literal("PRODUCT")], {
        additionalProperties: false,
      }),
    ),
  },
  { additionalProperties: false },
);

export const CampaignRelationsInputCreate = t.Object(
  {
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
    application: t.Optional(
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
    availabilities: t.Optional(
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
    targets: t.Optional(
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
  },
  { additionalProperties: false },
);

export const CampaignRelationsInputUpdate = t.Partial(
  t.Object(
    {
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
      application: t.Partial(
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
      availabilities: t.Partial(
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
      targets: t.Partial(
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
    },
    { additionalProperties: false },
  ),
);

export const CampaignWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
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
    { $id: "Campaign" },
  ),
);

export const CampaignWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            {
              id: t.String(),
              organizationId_code: t.Object(
                { organizationId: t.String(), code: t.String() },
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
              organizationId_code: t.Object(
                { organizationId: t.String(), code: t.String() },
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
      ],
      { additionalProperties: false },
    ),
  { $id: "Campaign" },
);

export const CampaignSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      name: t.Boolean(),
      code: t.Boolean(),
      value: t.Boolean(),
      isFixed: t.Boolean(),
      type: t.Boolean(),
      organization: t.Boolean(),
      organizationId: t.Boolean(),
      application: t.Boolean(),
      availabilities: t.Boolean(),
      targets: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const CampaignInclude = t.Partial(
  t.Object(
    {
      type: t.Boolean(),
      organization: t.Boolean(),
      application: t.Boolean(),
      availabilities: t.Boolean(),
      targets: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const CampaignOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      name: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      code: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      value: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      isFixed: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      organizationId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const Campaign = t.Composite([CampaignPlain, CampaignRelations], {
  additionalProperties: false,
});

export const CampaignInputCreate = t.Composite(
  [CampaignPlainInputCreate, CampaignRelationsInputCreate],
  { additionalProperties: false },
);

export const CampaignInputUpdate = t.Composite(
  [CampaignPlainInputUpdate, CampaignRelationsInputUpdate],
  { additionalProperties: false },
);
