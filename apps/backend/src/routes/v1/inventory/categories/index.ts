import tr from '@/i18n/tr';
import Elysia, { ElysiaCustomStatusResponse } from 'elysia';
import { authMacro } from '@backend/lib/auth';
import {
  handleError,
  InterceptPrismaError,
  ErrorReferences,
} from '@backend/lib/error';
import prisma from '@database';
import { v7 } from 'uuid';
import model from './model';
import globals from '@/globals';

export default new Elysia()
  .use(authMacro)
  .use(globals)
  .use(model)
  .post(
    '/',
    async ({ request: { headers }, status, body, session }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      const createdCategory = await prisma.category
        .create({
          data: {
            ...body,
            organizationId: session.activeOrganizationId,
          },
        })
        .catch(InterceptPrismaError);

      return status(201, createdCategory);
    },
    {
      auth: true,
      permissions: { category: ['create'] },
      detail: {
        summary: 'Create category',
        description: 'Create a new category within the active organization.',
        tags: ['Inventory', 'Categories'],
        security: [{ CookieAuth: [] }],
      },
      body: 'categoryCreate',
      response: {
        ...ErrorReferences,
        201: 'category',
        400: 'error',
      },
    }
  )
  .post(
    '/dupe/:id',
    async ({ request: { headers }, status, session, params: { id } }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

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
        .catch(InterceptPrismaError);

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
        .catch(InterceptPrismaError);

      return status(201, createdCategory);
    },
    {
      auth: true,
      permissions: { category: ['create'] },
      detail: {
        summary: 'Duplicate category',
        description:
          'Create a copy of a category, including its applied taxes, within the active organization.',
        tags: ['Inventory', 'Categories'],
        security: [{ CookieAuth: [] }],
      },
      response: {
        ...ErrorReferences,
        201: 'category',
      },
    }
  )
  .get(
    '/',
    async ({ request: { headers }, status, session, query }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

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
      ]).catch(InterceptPrismaError);

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
      permissions: { category: ['view'] },
      detail: {
        summary: 'List categories',
        description:
          'Retrieve a paginated list of categories for the active organization.',
        tags: ['Inventory', 'Categories'],
        security: [{ CookieAuth: [] }],
      },
      query: 'paginationQuery',
      response: {
        ...ErrorReferences,
        200: 'categoryPaginated',
      },
    }
  )
  .get(
    ':id',
    async ({ session, params, request: { headers }, status }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      const category = await prisma.category
        .findFirst({
          where: {
            id: params.id,
            organizationId: session.activeOrganizationId,
          },
        })
        .catch(InterceptPrismaError);

      if (!category) return status(404, tr.error.category.notFound);

      return category;
    },
    {
      auth: true,
      permissions: { category: ['view'] },
      detail: {
        summary: 'Get category',
        description: 'Retrieve a category by ID.',
        tags: ['Inventory', 'Categories'],
        security: [{ CookieAuth: [] }],
      },
      response: {
        ...ErrorReferences,
        200: 'category',
        403: 'error',
      },
    }
  )
  .get(
    '/raw',
    async ({ session, request: { headers }, status }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

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
        .catch(InterceptPrismaError);

      return category;
    },
    {
      auth: true,
      permissions: { category: ['view'] },
      detail: {
        summary: 'List categories (raw)',
        description:
          'Retrieve a lightweight category list (id, name) for the active organization.',
        tags: ['Inventory', 'Categories'],
        security: [{ CookieAuth: [] }],
      },
      response: {
        ...ErrorReferences,
        200: 'categoryRawList',
        403: 'error',
      },
    }
  )
  .patch(
    ':id',
    async ({ request: { headers }, status, params, body, session }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

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
        .catch(InterceptPrismaError);

      return updatedCategory;
    },
    {
      auth: true,
      permissions: { category: ['update'] },
      detail: {
        summary: 'Update category',
        description: 'Update a category by ID.',
        tags: ['Inventory', 'Categories'],
        security: [{ CookieAuth: [] }],
      },
      body: 'categoryUpdate',
      response: {
        ...ErrorReferences,
        200: 'category',
        403: 'error',
      },
    }
  )
  .delete(
    ':id',
    async ({ request: { headers }, status, params, session }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      const deletedCategory = await prisma.category
        .delete({
          where: {
            id: params.id,
            organizationId: session.activeOrganizationId,
          },
        })
        .catch(InterceptPrismaError);

      return deletedCategory;
    },
    {
      auth: true,
      permissions: { category: ['delete'] },
      detail: {
        summary: 'Delete category',
        description: 'Delete a category by ID.',
        tags: ['Inventory', 'Categories'],
        security: [{ CookieAuth: [] }],
      },
      response: {
        ...ErrorReferences,
        200: 'category',
        403: 'error',
      },
    }
  );
