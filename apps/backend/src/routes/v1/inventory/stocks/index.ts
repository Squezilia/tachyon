import tr from '@/i18n/tr';
import {
  ErrorResponseSchema,
  PaginationQuery,
  ResponsePaginate,
} from '@/model';
import {
  StockMovementPlain,
  StockMovementPlainInputCreate,
  StockPlain,
  StockPlainInputCreate,
} from '@database';
import Elysia, { t } from 'elysia';
import { auth, authMacro } from 'lib/auth';
import {
  MappedPrismaError,
  mapPrismaError,
  ResponseSchemaSet,
} from 'lib/error';
import prisma from 'lib/prisma';
import { StockListItem } from './index.model';

export default () =>
  new Elysia({ prefix: '/stocks' })
    .use(authMacro)
    .guard({
      auth: true,
      detail: {
        tags: ['Inventory', 'Stock'],
        security: [{ CookieAuth: [] }],
      },
    })
    .post(
      '/create',
      async ({ request: { headers }, status, body, session }) => {
        if (!session.activeOrganizationId)
          return status(400, tr.error.organization.noActive);

        const { productId, ...stockData } = body;

        if (
          !(await auth.api.hasPermission({
            headers,
            body: { permissions: { stock: ['create'] } },
          }))
        )
          return status(403, tr.error.organization.insufficentPermission);

        // Ensure product belongs to the active organization
        const product = await prisma.product.findFirst({
          where: {
            id: productId,
            organizationId: session.activeOrganizationId,
          },
        });

        if (!product) return status(404, tr.error.product.notFound);

        const createdStock = await prisma.stock
          .create({
            data: {
              ...stockData,
              productId,
              organizationId: session.activeOrganizationId,
              stockMovements: {
                create: {
                  organizationId: session.activeOrganizationId,
                  reason: 'RESTOCK',
                  quantityChange: stockData.quantity,
                  createdById: session.userId,
                },
              },
            },
          })
          .catch(mapPrismaError);

        if (createdStock instanceof MappedPrismaError)
          return status(createdStock.status, createdStock.response);

        return status(201, createdStock);
      },
      {
        auth: true,
        detail: {
          summary: 'Create stock',
          description: 'Create a stock record for a product.',
          tags: ['Inventory', 'Stock'],
          security: [{ CookieAuth: [] }],
        },
        body: t.Composite([
          StockPlainInputCreate,
          t.Object({ productId: t.String() }),
        ]),
        response: {
          ...ResponseSchemaSet,
          201: StockPlain,
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
            body: { permissions: { stock: ['view'] } },
          }))
        )
          return status(403, tr.error.organization.insufficentPermission);

        const transaction = await Promise.all([
          prisma.stock.findMany({
            take: query.max,
            skip: query.max * query.page,
            include: {
              product: true,
            },
            where: {
              organizationId: session.activeOrganizationId,
            },
          }),
          prisma.stock.count({
            where: {
              organizationId: session.activeOrganizationId,
            },
          }),
        ]).catch(mapPrismaError);

        if (transaction instanceof MappedPrismaError) {
          return status(transaction.status, transaction.response);
        }

        const [stocks, count] = transaction;

        return {
          data: stocks.map((item) => {
            return {
              ...item,
              product: {
                ...item.product,
                price: item.product.price.toString(),
              },
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
          summary: 'List stock',
          description:
            'Retrieve a paginated list of stock records for the active organization.',
          tags: ['Inventory', 'Stock'],
          security: [{ CookieAuth: [] }],
        },
        query: PaginationQuery,
        response: {
          ...ResponseSchemaSet,
          200: ResponsePaginate(StockListItem),
          403: ErrorResponseSchema,
        },
      }
    )
    .get(
      '/movements',
      async ({ request: { headers }, status, session, query }) => {
        if (!session.activeOrganizationId)
          return status(400, tr.error.organization.noActive);

        if (
          !(await auth.api.hasPermission({
            headers,
            body: { permissions: { stock: ['view'] } },
          }))
        )
          return status(403, tr.error.organization.insufficentPermission);

        const transaction = await Promise.all([
          prisma.stockMovement.findMany({
            take: query.max,
            skip: query.max * query.page,
            where: {
              organizationId: session.activeOrganizationId,
            },
            include: {
              createdBy: {
                select: {
                  name: true,
                },
              },
            },
          }),
          prisma.stockMovement.count({
            where: {
              organizationId: session.activeOrganizationId,
            },
          }),
        ]).catch(mapPrismaError);

        if (transaction instanceof MappedPrismaError) {
          return status(transaction.status, transaction.response);
        }

        const [movements, count] = transaction;

        return {
          data: movements,
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
          summary: 'List movements',
          description:
            'Retrieve a paginated list of movement records for the active organization.',
          tags: ['Inventory', 'Stock'],
          security: [{ CookieAuth: [] }],
        },
        query: PaginationQuery,
        response: {
          ...ResponseSchemaSet,
          200: ResponsePaginate(
            t.Composite([
              StockMovementPlain,
              t.Object({ createdBy: t.Object({ name: t.String() }) }),
            ])
          ),
          403: ErrorResponseSchema,
        },
      }
    )
    .post(
      '/restock/:id',
      async ({ request: { headers }, status, params, body, session }) => {
        if (!session.activeOrganizationId)
          return status(400, tr.error.organization.noActive);

        if (
          !(await auth.api.hasPermission({
            headers,
            body: { permissions: { stock: ['restock'] } },
          }))
        )
          return status(403, tr.error.organization.insufficentPermission);

        const transaction = await prisma
          .$transaction([
            prisma.stockMovement.create({
              data: {
                organizationId: session.activeOrganizationId,
                stockId: params.id,
                reason: body.reason,
                quantityChange: body.quantityChange,
                createdById: session.userId,
              },
            }),
            prisma.stock.update({
              where: {
                id: params.id,
                organizationId: session.activeOrganizationId,
              },
              data: {
                quantity: {
                  increment: body.quantityChange,
                },
              },
            }),
          ])
          .catch(mapPrismaError);

        if (transaction instanceof MappedPrismaError) {
          return status(transaction.status, transaction.response);
        }

        const [stockMovement] = transaction;

        return stockMovement;
      },
      {
        auth: true,
        detail: {
          summary: 'Restock',
          description:
            'Increase stock quantity and record a stock movement entry.',
          tags: ['Inventory', 'Stock'],
          security: [{ CookieAuth: [] }],
        },
        body: t.Intersect([
          StockMovementPlainInputCreate,
          t.Object({
            quantityChange: t.Integer({
              minimum: 1,
            }),
          }),
        ]),
        response: {
          ...ResponseSchemaSet,
          200: StockMovementPlain,
          403: ErrorResponseSchema,
        },
      }
    )
    .post(
      '/drain/:id',
      async ({ request: { headers }, status, params, body, session }) => {
        if (!session.activeOrganizationId)
          return status(400, tr.error.organization.noActive);

        if (
          !(await auth.api.hasPermission({
            headers,
            body: { permissions: { stock: ['drain'] } },
          }))
        )
          return status(403, tr.error.organization.insufficentPermission);

        const transaction = await prisma
          .$transaction([
            prisma.stockMovement.create({
              data: {
                organizationId: session.activeOrganizationId,
                stockId: params.id,
                reason: body.reason,
                quantityChange: -body.quantityChange,
                createdById: session.userId,
              },
            }),
            prisma.stock.update({
              where: {
                id: params.id,
                organizationId: session.activeOrganizationId,
              },
              data: {
                quantity: {
                  decrement: body.quantityChange,
                },
              },
            }),
          ])
          .catch(mapPrismaError);

        if (transaction instanceof MappedPrismaError) {
          return status(transaction.status, transaction.response);
        }

        const [stockMovement] = transaction;

        return stockMovement;
      },
      {
        auth: true,
        detail: {
          summary: 'Drain',
          description:
            'Decrease stock quantity and record a stock movement entry.',
          tags: ['Inventory', 'Stock'],
          security: [{ CookieAuth: [] }],
        },
        body: t.Intersect([
          StockMovementPlainInputCreate,
          t.Object({
            quantityChange: t.Integer({
              minimum: 1,
            }),
          }),
        ]),
        response: {
          ...ResponseSchemaSet,
          200: StockMovementPlain,
          403: ErrorResponseSchema,
        },
      }
    );
