import Elysia, { t } from 'elysia';
import { auth, authMacro } from 'lib/auth';
import orders from './orders';
import tables from './tables';
import tr from '@/i18n/tr';
import prisma from '@backend/lib/prisma';
import { Decimal, OrderPlain } from '@database';
import {
  MappedPrismaError,
  mapPrismaError,
  ResponseSchemaSet,
} from '@backend/lib/error';
import { ErrorResponseSchema } from '@/model';
import calculateTotal, { calculateTax, updateTaxes } from '../service';
import { CartProductTax, Prisma } from '@database/generated/prisma/client';
import { v7 } from 'uuid';

export default () =>
  new Elysia({ prefix: '/gastro' })
    .use(authMacro)
    .use(orders)
    .use(tables)
    .post(
      '/order',
      async ({ session, status, request: { headers }, body }) => {
        if (!session.activeOrganizationId)
          return status(400, tr.error.organization.noActive);

        if (
          !(await auth.api.hasPermission({
            headers,
            body: { permissions: { gastro: ['order'] } },
          }))
        )
          return status(403, tr.error.organization.insufficentPermission);

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
        ).catch(mapPrismaError);

        if (calculatedTotal instanceof MappedPrismaError)
          return status(calculatedTotal.status, calculatedTotal.response);

        const {
          appliedTaxes,
          cartConfig,
          movementConfig,
          rawTotal,
          taxTotal,
          total,
        } = calculatedTotal;

        const transaction = await prisma
          .$transaction([
            prisma.order.create({
              data: {
                status: 'OPEN',
                tableId: body.tableId,
                organizationId: session.activeOrganizationId,
                issuerId: session.userId,
                rawTotal,
                tax: taxTotal,
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
          .catch(mapPrismaError);

        if (transaction instanceof MappedPrismaError)
          return status(transaction.status, transaction.response);

        const [order] = transaction;

        return {
          ...order,
          rawTotal: order.rawTotal.toString(),
          total: order.total.toString(),
          tax: order.tax.toString(),
        };
      },
      {
        auth: true,
        body: t.Object({
          tableId: t.Optional(t.String()),
          stocks: t.Record(t.String(), t.Integer()),
        }),
        response: {
          ...ResponseSchemaSet,
          403: ErrorResponseSchema,
          200: OrderPlain,
        },
      }
    )
    .post(
      '/update/:id',
      async ({ session, status, params, request: { headers }, body }) => {
        if (!session.activeOrganizationId)
          return status(400, tr.error.organization.noActive);

        if (
          !(await auth.api.hasPermission({
            headers,
            body: { permissions: { gastro: ['order'] } },
          }))
        )
          return status(403, tr.error.organization.insufficentPermission);

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
          .catch(mapPrismaError);

        if (order instanceof MappedPrismaError)
          return status(order.status, order.response);

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
            total: Decimal;
            sub: Decimal;
            tax: Decimal;
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
              sub: cartProduct.subtotal,
              total: cartProduct.total,
              tax: cartProduct.totalTax,
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
              sub: cartProduct.subtotal,
              total: cartProduct.total,
              tax: cartProduct.totalTax,
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
              sub: Decimal(0),
              total: Decimal(0),
              tax: Decimal(0),
            };
            continue;
          }

          // we don't have to do new value checks because they're already completed previous loop
        }

        console.log(diffTable);

        const stocks = await prisma.stock.findMany({
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
        });

        const movements: Prisma.StockMovementCreateManyInput[] = [];
        const createdProducts: Prisma.CartProductCreateManyInput[] = [];
        const updatedProducts: Prisma.CartProductUpdateArgs[] = [];
        const deletedProductIds: string[] = [];
        let createdTaxes: Prisma.CartProductTaxCreateManyInput[] = [];
        let updatedTaxes: Prisma.CartProductTaxUpdateArgs[] = [];

        let changeInTotal = Decimal(0);
        let changeInSub = Decimal(0);
        let changeInTax = Decimal(0);

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
            const { appliedTax, appliedTaxes, subtotal, total } = calculateTax(
              stock.product,
              diff.to,
              diff.cartId
            );

            changeInSub = changeInSub.plus(subtotal);
            changeInTotal = changeInTotal.plus(total);
            changeInTax = changeInTax.plus(appliedTax);

            createdTaxes = createdTaxes.concat(appliedTaxes);

            createdProducts.push({
              id: diff.cartId,
              priceAtSale: stock.product.price,
              productId: stock.productId,
              productName: stock.product.name,
              quantity: diff.to,
              totalTax: appliedTax,
              subtotal,
              total,
              stockId: stock.id,
              orderId: order.id,
            });
            continue;
          }

          // item updated
          const { appliedTaxes, appliedTax, subtotal, total } = updateTaxes(
            diff.taxes,
            stock.product.price,
            diff.to
          );

          changeInSub = changeInSub.plus(subtotal.sub(diff.sub));
          changeInTotal = changeInTotal.plus(total.sub(diff.total));
          changeInTax = changeInTax.plus(appliedTax.sub(diff.tax));

          updatedTaxes = updatedTaxes.concat(appliedTaxes);

          updatedProducts.push({
            where: {
              id: diff.cartId,
            },
            data: {
              quantity: diff.to,
              totalTax: appliedTax,
              subtotal,
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
                rawTotal: {
                  increment: changeInSub,
                },
                tax: {
                  increment: changeInTax,
                },
              },
            });
          })
          .catch(mapPrismaError);

        if (transaction instanceof MappedPrismaError)
          return status(transaction.status, transaction.response);

        return {
          ...transaction,
          total: transaction.total.toString(),
          rawTotal: transaction.rawTotal.toString(),
          tax: transaction.tax.toString(),
        };
      },
      {
        auth: true,
        body: t.Object({
          stocks: t.Record(t.String(), t.Integer()),
        }),
        response: {
          ...ResponseSchemaSet,
          403: ErrorResponseSchema,
          200: OrderPlain,
        },
      }
    )
    .post(
      '/close/:id',
      async ({ session, status, params, request: { headers }, body }) => {
        if (!session.activeOrganizationId)
          return status(400, tr.error.organization.noActive);

        if (
          !(await auth.api.hasPermission({
            headers,
            body: { permissions: { gastro: ['close'] } },
          }))
        )
          return status(403, tr.error.organization.insufficentPermission);

        const order = await prisma.order
          .findFirst({
            where: {
              organizationId: session.activeOrganizationId,
              id: params.id,
              status: 'OPEN',
            },
          })
          .catch(mapPrismaError);

        if (order instanceof MappedPrismaError)
          return status(order.status, order.response);

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
          .catch(mapPrismaError);

        if (updatedOrder instanceof MappedPrismaError)
          return status(updatedOrder.status, updatedOrder.response);

        return {
          ...updatedOrder,
          tax: updatedOrder.tax.toString(),
          total: updatedOrder.total.toString(),
          rawTotal: updatedOrder.rawTotal.toString(),
        };
      },
      {
        auth: true,
        body: t.Object({
          stocks: t.Record(t.String(), t.Integer()),
        }),
        response: {
          ...ResponseSchemaSet,
          403: ErrorResponseSchema,
          200: OrderPlain,
        },
      }
    )
    .post('/refund', () => {});
