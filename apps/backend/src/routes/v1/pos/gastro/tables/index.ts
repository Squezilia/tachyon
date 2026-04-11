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
import { v7 } from 'uuid';
import model from './model';
import redis, { addBasketKey, deleteBasket } from '@backend/lib/redis';

export default new Elysia()
  .use(authMacro)
  .use(globals)
  .use(model)
  .post(
    '/',
    async ({ status, body, session }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      const createdTable = await prisma.table
        .create({
          data: {
            ...body,
            organizationId: session.activeOrganizationId,
          },
        })
        .catch(InterceptPrismaError);

      const basket = `org:${session.activeOrganizationId}:caches:gastro:tabls`;
      await deleteBasket(basket);

      return createdTable;
    },
    {
      auth: true,
      permissions: { table: ['create'] },
      detail: {
        summary: 'Create table',
        description: 'Create a new table within the active organization.',
        tags: ['Gastro', 'Tables'],
        security: [{ CookieAuth: [] }],
      },
      body: 'createTable',
      response: {
        ...ErrorReferences,
        200: 'table',
        403: 'error',
      },
    }
  )
  .post(
    '/dupe/:id',
    async ({ status, session, params: { id } }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      const table = await prisma.table
        .findFirst({
          where: {
            id,
            organizationId: session.activeOrganizationId,
          },
        })
        .catch(InterceptPrismaError);

      if (!table) return status(404, tr.error.table.notFound);

      const createdTable = await prisma.table
        .create({
          data: {
            ...table,
            name: `${table.name} - Kopyalandı`,
            id: v7(),
          },
        })
        .catch(InterceptPrismaError);

      const basket = `org:${session.activeOrganizationId}:caches:gastro:tabls`;
      await deleteBasket(basket);

      return status(201, createdTable);
    },
    {
      auth: true,
      permissions: { table: ['create'] },
      detail: {
        summary: 'Duplicate table',
        description:
          'Create a copy of an existing table within the active organization.',
        tags: ['Gastro', 'Tables'],
        security: [{ CookieAuth: [] }],
      },
      response: {
        ...ErrorReferences,
        201: 'table',
        403: 'error',
      },
    }
  )
  .get(
    '/',
    async ({ status, session, query }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      const cacheKey = `org:${session.activeOrganizationId}:gastro:tabls:p${query.page}:m${query.max}`;
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);

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
      ]).catch(InterceptPrismaError);

      const [tables, count] = transaction;

      const res = {
        data: tables,
        meta: {
          max: query.max,
          page: query.page,
          total: count,
        },
      };

      await redis.set(cacheKey, JSON.stringify(res), 'EX', 30);
      const basket = `org:${session.activeOrganizationId}:caches:gastro:tabls`;
      await addBasketKey(basket, cacheKey);

      return res;
    },
    {
      auth: true,
      permissions: { table: ['view'] },
      detail: {
        summary: 'List tables',
        description:
          'Retrieve a paginated list of tables for the active organization.',
        tags: ['Gastro', 'Tables'],
        security: [{ CookieAuth: [] }],
      },
      query: 'paginationQuery',
      response: {
        ...ErrorReferences,
        200: 'tablePaginated',
        403: 'error',
      },
    }
  )
  .get(
    '/:id',
    async ({ session, params, status }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      const cacheKey = `org:${session.activeOrganizationId}:gastro:tabls:${params.id}`;
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);

      const table = await prisma.table
        .findFirst({
          where: {
            id: params.id,
            organizationId: session.activeOrganizationId,
          },
        })
        .catch(InterceptPrismaError);

      if (!table) return status(404, tr.error.table.notFound);

      await redis.set(cacheKey, JSON.stringify(table), 'EX', 30);

      return table;
    },
    {
      auth: true,
      permissions: { table: ['view'] },
      detail: {
        summary: 'Get table',
        description: 'Retrieve a table by ID.',
        tags: ['Gastro', 'Tables'],
        security: [{ CookieAuth: [] }],
      },
      response: {
        ...ErrorReferences,
        200: 'table',
        403: 'error',
      },
    }
  )
  .patch(
    '/:id',
    async ({ status, params, body, session }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

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
        .catch(InterceptPrismaError);

      await redis.del(
        `org:${session.activeOrganizationId}:gastro:tabls:${params.id}`
      );
      const basket = `org:${session.activeOrganizationId}:caches:gastro:tabls`;
      await deleteBasket(basket);

      return updatedTable;
    },
    {
      auth: true,
      permissions: { table: ['update'] },
      detail: {
        summary: 'Update table',
        description: 'Update a table by ID.',
        tags: ['Gastro', 'Tables'],
        security: [{ CookieAuth: [] }],
      },
      body: 'updateTable',
      response: {
        ...ErrorReferences,
        200: 'table',
        403: 'error',
      },
    }
  )
  .delete(
    '/:id',
    async ({ status, params, session }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      const deletedTable = await prisma.table
        .delete({
          where: {
            id: params.id,
            organizationId: session.activeOrganizationId,
          },
        })
        .catch(InterceptPrismaError);

      await redis.del(
        `org:${session.activeOrganizationId}:gastro:tabls:${params.id}`
      );
      const basket = `org:${session.activeOrganizationId}:caches:gastro:tabls`;
      await deleteBasket(basket);

      return deletedTable;
    },
    {
      auth: true,
      permissions: { table: ['delete'] },
      detail: {
        summary: 'Delete table',
        description: 'Delete a table by ID.',
        tags: ['Gastro', 'Tables'],
        security: [{ CookieAuth: [] }],
      },
      response: {
        ...ErrorReferences,
        200: 'table',
        403: 'error',
      },
    }
  );
