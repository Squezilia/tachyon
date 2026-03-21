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

export default new Elysia()
  .use(authMacro)
  .use(globals)
  .use(model)
  .guard({
    auth: true,
    detail: {
      tags: ['Inventory', 'Taxes'],
      security: [{ CookieAuth: [] }],
    },
  })
  .post(
    '/',
    async ({ request: { headers }, status, body, session }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      const createdTax = await prisma.tax
        .create({
          data: {
            ...body,
            organizationId: session.activeOrganizationId,
          },
        })
        .catch(InterceptPrismaError);

      return status(201, {
        ...createdTax,
        rate: createdTax.rate.toString(),
      });
    },
    {
      auth: true,
      permissions: { tax: ['create'] },
      detail: {
        summary: 'Create tax',
        description: 'Create a new tax rule for the organization.',
        tags: ['Inventory', 'Taxes'],
        security: [{ CookieAuth: [] }],
      },
      body: 'createTax',
      response: {
        ...ErrorReferences,
        201: 'tax',
        403: 'error',
      },
    }
  )
  .post(
    '/dupe/:id',
    async ({ request: { headers }, status, session, params: { id } }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      const tax = await prisma.tax
        .findFirst({
          where: {
            id,
            organizationId: session.activeOrganizationId,
          },
        })
        .catch(InterceptPrismaError);

      if (!tax) return status(404, tr.error.tax.notFound);

      const createdTax = await prisma.tax
        .create({
          data: {
            ...tax,
            name: `${tax.name} - Kopyalandı`,
            id: v7(),
          },
        })
        .catch(InterceptPrismaError);

      return status(201, {
        ...createdTax,
        rate: createdTax.rate.toString(),
      });
    },
    {
      auth: true,
      permissions: { tax: ['create', 'update'] },
      detail: {
        summary: 'Duplicate tax',
        description:
          'Create a copy of an existing tax rule (within the active organization).',
        tags: ['Inventory', 'Taxes'],
        security: [{ CookieAuth: [] }],
      },
      response: {
        ...ErrorReferences,
        201: 'tax',
        403: 'error',
      },
    }
  )
  .get(
    '/',
    async ({ request: { headers }, status, session, query }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      const transaction = await Promise.all([
        prisma.tax.findMany({
          take: query.max,
          skip: query.max * query.page,
          where: {
            organizationId: session.activeOrganizationId,
          },
        }),
        prisma.tax.count({
          where: {
            organizationId: session.activeOrganizationId,
          },
        }),
      ]).catch(InterceptPrismaError);

      const [taxes, count] = transaction;

      return {
        data: taxes.map((tax) => {
          return {
            ...tax,
            rate: tax.rate.toString(),
          };
        }),
        meta: {
          max: query.max,
          page: query.page,
          total: count,
        },
      };
    },
    {
      auth: true,
      permissions: { tax: ['view'] },
      detail: {
        summary: 'List taxes',
        description: 'Retrieve a paginated list of defined taxes.',
        tags: ['Inventory', 'Taxes'],
        security: [{ CookieAuth: [] }],
      },
      query: 'paginationQuery',
      response: {
        ...ErrorReferences,
        200: 'taxPaginated',
        403: 'error',
      },
    }
  )
  .get(
    '/:id',
    async ({ session, params, request: { headers }, status }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      const tax = await prisma.tax
        .findFirst({
          where: {
            id: params.id,
            organizationId: session.activeOrganizationId,
          },
        })
        .catch(InterceptPrismaError);

      if (!tax) return status(404, tr.error.tax.notFound);

      return {
        ...tax,
        rate: tax.rate.toString(),
      };
    },
    {
      auth: true,
      permissions: { tax: ['view'] },
      detail: {
        summary: 'Get tax',
        description: 'Retrieve a tax rule by ID.',
        tags: ['Inventory', 'Taxes'],
        security: [{ CookieAuth: [] }],
      },
      response: {
        ...ErrorReferences,
        200: 'tax',
        403: 'error',
      },
    }
  )
  .patch(
    '/:id',
    async ({ request: { headers }, status, params, body, session }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      const updatedTax = await prisma.tax
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

      return {
        ...updatedTax,
        rate: updatedTax.rate.toString(),
      };
    },
    {
      auth: true,
      permissions: { tax: ['update'] },
      detail: {
        summary: 'Update tax',
        description: 'Update a tax rule by ID.',
        tags: ['Inventory', 'Taxes'],
        security: [{ CookieAuth: [] }],
      },
      body: 'updateTax',
      response: {
        ...ErrorReferences,
        200: 'tax',
        403: 'error',
      },
    }
  )
  .delete(
    '/:id',
    async ({ request: { headers }, status, params, session }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      const deletedTax = await prisma.tax
        .delete({
          where: {
            id: params.id,
            organizationId: session.activeOrganizationId,
          },
        })
        .catch(InterceptPrismaError);

      return {
        ...deletedTax,
        rate: deletedTax.rate.toString(),
      };
    },
    {
      auth: true,
      permissions: { tax: ['delete'] },
      detail: {
        summary: 'Delete tax',
        description: 'Delete a tax rule by ID.',
        tags: ['Inventory', 'Taxes'],
        security: [{ CookieAuth: [] }],
      },
      response: {
        ...ErrorReferences,
        200: 'tax',
        403: 'error',
      },
    }
  );
