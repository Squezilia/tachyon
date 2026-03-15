import tr from '@/i18n/tr';
import { ErrorResponseSchema } from '@/model';
import { SellPlain } from '@database';
import Elysia, { t } from 'elysia';
import { auth, authMacro } from '@backend/lib/auth';
import {
  MappedPrismaError,
  mapPrismaError,
  ResponseSchemaSet,
} from '@backend/lib/error';
import prisma from '@backend/lib/prisma';
import calculateTotal from '../service';

export default new Elysia({ prefix: '/v1/pos/retail' })
  .use(authMacro)
  .guard({
    auth: true,
    detail: { tags: ['Retail'], security: [{ CookieAuth: [] }] },
  })
  // request (stockList) -> check stocks -> run campaign engine (skip) -> run tax engine -> create stock movements -> create sell -> response (sell)
  .post(
    '/',
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
                appliedTaxes: {
                  orderBy: {
                    priority: 'asc',
                  },
                },
              },
            },
          },
        }),
      ]);

      const calculatedTotal = await calculateTotal(
        session.activeOrganizationId,
        session.userId,
        stocks,
        body.stocks
      ).catch(mapPrismaError);

      if (calculatedTotal instanceof MappedPrismaError)
        return status(calculatedTotal.status, calculatedTotal.response);

      const { appliedTaxes, cartConfig, movementConfig } = calculatedTotal;

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
  );
