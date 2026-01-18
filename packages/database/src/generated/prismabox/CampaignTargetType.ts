import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const CampaignTargetType = t.Union(
  [t.Literal("PRODUCTS"), t.Literal("CATEGORIES")],
  { additionalProperties: false },
);
