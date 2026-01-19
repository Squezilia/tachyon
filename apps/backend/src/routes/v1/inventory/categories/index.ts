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
} from '@database';
import Elysia, { t } from 'elysia';
import { auth, authMacro, validateOrganizationPermission } from 'lib/auth';
import {
  MappedPrismaError,
  mapPrismaError,
  ResponseSchemaSet,
} from 'lib/error';
import prisma from 'lib/prisma';

export default () =>
  new Elysia({ prefix: '/categories' })
    .use(authMacro)
    .post(
      '/create',
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
    .get(
      '/get',
      async ({ request: { headers }, status, session, query }) => {
        if (!session.activeOrganizationId)
          return status(400, tr.error.organization.noActive);

        if (
          !(await auth.api.hasPermission({
            headers,
            body: { permissions: { category: ['view'] } },
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
      '/get/:id',
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
        response: {
          ...ResponseSchemaSet,
          200: CategoryPlain,
          403: ErrorResponseSchema,
        },
      }
    )
    .get(
      '/get/raw',
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
      '/update/:id',
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
      '/delete/:id',
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
