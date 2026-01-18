import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const InvitationPlain = t.Object(
  {
    id: t.String(),
    organizationId: t.String(),
    email: t.String(),
    role: __nullable__(t.String()),
    status: t.String(),
    expiresAt: t.Date(),
    inviterId: t.String(),
  },
  { additionalProperties: false },
);

export const InvitationRelations = t.Object(
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
    user: t.Object(
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

export const InvitationPlainInputCreate = t.Object(
  {
    email: t.String(),
    role: t.Optional(__nullable__(t.String())),
    status: t.String(),
    expiresAt: t.Date(),
  },
  { additionalProperties: false },
);

export const InvitationPlainInputUpdate = t.Object(
  {
    email: t.Optional(t.String()),
    role: t.Optional(__nullable__(t.String())),
    status: t.Optional(t.String()),
    expiresAt: t.Optional(t.Date()),
  },
  { additionalProperties: false },
);

export const InvitationRelationsInputCreate = t.Object(
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
    user: t.Object(
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

export const InvitationRelationsInputUpdate = t.Partial(
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
      user: t.Object(
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

export const InvitationWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          organizationId: t.String(),
          email: t.String(),
          role: t.String(),
          status: t.String(),
          expiresAt: t.Date(),
          inviterId: t.String(),
        },
        { additionalProperties: false },
      ),
    { $id: "Invitation" },
  ),
);

export const InvitationWhereUnique = t.Recursive(
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
              organizationId: t.String(),
              email: t.String(),
              role: t.String(),
              status: t.String(),
              expiresAt: t.Date(),
              inviterId: t.String(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Invitation" },
);

export const InvitationSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      organizationId: t.Boolean(),
      organization: t.Boolean(),
      email: t.Boolean(),
      role: t.Boolean(),
      status: t.Boolean(),
      expiresAt: t.Boolean(),
      inviterId: t.Boolean(),
      user: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const InvitationInclude = t.Partial(
  t.Object(
    { organization: t.Boolean(), user: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const InvitationOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      organizationId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      email: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      role: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      status: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      expiresAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      inviterId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const Invitation = t.Composite([InvitationPlain, InvitationRelations], {
  additionalProperties: false,
});

export const InvitationInputCreate = t.Composite(
  [InvitationPlainInputCreate, InvitationRelationsInputCreate],
  { additionalProperties: false },
);

export const InvitationInputUpdate = t.Composite(
  [InvitationPlainInputUpdate, InvitationRelationsInputUpdate],
  { additionalProperties: false },
);
