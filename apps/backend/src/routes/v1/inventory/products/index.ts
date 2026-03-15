import tr from '@/i18n/tr';
import {
  ErrorResponseSchema,
  PaginationQuery,
  ResponsePaginate,
} from '@/model';
import {
  ProductPlain,
  ProductPlainInputCreate,
  ProductPlainInputUpdate,
} from '@database';
import Elysia, { t } from 'elysia';
import { auth, authMacro } from 'lib/auth';
import {
  MappedPrismaError,
  mapPrismaError,
  ResponseSchemaSet,
} from 'lib/error';
import prisma from 'lib/prisma';
import { ProductListItem } from './index.model';
import { v7 } from 'uuid';

export default () =>
  new Elysia({ prefix: '/products' })
    .use(authMacro)
    // .guard({
    //   auth: true,
    //   detail: {
    //     tags: ['Inventory', 'Products'],
    //     security: [{ CookieAuth: [] }],
    //   },
    // })
    .post(
      '/',
      async ({ request: { headers }, status, body, session }) => {
        if (!session.activeOrganizationId)
          return status(400, tr.error.organization.noActive);

        const { categoryId, ...productData } = body;

        if (
          !(await auth.api.hasPermission({
            headers,
            body: { permissions: { product: ['create'] } },
          }))
        )
          return status(403, tr.error.organization.insufficentPermission);

        // Ensure category belongs to the active organization
        const category = await prisma.category.findFirst({
          where: {
            id: categoryId,
            organizationId: session.activeOrganizationId,
          },
        });

        if (!category) return status(404, tr.error.category.notFound);

        const createdProduct = await prisma.product
          .create({
            data: {
              ...productData,
              categoryId: categoryId,
              organizationId: session.activeOrganizationId,
            },
          })
          .catch(mapPrismaError);

        if (createdProduct instanceof MappedPrismaError) {
          return status(createdProduct.status, createdProduct.response);
        }

        return status(201, {
          ...createdProduct,
          price: createdProduct.price.toString(),
        });
      },
      {
        auth: true,
        detail: {
          summary: 'Create product',
          description:
            'Create a new product within the active organization and assign a category.',
          tags: ['Inventory', 'Products'],
          security: [{ CookieAuth: [] }],
        },
        body: t.Composite([
          ProductPlainInputCreate,
          t.Object({
            categoryId: t.String(),
          }),
        ]),
        response: {
          ...ResponseSchemaSet,
          201: ProductPlain,
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
            body: { permissions: { product: ['create', 'update'] } },
          }))
        )
          return status(403, tr.error.organization.insufficentPermission);

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
          .catch(mapPrismaError);

        if (product instanceof MappedPrismaError)
          return status(product.status, product.response);

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
          .catch(mapPrismaError);

        if (createdProduct instanceof MappedPrismaError)
          return status(createdProduct.status, createdProduct.response);

        return status(201, {
          ...createdProduct,
          price: createdProduct.price.toString(),
        });
      },
      {
        auth: true,
        detail: {
          summary: 'Duplicate product',
          description:
            'Create a copy of a product, including its applied taxes, within the active organization.',
          tags: ['Inventory', 'Products'],
          security: [{ CookieAuth: [] }],
        },
        response: {
          ...ResponseSchemaSet,
          201: ProductPlain,
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
            body: { permissions: { product: ['view'] } },
          }))
        )
          return status(403, tr.error.organization.insufficentPermission);

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
        ]).catch(mapPrismaError);

        if (transaction instanceof MappedPrismaError) {
          return status(transaction.status, transaction.response);
        }

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
        detail: {
          summary: 'List products',
          description:
            'Retrieve a paginated list of products for the active organization.',
          tags: ['Inventory', 'Products'],
          security: [{ CookieAuth: [] }],
        },
        query: PaginationQuery,
        response: {
          ...ResponseSchemaSet,
          200: ResponsePaginate(ProductListItem),
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
            body: { permissions: { product: ['view'] } },
          }))
        )
          return status(403, tr.error.organization.insufficentPermission);

        const product = await prisma.product
          .findFirst({
            where: {
              id: params.id,
              organizationId: session.activeOrganizationId,
            },
          })
          .catch(mapPrismaError);

        if (product instanceof MappedPrismaError) {
          return status(product.status, product.response);
        }

        if (!product) return status(404, tr.error.product.notFound);

        return {
          ...product,
          price: product.price.toString(),
        };
      },
      {
        auth: true,
        detail: {
          summary: 'Get product',
          description: 'Retrieve a product by ID.',
          tags: ['Inventory', 'Products'],
          security: [{ CookieAuth: [] }],
        },
        response: {
          ...ResponseSchemaSet,
          200: ProductPlain,
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
            body: { permissions: { product: ['view'] } },
          }))
        )
          return status(403, tr.error.organization.insufficentPermission);

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
          .catch(mapPrismaError);

        if (product instanceof MappedPrismaError) {
          return status(product.status, product.response);
        }

        return product.map((v) => {
          return {
            ...v,
            price: v.price.toString(),
          };
        });
      },
      {
        auth: true,
        detail: {
          summary: 'List products (raw)',
          description:
            'Retrieve a lightweight product list (id, name, price) for the active organization.',
          tags: ['Inventory', 'Products'],
          security: [{ CookieAuth: [] }],
        },
        response: {
          ...ResponseSchemaSet,
          200: t.Array(
            t.Object({
              name: t.String(),
              id: t.String(),
              price: t.String(),
            })
          ),
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
            body: { permissions: { product: ['delete'] } },
          }))
        )
          return status(403, tr.error.organization.insufficentPermission);

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
          .catch(mapPrismaError);

        if (updatedProduct instanceof MappedPrismaError)
          return status(updatedProduct.status, updatedProduct.response);

        return {
          ...updatedProduct,
          price: updatedProduct.price.toString(),
        };
      },
      {
        auth: true,
        detail: {
          summary: 'Update product',
          description: 'Update product fields by ID.',
          tags: ['Inventory', 'Products'],
          security: [{ CookieAuth: [] }],
        },
        body: t.Composite([
          ProductPlainInputUpdate,
          t.Object({ categoryId: t.Optional(t.String()) }),
        ]),
        response: {
          ...ResponseSchemaSet,
          200: ProductPlain,
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
            body: { permissions: { product: ['update'] } },
          }))
        )
          return status(403, tr.error.organization.insufficentPermission);

        const deletedProduct = await prisma.product
          .delete({
            where: {
              id: params.id,
              organizationId: session.activeOrganizationId,
            },
          })
          .catch(mapPrismaError);

        if (deletedProduct instanceof MappedPrismaError)
          return status(deletedProduct.status, deletedProduct.response);

        return {
          ...deletedProduct,
          price: deletedProduct.price.toString(),
        };
      },
      {
        auth: true,
        detail: {
          summary: 'Delete product',
          description: 'Delete a product by ID.',
          tags: ['Inventory', 'Products'],
          security: [{ CookieAuth: [] }],
        },
        response: {
          ...ResponseSchemaSet,
          200: ProductPlain,
          403: ErrorResponseSchema,
        },
      }
    );
