import Elysia from 'elysia';
import { authMacro } from '@backend/lib/auth';
import tr from '@/i18n/tr';
import prisma from '@database';
import {
  handleError,
  InterceptPrismaError,
  ErrorReferences,
} from '@backend/lib/error';
import globals from '@/globals';
import calculateTotal, { calculateTax, updateTaxes } from '../service';
import { CartProductTax, Prisma } from '@database/prisma';
import { v7 } from 'uuid';
import model from './model';

export default new Elysia()
  .use(authMacro)
  .use(globals)
  .use(model)
  .use(handleError)
  .post(
    '/',
    async ({ session, status, request: { headers }, body }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      const stocks = await prisma.stock.findMany({
        where: {
          id: {
            in: Object.keys(body.stocks),
          },
          organizationId: session.activeOrganizationId,
        },
        include: {
          product: {
            include: {
              appliedTaxes: {
                orderBy: {
                  priority: 'asc',
                },
              },
            },
          },
        },
      });

      const calculatedTotal = await calculateTotal(
        session.activeOrganizationId,
        session.userId,
        stocks,
        body.stocks
      ).catch(InterceptPrismaError);

      const { appliedTaxes, cartConfig, movementConfig, sub, tax, total } =
        calculatedTotal;

      const transaction = await prisma
        .$transaction([
          prisma.order.create({
            data: {
              status: 'OPEN',
              tableId: body.tableId,
              organizationId: session.activeOrganizationId,
              issuerId: session.userId,
              sub,
              tax,
              total,
              products: {
                createMany: {
                  data: cartConfig,
                },
              },
            },
          }),
          prisma.stockMovement.createMany({
            data: movementConfig,
          }),
          prisma.cartProductTax.createMany({
            data: appliedTaxes,
          }),
        ])
        .catch(InterceptPrismaError);

      const [order] = transaction;

      return {
        ...order,
        sub: order.sub.toString(),
        total: order.total.toString(),
        tax: order.tax.toString(),
      };
    },
    {
      auth: true,
      permissions: { gastro: ['order'] },
      detail: {
        summary: 'Create order',
        description:
          'Create a new gastro order: validate stock, calculate taxes/totals, create order and related movement/tax records.',
        tags: ['Gastro', 'Orders'],
        security: [{ CookieAuth: [] }],
      },
      body: 'createOrder',
      response: {
        ...ErrorReferences,
        200: 'order',
        403: 'error',
      },
    }
  )
  .post(
    '/:id',
    async ({ session, status, params, request: { headers }, body }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      const order = await prisma.order
        .findFirst({
          where: {
            organizationId: session.activeOrganizationId,
            id: params.id,
            status: 'OPEN',
          },
          include: {
            products: {
              include: {
                appliedTaxes: {
                  orderBy: {
                    priority: 'asc',
                  },
                },
              },
            },
          },
        })
        .catch(InterceptPrismaError);

      if (!order) return status(404, tr.error.gastro.order.notFound);

      const leftovers: Record<string, number | undefined> = {
        ...body.stocks,
      };
      const diffTable: Record<
        string,
        {
          change: number;
          to: number;
          cartId: string;
          taxes: CartProductTax[];
          total: Prisma.Decimal;
          sub: Prisma.Decimal;
          tax: Prisma.Decimal;
        }
      > = {};

      const oldTable: Record<string, boolean> = {};

      for (const cartProduct of order.products) {
        const oldVal = cartProduct.quantity;
        const newVal = body.stocks[cartProduct.stockId];

        oldTable[cartProduct.stockId] = true;

        // new value is exists so we can calculate our diff
        if (newVal) {
          const diff = newVal - oldVal;
          leftovers[cartProduct.stockId] = undefined;
          diffTable[cartProduct.stockId] = {
            change: diff,
            to: newVal,
            cartId: cartProduct.id,
            taxes: cartProduct.appliedTaxes,
            sub: cartProduct.sub,
            total: cartProduct.total,
            tax: cartProduct.tax,
          };
          continue;
        }

        // new value isn't exists, that means this key is deleted
        if (!newVal) {
          const diff = -oldVal;
          leftovers[cartProduct.stockId] = undefined;
          diffTable[cartProduct.stockId] = {
            change: diff,
            to: 0,
            cartId: cartProduct.id,
            taxes: cartProduct.appliedTaxes,
            sub: cartProduct.sub,
            total: cartProduct.total,
            tax: cartProduct.tax,
          };
          continue;
        }
      }

      for (const key of Object.keys(leftovers)) {
        const newVal = body.stocks[key];
        if (!newVal) continue;

        // old value doesn't exists so that means this key is added
        if (!oldTable[key]) {
          leftovers[key] = undefined;
          diffTable[key] = {
            change: newVal,
            to: newVal,
            cartId: v7(),
            taxes: [],
            sub: Prisma.Decimal(0),
            total: Prisma.Decimal(0),
            tax: Prisma.Decimal(0),
          };
          continue;
        }

        // we don't have to do new value checks because they're already completed previous loop
      }

      const stocks = await prisma.stock
        .findMany({
          where: {
            id: {
              in: Object.keys(diffTable),
            },
            organizationId: session.activeOrganizationId,
          },
          include: {
            product: {
              include: {
                appliedTaxes: {
                  orderBy: {
                    priority: 'asc',
                  },
                },
              },
            },
          },
        })
        .catch(InterceptPrismaError);

      const movements: Prisma.StockMovementCreateManyInput[] = [];
      const createdProducts: Prisma.CartProductCreateManyInput[] = [];
      const updatedProducts: Prisma.CartProductUpdateArgs[] = [];
      const deletedProductIds: string[] = [];
      let createdTaxes: Prisma.CartProductTaxCreateManyInput[] = [];
      let updatedTaxes: Prisma.CartProductTaxUpdateArgs[] = [];

      let changeInTotal = Prisma.Decimal(0);
      let changeInSub = Prisma.Decimal(0);
      let changeInTax = Prisma.Decimal(0);

      for (const stock of stocks) {
        const diff = diffTable[stock.id];

        if (!diff || diff.change === 0) continue;

        movements.push({
          stockId: stock.id,
          createdById: session.userId,
          organizationId: session.activeOrganizationId,
          reason: diff.change > 0 ? 'SALE' : 'REVERSAL',
          quantityChange: diff.change,
        });

        // item deleted
        if (diff.change < 0 && diff.to === 0) {
          changeInSub = changeInSub.sub(diff.sub);
          changeInTotal = changeInTotal.sub(diff.total);
          changeInTax = changeInTax.sub(diff.tax);
          deletedProductIds.push(diff.cartId);
          continue;
        }

        // item added
        if (diff.change == diff.to) {
          const { appliedTax, appliedTaxes, productSub, total } = calculateTax(
            stock.product,
            diff.to,
            diff.cartId
          );

          changeInSub = changeInSub.plus(productSub);
          changeInTotal = changeInTotal.plus(total);
          changeInTax = changeInTax.plus(appliedTax);

          createdTaxes = createdTaxes.concat(appliedTaxes);

          createdProducts.push({
            id: diff.cartId,
            priceAtSale: stock.product.price,
            productId: stock.productId,
            productName: stock.product.name,
            quantity: diff.to,
            tax: appliedTax,
            sub: productSub,
            total,
            stockId: stock.id,
            orderId: order.id,
          });
          continue;
        }

        // item updated
        const { appliedTaxes, appliedTax, productSub, total } = updateTaxes(
          diff.taxes,
          stock.product.price,
          diff.to
        );

        changeInSub = changeInSub.plus(productSub.sub(diff.sub));
        changeInTotal = changeInTotal.plus(total.sub(diff.total));
        changeInTax = changeInTax.plus(appliedTax.sub(diff.tax));

        updatedTaxes = updatedTaxes.concat(appliedTaxes);

        updatedProducts.push({
          where: {
            id: diff.cartId,
          },
          data: {
            quantity: diff.to,
            tax: appliedTax,
            sub: productSub,
            total,
          },
        });
      }

      const transaction = await prisma
        .$transaction(async (tx) => {
          await tx.stockMovement.createMany({ data: movements });

          await tx.cartProduct.deleteMany({
            where: { id: { in: deletedProductIds } },
          });

          await tx.cartProduct.createMany({ data: createdProducts });

          await Promise.all(
            updatedProducts.map((p) => tx.cartProduct.update(p))
          );

          await tx.cartProductTax.createMany({ data: createdTaxes });
          await Promise.all(
            updatedTaxes.map((t) => tx.cartProductTax.update(t))
          );

          return await tx.order.update({
            where: {
              id: params.id,
            },
            data: {
              total: {
                increment: changeInTotal,
              },
              sub: {
                increment: changeInSub,
              },
              tax: {
                increment: changeInTax,
              },
            },
          });
        })
        .catch(InterceptPrismaError);

      return {
        ...transaction,
        total: transaction.total.toString(),
        sub: transaction.sub.toString(),
        tax: transaction.tax.toString(),
      };
    },
    {
      auth: true,
      permissions: { gastro: ['order'] },
      detail: {
        summary: 'Update order items',
        description:
          'Update an open order by replacing its item quantities: compute diffs, record stock movements, update cart products/taxes, and adjust order totals.',
        tags: ['Gastro', 'Orders'],
        security: [{ CookieAuth: [] }],
      },
      body: 'updateOrder',
      response: {
        ...ErrorReferences,
        403: 'error',
        200: 'order',
      },
    }
  )
  .post(
    '/close/:id',
    async ({ session, status, params, request: { headers } }) => {
      if (!session.activeOrganizationId)
        return status(400, tr.error.organization.noActive);

      const order = await prisma.order
        .findFirst({
          where: {
            organizationId: session.activeOrganizationId,
            id: params.id,
            status: 'OPEN',
          },
        })
        .catch(InterceptPrismaError);

      if (!order) return status(404, tr.error.gastro.order.notFound);

      const updatedOrder = await prisma.order
        .update({
          where: {
            id: params.id,
          },
          data: {
            status: 'CLOSED',
          },
        })
        .catch(InterceptPrismaError);

      return {
        ...updatedOrder,
        tax: updatedOrder.tax.toString(),
        total: updatedOrder.total.toString(),
        sub: updatedOrder.sub.toString(),
      };
    },
    {
      auth: true,
      permissions: { gastro: ['close'] },
      detail: {
        summary: 'Close order',
        description: 'Mark an open order as closed.',
        tags: ['Gastro', 'Orders'],
        security: [{ CookieAuth: [] }],
      },
      response: {
        ...ErrorReferences,
        403: 'error',
        200: 'order',
      },
    }
  )
  .post('/refund', () => {}, {
    auth: true,
    detail: {
      summary: 'Refund order',
      description: 'Refund flow is not implemented (stub endpoint).',
      tags: ['Gastro', 'Orders'],
      security: [{ CookieAuth: [] }],
    },
  });
