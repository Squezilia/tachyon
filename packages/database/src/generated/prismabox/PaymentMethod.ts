import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const PaymentMethod = t.Union(
  [
    t.Literal("CASH"),
    t.Literal("CREDIT_CARD"),
    t.Literal("DEBIT_CARD"),
    t.Literal("MOBILE_PAYMENT"),
  ],
  { additionalProperties: false },
);
