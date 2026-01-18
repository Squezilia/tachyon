import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const CampaignAvailabilityPlain = t.Object(
  {
    id: t.String(),
    active: t.Boolean(),
    before: __nullable__(t.Date()),
    after: __nullable__(t.Date()),
    campaignId: __nullable__(t.String()),
  },
  { additionalProperties: false },
);

export const CampaignAvailabilityRelations = t.Object(
  {
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

export const CampaignAvailabilityPlainInputCreate = t.Object(
  {
    active: t.Optional(t.Boolean()),
    before: t.Optional(__nullable__(t.Date())),
    after: t.Optional(__nullable__(t.Date())),
  },
  { additionalProperties: false },
);

export const CampaignAvailabilityPlainInputUpdate = t.Object(
  {
    active: t.Optional(t.Boolean()),
    before: t.Optional(__nullable__(t.Date())),
    after: t.Optional(__nullable__(t.Date())),
  },
  { additionalProperties: false },
);

export const CampaignAvailabilityRelationsInputCreate = t.Object(
  {
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

export const CampaignAvailabilityRelationsInputUpdate = t.Partial(
  t.Object(
    {
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

export const CampaignAvailabilityWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          active: t.Boolean(),
          before: t.Date(),
          after: t.Date(),
          campaignId: t.String(),
        },
        { additionalProperties: false },
      ),
    { $id: "CampaignAvailability" },
  ),
);

export const CampaignAvailabilityWhereUnique = t.Recursive(
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
              before: t.Date(),
              after: t.Date(),
              campaignId: t.String(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "CampaignAvailability" },
);

export const CampaignAvailabilitySelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      active: t.Boolean(),
      before: t.Boolean(),
      after: t.Boolean(),
      campaign: t.Boolean(),
      campaignId: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const CampaignAvailabilityInclude = t.Partial(
  t.Object(
    { campaign: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const CampaignAvailabilityOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      active: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      before: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      after: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      campaignId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const CampaignAvailability = t.Composite(
  [CampaignAvailabilityPlain, CampaignAvailabilityRelations],
  { additionalProperties: false },
);

export const CampaignAvailabilityInputCreate = t.Composite(
  [
    CampaignAvailabilityPlainInputCreate,
    CampaignAvailabilityRelationsInputCreate,
  ],
  { additionalProperties: false },
);

export const CampaignAvailabilityInputUpdate = t.Composite(
  [
    CampaignAvailabilityPlainInputUpdate,
    CampaignAvailabilityRelationsInputUpdate,
  ],
  { additionalProperties: false },
);
