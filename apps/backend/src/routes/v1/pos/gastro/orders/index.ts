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
import prisma from '@backend/lib/prisma';
import { OrderPlain } from '@database';
import Elysia, { t } from 'elysia';

export default new Elysia({ prefix: '/orders' }).use(authMacro).get(
  '/get',
  async ({ request: { headers }, status, session, query }) => {
    if (!session.activeOrganizationId)
      return status(400, tr.error.organization.noActive);

    if (
      !(await auth.api.hasPermission({
        headers,
        body: { permissions: { order: ['view'] } },
      }))
    )
      return status(403, tr.error.organization.insufficentPermission);

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
    ]).catch(mapPrismaError);

    if (transaction instanceof MappedPrismaError)
      return status(transaction.status, transaction.response);

    const [orders, count] = transaction;

    return {
      data: orders,
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
      summary: 'List orders',
      description:
        'Retrieve a paginated list of order records for the active organization.',
      tags: ['Gastro', 'Orders'],
      security: [{ CookieAuth: [] }],
    },
    query: PaginationQuery,
    response: {
      ...ResponseSchemaSet,
      200: ResponsePaginate(
        t.Composite([
          OrderPlain,
          t.Object({ issuer: t.Object({ name: t.String() }) }),
        ])
      ),
      403: ErrorResponseSchema,
    },
  }
);
