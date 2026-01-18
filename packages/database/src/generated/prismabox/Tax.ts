import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const TaxPlain = t.Object(
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
);

export const TaxRelations = t.Object(
  {
    appliedProducts: t.Array(
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
    appliedCategories: t.Array(
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
    cartProductTaxes: t.Array(
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
  },
  { additionalProperties: false },
);

export const TaxPlainInputCreate = t.Object(
  {
    name: t.String(),
    priority: t.Integer(),
    rate: t.String(),
    isFixed: t.Optional(t.Boolean()),
    isCumulative: t.Optional(t.Boolean()),
  },
  { additionalProperties: false },
);

export const TaxPlainInputUpdate = t.Object(
  {
    name: t.Optional(t.String()),
    priority: t.Optional(t.Integer()),
    rate: t.Optional(t.String()),
    isFixed: t.Optional(t.Boolean()),
    isCumulative: t.Optional(t.Boolean()),
  },
  { additionalProperties: false },
);

export const TaxRelationsInputCreate = t.Object(
  {
    appliedProducts: t.Optional(
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
    appliedCategories: t.Optional(
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
    cartProductTaxes: t.Optional(
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

export const TaxRelationsInputUpdate = t.Partial(
  t.Object(
    {
      appliedProducts: t.Partial(
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
      appliedCategories: t.Partial(
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
      cartProductTaxes: t.Partial(
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

export const TaxWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
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
    { $id: "Tax" },
  ),
);

export const TaxWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            {
              id: t.String(),
              organizationId_name: t.Object(
                { organizationId: t.String(), name: t.String() },
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
              organizationId_name: t.Object(
                { organizationId: t.String(), name: t.String() },
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
              priority: t.Integer(),
              rate: t.String(),
              isFixed: t.Boolean(),
              isCumulative: t.Boolean(),
              organizationId: t.String(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Tax" },
);

export const TaxSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      name: t.Boolean(),
      priority: t.Boolean(),
      rate: t.Boolean(),
      isFixed: t.Boolean(),
      isCumulative: t.Boolean(),
      appliedProducts: t.Boolean(),
      appliedCategories: t.Boolean(),
      organization: t.Boolean(),
      organizationId: t.Boolean(),
      cartProductTaxes: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const TaxInclude = t.Partial(
  t.Object(
    {
      appliedProducts: t.Boolean(),
      appliedCategories: t.Boolean(),
      organization: t.Boolean(),
      cartProductTaxes: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const TaxOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      name: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      priority: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      rate: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      isFixed: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      isCumulative: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      organizationId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const Tax = t.Composite([TaxPlain, TaxRelations], {
  additionalProperties: false,
});

export const TaxInputCreate = t.Composite(
  [TaxPlainInputCreate, TaxRelationsInputCreate],
  { additionalProperties: false },
);

export const TaxInputUpdate = t.Composite(
  [TaxPlainInputUpdate, TaxRelationsInputUpdate],
  { additionalProperties: false },
);
