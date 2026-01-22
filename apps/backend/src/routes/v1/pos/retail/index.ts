import tr from '@/i18n/tr';
import { ErrorResponseSchema } from '@/model';
import { Decimal, SellPlain } from '@database';
import type { Prisma } from '@database/generated/prisma/client';
import Elysia, { t } from 'elysia';
import { auth, authMacro } from 'lib/auth';
import {
  MappedPrismaError,
  mapPrismaError,
  ResponseSchemaSet,
} from 'lib/error';
import prisma from 'lib/prisma';
import { v7 } from 'uuid';
import sells from './sells';

export default () =>
  new Elysia({ prefix: '/retail' })
    .use(authMacro)
    .guard({
      auth: true,
      detail: { tags: ['Retail'], security: [{ CookieAuth: [] }] },
    })
    // request (stockList) -> check stocks -> run campaign engine -> run tax engine -> create stock movements -> create sell -> response (sell)
    .post(
      '/sell',
      async ({ request: { headers }, body, session, user, status }) => {
        if (!session.activeOrganizationId)
          return status(400, tr.error.organization.noActive);

        if (
          !(await auth.api.hasPermission({
            headers,
            body: { permissions: { retail: ['sell'] } },
          }))
        )
          return status(403, tr.error.organization.insufficentPermission);

        const currentDate = new Date();

        const [stocks] = await Promise.all([
          prisma.stock.findMany({
            where: {
              id: {
                in: Object.keys(body.stocks),
              },
              organizationId: session.activeOrganizationId,
            },
            include: {
              product: {
                include: {
                  appliedTaxes: true,
                },
              },
            },
          }),
          prisma.campaign.findMany({
            where: {
              id: {
                in: body.campaigns,
              },
              organizationId: session.activeOrganizationId,
            },
            include: {
              application: true,
              availabilities: {
                where: {
                  OR: [
                    {
                      before: {
                        gte: currentDate,
                      },
                    },
                    {
                      after: {
                        lte: currentDate,
                      },
                    },
                  ],
                },
              },
              targets: {
                include: {
                  products: true,
                  categories: true,
                },
              },
            },
          }),
        ]);

        const movementConfig: Prisma.StockMovementCreateManyInput[] = [];
        const cartConfig: Prisma.CartProductCreateManyInput[] = [];
        const appliedTaxes: Prisma.CartProductTaxCreateManyInput[] = [];

        for (const stock of stocks) {
          const specifiedStockForItem = body.stocks[stock.id + ''];
          if (
            !specifiedStockForItem ||
            specifiedStockForItem > stock.quantity ||
            specifiedStockForItem < 1
          )
            return status(400, tr.error.retail.stockError);

          movementConfig.push({
            organizationId: session.activeOrganizationId,
            quantityChange: -specifiedStockForItem,
            reason: 'SALE',
            stockId: stock.id,
            createdById: session.userId,
          });

          const subtotal = stock.product.price.mul(specifiedStockForItem);
          const taxes = stock.product.appliedTaxes.sort((a, b) => {
            return a.priority - b.priority;
          });

          const cartProductId = v7();

          let appliedTax = Decimal(0);
          let runningBase = subtotal;

          for (const tax of taxes) {
            const baseAmount = tax.isCumulative ? runningBase : subtotal;

            const taxAmount = tax.isFixed
              ? tax.rate.mul(specifiedStockForItem)
              : baseAmount.mul(tax.rate.div(100));

            appliedTax = appliedTax.plus(taxAmount);

            appliedTaxes.push({
              cartProductId,
              isFixed: tax.isFixed,
              priority: tax.priority,
              taxName: tax.name,
              taxAmount,
              baseAmount,
              taxId: tax.id,
              taxRate: tax.rate,
            });

            if (tax.isCumulative) runningBase = runningBase.plus(taxAmount);
          }

          const total = subtotal.plus(appliedTax);

          cartConfig.push({
            id: cartProductId,
            priceAtSale: stock.product.price,
            productId: stock.productId,
            productName: stock.product.name,
            quantity: specifiedStockForItem,
            totalTax: appliedTax,
            subtotal,
            total,
          });
        }

        const transaction = await prisma
          .$transaction([
            prisma.sell.create({
              data: {
                issuerId: user.id,
                organizationId: session.activeOrganizationId,
                products: {
                  createMany: {
                    data: cartConfig,
                  },
                },
                isReversal: false,
              },
            }),
            prisma.stockMovement.createMany({
              data: movementConfig,
            }),
            prisma.cartProductTax.createMany({
              data: appliedTaxes,
            }),
          ])
          .catch(mapPrismaError);

        if (transaction instanceof MappedPrismaError)
          return status(transaction.status, transaction.response);

        const [sell] = transaction;

        return {
          ...sell,
          id: sell.id.toString(),
          reversedSellId: null,
        };
      },
      {
        auth: true,
        detail: {
          summary: 'Create sale',
          description:
            'Create a sale: validate stock, apply campaigns and taxes, record movements, and return the sell record.',
          tags: ['Retail'],
          security: [{ CookieAuth: [] }],
        },
        body: t.Object({
          stocks: t.Record(t.String(), t.Integer()),
          campaigns: t.Array(t.String()),
        }),
        response: {
          ...ResponseSchemaSet,
          200: SellPlain,
          403: ErrorResponseSchema,
        },
      }
    )
    // request (refundList) -> reversal sell
    .post(
      '/refund/:id',
      async ({ params, session, user, request: { headers }, status }) => {
        if (!session.activeOrganizationId)
          return status(400, tr.error.organization.noActive);

        if (
          !(await auth.api.hasPermission({
            headers,
            body: { permissions: { retail: ['refund'] } },
          }))
        )
          return status(403, tr.error.organization.insufficentPermission);

        const sell = await prisma.sell
          .findFirst({
            where: {
              id: params.id,
              organizationId: session.activeOrganizationId,
            },
            include: {
              products: true,
              campaignApplications: true,
            },
          })
          .catch(mapPrismaError);

        if (sell instanceof MappedPrismaError)
          return status(sell.status, sell.response);

        if (!sell) return status(404, tr.error.retail.notFound);

        if (sell?.isReversal || sell?.reversedSellId)
          return status(400, tr.error.retail.sellIsAlreadyReversed);

        return await prisma.sell.create({
          data: {
            issuerId: user.id,
            reversalOf: {
              connect: {
                id: sell.id,
              },
            },
            isReversal: true,
            products: {
              connect: [...sell.products],
            },
            campaignApplications: {
              connect: [...sell.campaignApplications],
            },
            organizationId: session.activeOrganizationId,
          },
        });
      },
      {
        auth: true,
        body: t.Object({
          reverseStocks: t.Boolean(),
        }),
        detail: {
          summary: 'Refund sale',
          description:
            'Reverse a sale and restore stock. Implementation pending.',
          tags: ['Retail'],
          security: [{ CookieAuth: [] }],
        },
      }
    )
    .use(sells);
