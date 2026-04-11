import tr from '@/i18n/tr';
import globals from '@/globals';
import { authMacro } from '@backend/lib/auth';
import {
  handleError,
  InterceptPrismaError,
  ErrorReferences,
} from '@backend/lib/error';
import prisma from '@database';
import Elysia from 'elysia';
import model from './model';
import redis, { addBasketKey } from '@backend/lib/redis';

export default new Elysia()
  .use(authMacro)
  .use(globals)
  .use(model)
  .get(
    '/',
    async ({ request: { headers }, status, session, query }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      const cacheKey = `org:${session.activeOrganizationId}:gastro:ordrs:p${query.page}:m${query.max}`;
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);

      const transaction = await Promise.all([
        prisma.order.findMany({
          take: query.max,
          skip: query.max * query.page,
          where: {
            organizationId: session.activeOrganizationId,
          },
          include: {
            issuer: {
              select: {
                name: true,
              },
            },
          },
        }),
        prisma.order.count({
          where: {
            organizationId: session.activeOrganizationId,
          },
        }),
      ]).catch(InterceptPrismaError);

      const [orders, count] = transaction;

      const res = {
        data: orders.map((order) => ({
          ...order,
          tax: order.tax.toString(),
          total: order.total.toString(),
          sub: order.sub.toString(),
        })),
        meta: {
          max: query.max,
          page: query.page,
          total: count,
        },
      };

      await redis.set(cacheKey, JSON.stringify(res), 'EX', 30);
      const basket = `org:${session.activeOrganizationId}:caches:gastro:ordrs`;
      await addBasketKey(basket, cacheKey);

      return res;
    },
    {
      auth: true,
      permissions: { order: ['view'] },
      detail: {
        summary: 'List orders',
        description:
          'Retrieve a paginated list of order records for the active organization.',
        tags: ['Gastro', 'Orders'],
        security: [{ CookieAuth: [] }],
      },
      query: 'paginationQuery',
      response: {
        ...ErrorReferences,
        200: 'orderPaginated',
        403: 'error',
      },
    }
  );
