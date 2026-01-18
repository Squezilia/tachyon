import tr from '@/i18n/tr';
import {
  ErrorResponseSchema,
  PaginationQuery,
  ResponsePaginate,
} from '@/model';
import {
  CategoryPlain,
  CategoryPlainInputCreate,
  CategoryPlainInputUpdate,
  TablePlain,
  TablePlainInputCreate,
  TablePlainInputUpdate,
} from '@database';
import Elysia, { t } from 'elysia';
import { auth, authMacro } from 'lib/auth';
import {
  MappedPrismaError,
  mapPrismaError,
  ResponseSchemaSet,
} from 'lib/error';
import prisma from 'lib/prisma';

export default () =>
  new Elysia({ prefix: '/tables' })
    .use(authMacro)
    .post(
      '/create',
      async ({ request: { headers }, status, body, session }) => {
        if (!session.activeOrganizationId)
          return status(400, tr.error.organization.noActive);

        if (
          !(await auth.api.hasPermission({
            headers,
            body: { permissions: { table: ['create'] } },
          }))
        )
          return status(403, tr.error.organization.insufficentPermission);

        const createdTable = await prisma.table
          .create({
            data: {
              ...body,
              organizationId: session.activeOrganizationId,
            },
          })
          .catch(mapPrismaError);

        if (createdTable instanceof MappedPrismaError) {
          return status(createdTable.status, createdTable.response);
        }

        return createdTable;
      },
      {
        auth: true,
        detail: {
          summary: 'Create table',
          description: 'Create a new table within the active organization.',
          tags: ['Gastro', 'Tables'],
          security: [{ CookieAuth: [] }],
        },
        body: TablePlainInputCreate,
        response: {
          ...ResponseSchemaSet,
          200: TablePlain,
          403: ErrorResponseSchema,
        },
      }
    )
    .get(
      '/get',
      async ({ request: { headers }, status, session, query }) => {
        if (!session.activeOrganizationId)
          return status(400, tr.error.organization.noActive);

        if (
          !(await auth.api.hasPermission({
            headers,
            body: { permissions: { table: ['view'] } },
          }))
        )
          return status(403, tr.error.organization.insufficentPermission);

        const transaction = await prisma
          .$transaction([
            prisma.table.findMany({
              take: query.max,
              skip: query.max * query.page,
              where: {
                organizationId: session.activeOrganizationId,
              },
            }),
            prisma.table.count({
              where: {
                organizationId: session.activeOrganizationId,
              },
            }),
          ])
          .catch(mapPrismaError);

        if (transaction instanceof MappedPrismaError) {
          return status(transaction.status, transaction.response);
        }

        const [tables, count] = transaction;

        return {
          data: tables,
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
          summary: 'List tables',
          description:
            'Retrieve a paginated list of tables for the active organization.',
          tags: ['Gastro', 'Tables'],
          security: [{ CookieAuth: [] }],
        },
        query: PaginationQuery,
        response: {
          ...ResponseSchemaSet,
          200: ResponsePaginate(TablePlain),
          403: ErrorResponseSchema,
        },
      }
    )
    .patch(
      '/update/:id',
      async ({ request: { headers }, status, params, body, session }) => {
        if (!session.activeOrganizationId)
          return status(400, tr.error.organization.noActive);

        if (
          !(await auth.api.hasPermission({
            headers,
            body: { permissions: { table: ['delete'] } },
          }))
        )
          return status(403, tr.error.organization.insufficentPermission);

        const updatedTable = await prisma.table
          .update({
            where: {
              id: params.id,
              organizationId: session.activeOrganizationId,
            },
            data: {
              ...body,
            },
          })
          .catch(mapPrismaError);

        if (updatedTable instanceof MappedPrismaError)
          return status(updatedTable.status, updatedTable.response);

        return updatedTable;
      },
      {
        auth: true,
        detail: {
          summary: 'Update table',
          description: 'Update a table by ID.',
          tags: ['Gastro', 'Tables'],
          security: [{ CookieAuth: [] }],
        },
        body: TablePlainInputUpdate,
        response: {
          ...ResponseSchemaSet,
          200: TablePlain,
          403: ErrorResponseSchema,
        },
      }
    )
    .delete(
      '/delete/:id',
      async ({ request: { headers }, status, params, session }) => {
        if (!session.activeOrganizationId)
          return status(400, tr.error.organization.noActive);

        if (
          !(await auth.api.hasPermission({
            headers,
            body: { permissions: { table: ['update'] } },
          }))
        )
          return status(403, tr.error.organization.insufficentPermission);

        const deletedTable = await prisma.table
          .delete({
            where: {
              id: params.id,
              organizationId: session.activeOrganizationId,
            },
          })
          .catch(mapPrismaError);

        if (deletedTable instanceof MappedPrismaError)
          return status(deletedTable.status, deletedTable.response);

        return deletedTable;
      },
      {
        auth: true,
        detail: {
          summary: 'Delete table',
          description: 'Delete a table by ID.',
          tags: ['Gastro', 'Tables'],
          security: [{ CookieAuth: [] }],
        },
        response: {
          ...ResponseSchemaSet,
          200: TablePlain,
          403: ErrorResponseSchema,
        },
      }
    );
