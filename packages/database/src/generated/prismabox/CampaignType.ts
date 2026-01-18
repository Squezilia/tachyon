import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const CampaignType = t.Union(
  [t.Literal("BASKET"), t.Literal("PRODUCT")],
  { additionalProperties: false },
);
