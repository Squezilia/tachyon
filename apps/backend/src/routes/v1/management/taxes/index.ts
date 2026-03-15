import { ElysiaApp } from '@/app';
import tr from '@/i18n/tr';
import {
  ErrorResponseSchema,
  PaginationQuery,
  ResponsePaginate,
} from '@/model';
import { TaxPlain, TaxPlainInputCreate, TaxPlainInputUpdate } from '@database';
import Elysia, { t } from 'elysia';
import { auth, authMacro } from '@backend/lib/auth';
import {
  MappedPrismaError,
  mapPrismaError,
  ResponseSchemaSet,
} from '@backend/lib/error';
import prisma from '@backend/lib/prisma';
import { v7 } from 'uuid';

export default new Elysia({ prefix: '/v1/management/taxes' })
  .use(authMacro)
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

      if (
        !(await auth.api.hasPermission({
          headers,
          body: { permissions: { tax: ['create'] } },
        }))
      )
        return status(403, tr.error.organization.insufficentPermission);

      const createdTax = await prisma.tax
        .create({
          data: {
            ...body,
            organizationId: session.activeOrganizationId,
          },
        })
        .catch(mapPrismaError);

      if (createdTax instanceof MappedPrismaError) {
        return status(createdTax.status, createdTax.response);
      }

      return status(201, {
        ...createdTax,
        rate: createdTax.rate.toString(),
      });
    },
    {
      auth: true,
      detail: {
        summary: 'Create tax',
        description: 'Create a new tax rule for the organization.',
        tags: ['Inventory', 'Taxes'],
        security: [{ CookieAuth: [] }],
      },
      body: t.Intersect([TaxPlainInputCreate]),
      response: {
        ...ResponseSchemaSet,
        201: TaxPlain,
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
          body: { permissions: { tax: ['create', 'update'] } },
        }))
      )
        return status(403, tr.error.organization.insufficentPermission);

      const tax = await prisma.tax
        .findFirst({
          where: {
            id,
            organizationId: session.activeOrganizationId,
          },
        })
        .catch(mapPrismaError);

      if (tax instanceof MappedPrismaError)
        return status(tax.status, tax.response);

      if (!tax) return status(404, tr.error.tax.notFound);

      const createdTax = await prisma.tax
        .create({
          data: {
            ...tax,
            name: `${tax.name} - Kopyalandı`,
            id: v7(),
          },
        })
        .catch(mapPrismaError);

      if (createdTax instanceof MappedPrismaError)
        return status(createdTax.status, createdTax.response);

      return status(201, {
        ...createdTax,
        rate: createdTax.rate.toString(),
      });
    },
    {
      auth: true,
      detail: {
        summary: 'Duplicate tax',
        description:
          'Create a copy of an existing tax rule (within the active organization).',
        tags: ['Inventory', 'Taxes'],
        security: [{ CookieAuth: [] }],
      },
      response: {
        ...ResponseSchemaSet,
        201: TaxPlain,
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
          body: { permissions: { tax: ['view'] } },
        }))
      )
        return status(403, tr.error.organization.insufficentPermission);

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
      ]).catch(mapPrismaError);

      if (transaction instanceof MappedPrismaError) {
        return status(transaction.status, transaction.response);
      }

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
      detail: {
        summary: 'List taxes',
        description: 'Retrieve a paginated list of defined taxes.',
        tags: ['Inventory', 'Taxes'],
        security: [{ CookieAuth: [] }],
      },
      query: PaginationQuery,
      response: {
        ...ResponseSchemaSet,
        200: ResponsePaginate(TaxPlain),
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
          body: { permissions: { tax: ['view'] } },
        }))
      )
        return status(403, tr.error.organization.insufficentPermission);

      const tax = await prisma.tax
        .findFirst({
          where: {
            id: params.id,
            organizationId: session.activeOrganizationId,
          },
        })
        .catch(mapPrismaError);

      if (tax instanceof MappedPrismaError) {
        return status(tax.status, tax.response);
      }

      if (!tax) return status(404, tr.error.tax.notFound);

      return {
        ...tax,
        rate: tax.rate.toString(),
      };
    },
    {
      auth: true,
      detail: {
        summary: 'Get tax',
        description: 'Retrieve a tax rule by ID.',
        tags: ['Inventory', 'Taxes'],
        security: [{ CookieAuth: [] }],
      },
      response: {
        ...ResponseSchemaSet,
        200: TaxPlain,
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
          body: { permissions: { tax: ['delete'] } },
        }))
      )
        return status(403, tr.error.organization.insufficentPermission);

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
        .catch(mapPrismaError);

      if (updatedTax instanceof MappedPrismaError)
        return status(updatedTax.status, updatedTax.response);

      return {
        ...updatedTax,
        rate: updatedTax.rate.toString(),
      };
    },
    {
      auth: true,
      detail: {
        summary: 'Update tax',
        description: 'Update a tax rule by ID.',
        tags: ['Inventory', 'Taxes'],
        security: [{ CookieAuth: [] }],
      },
      body: TaxPlainInputUpdate,
      response: {
        ...ResponseSchemaSet,
        200: TaxPlain,
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
          body: { permissions: { tax: ['update'] } },
        }))
      )
        return status(403, tr.error.organization.insufficentPermission);

      const deletedTax = await prisma.tax
        .delete({
          where: {
            id: params.id,
            organizationId: session.activeOrganizationId,
          },
        })
        .catch(mapPrismaError);

      if (deletedTax instanceof MappedPrismaError)
        return status(deletedTax.status, deletedTax.response);

      return {
        ...deletedTax,
        rate: deletedTax.rate.toString(),
      };
    },
    {
      auth: true,
      detail: {
        summary: 'Delete tax',
        description: 'Delete a tax rule by ID.',
        tags: ['Inventory', 'Taxes'],
        security: [{ CookieAuth: [] }],
      },
      response: {
        ...ResponseSchemaSet,
        200: TaxPlain,
        403: ErrorResponseSchema,
      },
    }
  );
