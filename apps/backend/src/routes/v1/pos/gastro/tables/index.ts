import { ElysiaApp } from '@/app';
import tr from '@/i18n/tr';
import {
  ErrorResponseSchema,
  PaginationQuery,
  ResponsePaginate,
} from '@/model';
import {
  TablePlain,
  TablePlainInputCreate,
  TablePlainInputUpdate,
} from '@database';
import Elysia from 'elysia';
import { auth, authMacro } from '@backend/lib/auth';
import {
  MappedPrismaError,
  mapPrismaError,
  ResponseSchemaSet,
} from '@backend/lib/error';
import prisma from '@backend/lib/prisma';
import { v7 } from 'uuid';

export default new Elysia({ prefix: '/v1/pos/gastro/tables' })
  .use(authMacro)
  .post(
    '/',
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
  .post(
    '/dupe/:id',
    async ({ request: { headers }, status, session, params: { id } }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      if (
        !(await auth.api.hasPermission({
          headers,
          body: { permissions: { table: ['create'] } },
        }))
      )
        return status(403, tr.error.organization.insufficentPermission);

      const table = await prisma.table
        .findFirst({
          where: {
            id,
            organizationId: session.activeOrganizationId,
          },
        })
        .catch(mapPrismaError);

      if (table instanceof MappedPrismaError)
        return status(table.status, table.response);

      if (!table) return status(404, tr.error.table.notFound);

      const createdTable = await prisma.table
        .create({
          data: {
            ...table,
            name: `${table.name} - Kopyalandı`,
            id: v7(),
          },
        })
        .catch(mapPrismaError);

      if (createdTable instanceof MappedPrismaError)
        return status(createdTable.status, createdTable.response);

      return status(201, createdTable);
    },
    {
      auth: true,
      detail: {
        summary: 'Duplicate table',
        description:
          'Create a copy of an existing table within the active organization.',
        tags: ['Gastro', 'Tables'],
        security: [{ CookieAuth: [] }],
      },
      response: {
        ...ResponseSchemaSet,
        201: TablePlain,
        403: ErrorResponseSchema,
      },
    }
  )
  .get(
    '/',
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

      const transaction = await Promise.all([
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
      ]).catch(mapPrismaError);

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
  .get(
    '/:id',
    async ({ session, params, request: { headers }, status }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      if (
        !(await auth.api.hasPermission({
          headers,
          body: { permissions: { table: ['view'] } },
        }))
      )
        return status(403, tr.error.organization.insufficentPermission);

      const table = await prisma.table
        .findFirst({
          where: {
            id: params.id,
            organizationId: session.activeOrganizationId,
          },
        })
        .catch(mapPrismaError);

      if (table instanceof MappedPrismaError) {
        return status(table.status, table.response);
      }

      if (!table) return status(404, tr.error.table.notFound);

      return table;
    },
    {
      auth: true,
      detail: {
        summary: 'Get table',
        description: 'Retrieve a table by ID.',
        tags: ['Gastro', 'Tables'],
        security: [{ CookieAuth: [] }],
      },
      response: {
        ...ResponseSchemaSet,
        200: TablePlain,
        403: ErrorResponseSchema,
      },
    }
  )
  .patch(
    '/:id',
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
    '/:id',
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
