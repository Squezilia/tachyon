import tr from '@/i18n/tr';
import Elysia, { ElysiaCustomStatusResponse } from 'elysia';
import { authMacro } from '@backend/lib/auth';
import {
  handleError,
  InterceptPrismaError,
  ErrorReferences,
} from '@backend/lib/error';
import prisma from '@database';
import model from './model';
import { v7 } from 'uuid';
import globals from '@/globals';

export default new Elysia()
  .use(authMacro)
  .use(globals)
  .use(model)
  .guard({
    auth: true,
    detail: {
      tags: ['Inventory', 'Products'],
      security: [{ CookieAuth: [] }],
    },
  })
  .post(
    '/',
    async ({ request: { headers }, status, body, session }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      const { categoryId, ...productData } = body;

      // Ensure category belongs to the active organization
      const category = await prisma.category
        .findFirst({
          where: {
            id: categoryId,
            organizationId: session.activeOrganizationId,
          },
        })
        .catch(InterceptPrismaError);

      if (!category) return status(404, tr.error.category.notFound);

      const createdProduct = await prisma.product
        .create({
          data: {
            ...productData,
            categoryId: categoryId,
            organizationId: session.activeOrganizationId,
          },
        })
        .catch(InterceptPrismaError);

      return status(201, {
        ...createdProduct,
        price: createdProduct.price.toString(),
      });
    },
    {
      auth: true,
      permissions: { product: ['create'] },
      detail: {
        summary: 'Create product',
        description:
          'Create a new product within the active organization and assign a category.',
        tags: ['Inventory', 'Products'],
        security: [{ CookieAuth: [] }],
      },
      body: 'productCreate',
      response: {
        ...ErrorReferences,
        201: 'product',
        403: 'error',
      },
    }
  )
  .post(
    '/dupe/:id',
    async ({ request: { headers }, status, session, params: { id } }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      const product = await prisma.product
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

      if (!product) return status(404, tr.error.product.notFound);

      const createdProduct = await prisma.product
        .create({
          data: {
            ...product,
            name: `${product.name} - Kopyalandı`,
            appliedTaxes: {
              connect: product.appliedTaxes.map((tax) => ({
                id: tax.id,
              })),
            },
            id: v7(),
          },
        })
        .catch(InterceptPrismaError);

      return status(201, {
        ...createdProduct,
        price: createdProduct.price.toString(),
      });
    },
    {
      auth: true,
      permissions: { product: ['create', 'update'] },
      detail: {
        summary: 'Duplicate product',
        description:
          'Create a copy of a product, including its applied taxes, within the active organization.',
        tags: ['Inventory', 'Products'],
        security: [{ CookieAuth: [] }],
      },
      response: {
        ...ErrorReferences,
        201: 'product',
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
        prisma.product.findMany({
          take: query.max,
          skip: query.max * query.page,
          include: {
            category: true,
          },
          where: {
            organizationId: session.activeOrganizationId,
          },
        }),
        prisma.product.count({
          where: {
            organizationId: session.activeOrganizationId,
          },
        }),
      ]).catch(InterceptPrismaError);

      const [products, count] = transaction;

      return {
        data: products.map((product) => {
          return {
            ...product,
            price: product.price.toString(),
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
      permissions: { product: ['view'] },
      detail: {
        summary: 'List products',
        description:
          'Retrieve a paginated list of products for the active organization.',
        tags: ['Inventory', 'Products'],
        security: [{ CookieAuth: [] }],
      },
      query: 'paginationQuery',
      response: {
        ...ErrorReferences,
        200: 'paginatedProduct',
        403: 'error',
      },
    }
  )
  .get(
    '/:id',
    async ({ session, params, request: { headers }, status }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      const product = await prisma.product
        .findFirst({
          where: {
            id: params.id,
            organizationId: session.activeOrganizationId,
          },
        })
        .catch(InterceptPrismaError);

      if (!product) return status(404, tr.error.product.notFound);

      return {
        ...product,
        price: product.price.toString(),
      };
    },
    {
      auth: true,
      permissions: { product: ['view'] },
      detail: {
        summary: 'Get product',
        description: 'Retrieve a product by ID.',
        tags: ['Inventory', 'Products'],
        security: [{ CookieAuth: [] }],
      },
      response: {
        ...ErrorReferences,
        200: 'product',
        403: 'error',
      },
    }
  )
  .get(
    '/raw',
    async ({ session, request: { headers }, status }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      const product = await prisma.product
        .findMany({
          where: {
            organizationId: session.activeOrganizationId,
          },
          select: {
            name: true,
            id: true,
            price: true,
          },
        })
        .catch(InterceptPrismaError);

      return product.map((v) => {
        return {
          ...v,
          price: v.price.toString(),
        };
      });
    },
    {
      auth: true,
      permissions: { product: ['view'] },
      detail: {
        summary: 'List products (raw)',
        description:
          'Retrieve a lightweight product list (id, name, price) for the active organization.',
        tags: ['Inventory', 'Products'],
        security: [{ CookieAuth: [] }],
      },
      response: {
        ...ErrorReferences,
        200: 'productListRaw',
        403: 'error',
      },
    }
  )
  .patch(
    '/:id',
    async ({ request: { headers }, status, params, body, session }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      const updatedProduct = await prisma.product
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
        ...updatedProduct,
        price: updatedProduct.price.toString(),
      };
    },
    {
      auth: true,
      permissions: { product: ['update'] },
      detail: {
        summary: 'Update product',
        description: 'Update product fields by ID.',
        tags: ['Inventory', 'Products'],
        security: [{ CookieAuth: [] }],
      },
      body: 'productUpdate',
      response: {
        ...ErrorReferences,
        200: 'product',
        403: 'error',
      },
    }
  )
  .delete(
    '/:id',
    async ({ request: { headers }, status, params, session }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      const deletedProduct = await prisma.product
        .delete({
          where: {
            id: params.id,
            organizationId: session.activeOrganizationId,
          },
        })
        .catch(InterceptPrismaError);

      return {
        ...deletedProduct,
        price: deletedProduct.price.toString(),
      };
    },
    {
      auth: true,
      permissions: { product: ['delete'] },
      detail: {
        summary: 'Delete product',
        description: 'Delete a product by ID.',
        tags: ['Inventory', 'Products'],
        security: [{ CookieAuth: [] }],
      },
      response: {
        ...ErrorReferences,
        200: 'product',
        403: 'error',
      },
    }
  );
