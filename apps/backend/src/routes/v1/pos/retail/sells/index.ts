import tr from '@/i18n/tr';
import {
  ErrorResponseSchema,
  PaginationQuery,
  ResponsePaginate,
} from '@/model';
import { auth, authMacro } from '@backend/lib/auth';
import {
  MappedPrismaError,
  mapPrismaError,
  ResponseSchemaSet,
} from '@backend/lib/error';
import prisma from '@database';
import { SellPlain } from '@database/prismabox';
import Elysia from 'elysia';

export default new Elysia().use(authMacro).get(
  '/',
  async ({ request: { headers }, status, session, query }) => {
    if (!session.activeOrganizationId)
      return status(400, tr.error.organization.noActive);

    if (
      !(await auth.api.hasPermission({
        headers,
        body: { permissions: { sell: ['view'] } },
      }))
    )
      return status(403, tr.error.organization.insufficentPermission);

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
    ]).catch(mapPrismaError);

    if (transaction instanceof MappedPrismaError)
      return status(transaction.status, transaction.response);

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
    detail: {
      summary: 'List sells',
      description:
        'Retrieve a paginated list of sell records for the active organization.',
      tags: ['Retail', 'Sells'],
      security: [{ CookieAuth: [] }],
    },
    query: PaginationQuery,
    response: {
      ...ResponseSchemaSet,
      200: ResponsePaginate(SellPlain),
      403: ErrorResponseSchema,
    },
  }
);
