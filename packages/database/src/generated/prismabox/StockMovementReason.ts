import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const StockMovementReason = t.Union(
  [
    t.Literal("SALE"),
    t.Literal("RESTOCK"),
    t.Literal("ADJUSTMENT"),
    t.Literal("REVERSAL"),
  ],
  { additionalProperties: false },
);
