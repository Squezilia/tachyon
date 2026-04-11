import tr from '@/i18n/tr';
import globals from '@/globals';
import Elysia from 'elysia';
import { authMacro } from '@backend/lib/auth';
import {
  handleError,
  InterceptPrismaError,
  ErrorReferences,
} from '@backend/lib/error';
import prisma from '@database';
import calculateTotal from '../service';
import model from './model';
import { deleteBasket } from '@backend/lib/redis';

export default new Elysia()
  .use(authMacro)
  .use(globals)
  .use(model)
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

      const stocks = await prisma.stock
        .findMany({
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
        })
        .catch(InterceptPrismaError);

      const calculatedTotal = await calculateTotal(
        session.activeOrganizationId,
        session.userId,
        stocks,
        body.stocks
      ).catch(InterceptPrismaError);

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
        .catch(InterceptPrismaError);

      const [sell] = transaction;

      const basket = `org:${session.activeOrganizationId}:caches:gastro:sells`;
      await deleteBasket(basket);

      return {
        ...sell,
        id: sell.id.toString(),
        reversedSellId: null,
      };
    },
    {
      auth: true,
      permissions: { retail: ['sell'] },
      detail: {
        summary: 'Create sale',
        description:
          'Create a sale: validate stock, apply campaigns and taxes, record movements, and return the sell record.',
        tags: ['Retail'],
        security: [{ CookieAuth: [] }],
      },
      body: 'createSell',
      response: {
        ...ErrorReferences,
        200: 'sell',
        403: 'error',
      },
    }
  )
  // request (refundList) -> reversal sell
  // TODO: its not complete
  .post(
    '/refund/:id',
    async ({ params, session, user, request: { headers }, status }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

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
        .catch(InterceptPrismaError);

      if (!sell) return status(404, tr.error.retail.notFound);

      if (sell?.isReversal || sell?.reversedSellId)
        return status(400, tr.error.retail.sellIsAlreadyReversed);

      return await prisma.sell
        .create({
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
        })
        .catch(InterceptPrismaError);
    },
    {
      auth: true,
      permissions: { retail: ['refund'] },
      detail: {
        summary: 'Refund sale',
        description:
          'Reverse a sale and restore stock. Implementation pending.',
        tags: ['Retail'],
        security: [{ CookieAuth: [] }],
      },
      body: 'refundSell',
      response: {
        ...ErrorReferences,
        200: 'sell',
      },
    }
  );
