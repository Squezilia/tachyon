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
} from '@database/prismabox';
import Elysia, { t } from 'elysia';
import { auth, authMacro } from '@backend/lib/auth';
import {
  MappedPrismaError,
  mapPrismaError,
  ResponseSchemaSet,
} from '@backend/lib/error';
import prisma from '@database';
import { v7 } from 'uuid';

export default new Elysia()
  .use(authMacro)
  .post(
    '/',
    async ({ request: { headers }, status, body, session }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      if (
        !(await auth.api.hasPermission({
          headers,
          body: { permissions: { category: ['create'] } },
        }))
      )
        return status(403, tr.error.organization.insufficentPermission);

      const createdCategory = await prisma.category
        .create({
          data: {
            ...body,
            organizationId: session.activeOrganizationId,
          },
        })
        .catch(mapPrismaError);

      if (createdCategory instanceof MappedPrismaError) {
        return status(createdCategory.status, createdCategory.response);
      }

      return status(201, createdCategory);
    },
    {
      auth: true,
      detail: {
        summary: 'Create category',
        description: 'Create a new category within the active organization.',
        tags: ['Inventory', 'Categories'],
        security: [{ CookieAuth: [] }],
      },
      body: CategoryPlainInputCreate,
      response: {
        ...ResponseSchemaSet,
        201: CategoryPlain,
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
          body: { permissions: { category: ['view'] } },
        }))
      )
        return status(403, tr.error.organization.insufficentPermission);

      const category = await prisma.category
        .findFirst({
          where: {
            id,
            organizationId: session.activeOrganizationId,
          },
          include: {
            appliedTaxes: true,
          },
        })
        .catch(mapPrismaError);

      if (category instanceof MappedPrismaError)
        return status(category.status, category.response);

      if (!category) return status(404, tr.error.category.notFound);

      const createdCategory = await prisma.category
        .create({
          data: {
            ...category,
            name: `${category.name} - Kopyalandı`,
            appliedTaxes: {
              connect: category.appliedTaxes.map((tax) => ({ id: tax.id })),
            },
            id: v7(),
          },
        })
        .catch(mapPrismaError);

      if (createdCategory instanceof MappedPrismaError)
        return status(createdCategory.status, createdCategory.response);

      return status(201, createdCategory);
    },
    {
      auth: true,
      detail: {
        summary: 'Duplicate category',
        description:
          'Create a copy of a category, including its applied taxes, within the active organization.',
        tags: ['Inventory', 'Categories'],
        security: [{ CookieAuth: [] }],
      },
      response: {
        ...ResponseSchemaSet,
        201: CategoryPlain,
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
          body: { permissions: { category: ['create', 'update'] } },
        }))
      )
        return status(403, tr.error.organization.insufficentPermission);

      const transaction = await Promise.all([
        prisma.category.findMany({
          take: query.max,
          skip: query.max * query.page,
          where: {
            organizationId: session.activeOrganizationId,
          },
        }),
        prisma.category.count({
          where: {
            organizationId: session.activeOrganizationId,
          },
        }),
      ]).catch(mapPrismaError);

      if (transaction instanceof MappedPrismaError) {
        return status(transaction.status, transaction.response);
      }

      const [categories, count] = transaction;

      return {
        data: categories,
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
        summary: 'List categories',
        description:
          'Retrieve a paginated list of categories for the active organization.',
        tags: ['Inventory', 'Categories'],
        security: [{ CookieAuth: [] }],
      },
      query: PaginationQuery,
      response: {
        ...ResponseSchemaSet,
        200: ResponsePaginate(CategoryPlain),
        403: ErrorResponseSchema,
      },
    }
  )
  .get(
    ':id',
    async ({ session, params, request: { headers }, status }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      if (
        !(await auth.api.hasPermission({
          headers,
          body: { permissions: { category: ['view'] } },
        }))
      )
        return status(403, tr.error.organization.insufficentPermission);

      const category = await prisma.category
        .findFirst({
          where: {
            id: params.id,
            organizationId: session.activeOrganizationId,
          },
        })
        .catch(mapPrismaError);

      if (category instanceof MappedPrismaError) {
        return status(category.status, category.response);
      }

      if (!category) return status(404, tr.error.category.notFound);

      return category;
    },
    {
      auth: true,
      detail: {
        summary: 'Get category',
        description: 'Retrieve a category by ID.',
        tags: ['Inventory', 'Categories'],
        security: [{ CookieAuth: [] }],
      },
      response: {
        ...ResponseSchemaSet,
        200: CategoryPlain,
        403: ErrorResponseSchema,
      },
    }
  )
  .get(
    '/raw',
    async ({ session, request: { headers }, status }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      if (
        !(await auth.api.hasPermission({
          headers,
          body: { permissions: { category: ['view'] } },
        }))
      )
        return status(403, tr.error.organization.insufficentPermission);

      const category = await prisma.category
        .findMany({
          where: {
            organizationId: session.activeOrganizationId,
          },
          select: {
            name: true,
            id: true,
          },
        })
        .catch(mapPrismaError);

      if (category instanceof MappedPrismaError) {
        return status(category.status, category.response);
      }

      return category;
    },
    {
      auth: true,
      detail: {
        summary: 'List categories (raw)',
        description:
          'Retrieve a lightweight category list (id, name) for the active organization.',
        tags: ['Inventory', 'Categories'],
        security: [{ CookieAuth: [] }],
      },
      response: {
        ...ResponseSchemaSet,
        200: t.Array(
          t.Object({
            name: t.String(),
            id: t.String(),
          })
        ),
        403: ErrorResponseSchema,
      },
    }
  )
  .patch(
    ':id',
    async ({ request: { headers }, status, params, body, session }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      if (
        !(await auth.api.hasPermission({
          headers,
          body: { permissions: { category: ['delete'] } },
        }))
      )
        return status(403, tr.error.organization.insufficentPermission);

      const updatedCategory = await prisma.category
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

      if (updatedCategory instanceof MappedPrismaError)
        return status(updatedCategory.status, updatedCategory.response);

      return updatedCategory;
    },
    {
      auth: true,
      detail: {
        summary: 'Update category',
        description: 'Update a category by ID.',
        tags: ['Inventory', 'Categories'],
        security: [{ CookieAuth: [] }],
      },
      body: CategoryPlainInputUpdate,
      response: {
        ...ResponseSchemaSet,
        200: CategoryPlain,
        403: ErrorResponseSchema,
      },
    }
  )
  .delete(
    ':id',
    async ({ request: { headers }, status, params, session }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      if (
        !(await auth.api.hasPermission({
          headers,
          body: { permissions: { category: ['update'] } },
        }))
      )
        return status(403, tr.error.organization.insufficentPermission);

      const deletedCategory = await prisma.category
        .delete({
          where: {
            id: params.id,
            organizationId: session.activeOrganizationId,
          },
        })
        .catch(mapPrismaError);

      if (deletedCategory instanceof MappedPrismaError)
        return status(deletedCategory.status, deletedCategory.response);

      return deletedCategory;
    },
    {
      auth: true,
      detail: {
        summary: 'Delete category',
        description: 'Delete a category by ID.',
        tags: ['Inventory', 'Categories'],
        security: [{ CookieAuth: [] }],
      },
      response: {
        ...ResponseSchemaSet,
        200: CategoryPlain,
        403: ErrorResponseSchema,
      },
    }
  );
