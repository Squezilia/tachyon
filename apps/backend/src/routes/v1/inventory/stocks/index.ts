import tr from '@/i18n/tr';
import Elysia, { ElysiaCustomStatusResponse } from 'elysia';
import { authMacro } from '@backend/lib/auth';
import {
  catchPrismaError,
  InterceptPrismaError,
  ErrorReferences,
} from '@backend/lib/error';
import prisma from '@database';
import model from './model';
import globals from '@/globals';

export default new Elysia()
  .use(authMacro)
  .use(globals)
  .use(model)
  .use(catchPrismaError)
  .guard({
    auth: true,
    detail: {
      tags: ['Inventory', 'Stock'],
      security: [{ CookieAuth: [] }],
    },
  })
  .post(
    '/',
    async ({ request: { headers }, status, body, session }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      const { productId, ...stockData } = body;

      // Ensure product belongs to the active organization
      const product = await prisma.product
        .findFirst({
          where: {
            id: productId,
            organizationId: session.activeOrganizationId,
          },
        })
        .catch(InterceptPrismaError);

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
        .catch(InterceptPrismaError);

      return status(201, createdStock);
    },
    {
      auth: true,
      permissions: { stock: ['create'] },
      detail: {
        summary: 'Create stock',
        description: 'Create a stock record for a product.',
        tags: ['Inventory', 'Stock'],
        security: [{ CookieAuth: [] }],
      },
      body: 'stockCreate',
      response: {
        ...ErrorReferences,
        201: 'stock',
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
      ]).catch(InterceptPrismaError);

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
      permissions: { stock: ['view'] },
      detail: {
        summary: 'List stock',
        description:
          'Retrieve a paginated list of stock records for the active organization.',
        tags: ['Inventory', 'Stock'],
        security: [{ CookieAuth: [] }],
      },
      query: 'paginationQuery',
      response: {
        ...ErrorReferences,
        200: 'stockPaginated',
        403: 'error',
      },
    }
  )
  .get(
    '/movements',
    async ({ request: { headers }, status, session, query }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

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
      ]).catch(InterceptPrismaError);

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
      permissions: { stock: ['view'] },
      detail: {
        summary: 'List movements',
        description:
          'Retrieve a paginated list of movement records for the active organization.',
        tags: ['Inventory', 'Stock'],
        security: [{ CookieAuth: [] }],
      },
      query: 'paginationQuery',
      response: {
        ...ErrorReferences,
        200: 'movementsPaginated',
        403: 'error',
      },
    }
  )
  .post(
    '/restock/:id',
    async ({ request: { headers }, status, params, body, session }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

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
        .catch(InterceptPrismaError);

      const [stockMovement] = transaction;

      return stockMovement;
    },
    {
      auth: true,
      permissions: { stock: ['restock'] },
      detail: {
        summary: 'Restock',
        description:
          'Increase stock quantity and record a stock movement entry.',
        tags: ['Inventory', 'Stock'],
        security: [{ CookieAuth: [] }],
      },
      body: 'move',
      response: {
        ...ErrorReferences,
        200: 'movement',
        403: 'error',
      },
    }
  )
  .post(
    '/drain/:id',
    async ({ request: { headers }, status, params, body, session }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

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
        .catch(InterceptPrismaError);

      const [stockMovement] = transaction;

      return stockMovement;
    },
    {
      auth: true,
      permissions: { stock: ['drain'] },
      detail: {
        summary: 'Drain',
        description:
          'Decrease stock quantity and record a stock movement entry.',
        tags: ['Inventory', 'Stock'],
        security: [{ CookieAuth: [] }],
      },
      body: 'move',
      response: {
        ...ErrorReferences,
        200: 'movement',
        403: 'error',
      },
    }
  );
