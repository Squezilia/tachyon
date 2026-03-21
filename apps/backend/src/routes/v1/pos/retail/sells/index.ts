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

export default new Elysia()
  .use(authMacro)
  .use(globals)
  .use(model)
  .get(
    '/',
    async ({ request: { headers }, status, session, query }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      const transaction = await Promise.all([
        prisma.sell.findMany({
          take: query.max,
          skip: query.max * query.page,
          where: {
            organizationId: session.activeOrganizationId,
          },
        }),
        prisma.sell.count({
          where: {
            organizationId: session.activeOrganizationId,
          },
        }),
      ]).catch(InterceptPrismaError);

      const [sells, count] = transaction;

      return {
        data: sells,
        meta: {
          max: query.max,
          page: query.page,
          total: count,
        },
      };
    },
    {
      auth: true,
      permissions: { sell: ['view'] },
      detail: {
        summary: 'List sells',
        description:
          'Retrieve a paginated list of sell records for the active organization.',
        tags: ['Retail', 'Sells'],
        security: [{ CookieAuth: [] }],
      },
      query: 'paginationQuery',
      response: {
        ...ErrorReferences,
        200: 'sellPaginated',
        403: 'error',
      },
    }
  );
