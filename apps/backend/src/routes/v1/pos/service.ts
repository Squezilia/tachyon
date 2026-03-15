import tr from '@/i18n/tr';
import { MappedPrismaError } from '@backend/lib/error';
import { Decimal } from '@database';
import {
  CartProductTax,
  Prisma,
  Product,
  Stock,
  Tax,
} from '@database/generated/prisma/client';
import { v7 } from 'uuid';

type Stocks = (Stock & { product: Product & { appliedTaxes: Tax[] } })[];
type StocksBody = Record<string, number>;
type ProductWithTax = Product & { appliedTaxes: Tax[] };

export default async function calculateTotal(
  organizationId: string,
  userId: string,
  stocks: Stocks,
  body: StocksBody
) {
  const movementConfig: Prisma.StockMovementCreateManyInput[] = [];
  const cartConfig: Prisma.CartProductCreateManyInput[] = [];
  let allTaxes: Prisma.CartProductTaxCreateManyInput[] = [];
  let total = Decimal(0);
  let sub = Decimal(0);
  let tax = Decimal(0);

  for (const stock of stocks) {
    const specifiedStockForItem = body[stock.id + ''];
    if (
      !specifiedStockForItem ||
      specifiedStockForItem > stock.quantity ||
      specifiedStockForItem < 1 ||
      specifiedStockForItem == null
    )
      throw new MappedPrismaError({
        status: 400,
        error: tr.error.retail.stockError.error,
        reason: tr.error.retail.stockError.reason,
        code: '',
      });

    movementConfig.push({
      organizationId,
      quantityChange: -specifiedStockForItem,
      reason: 'SALE',
      stockId: stock.id,
      createdById: userId,
    });

    const cartProductId = v7();

    const {
      appliedTaxes,
      total: productTotal,
      appliedTax,
      productSub,
    } = calculateTax(stock.product, specifiedStockForItem, cartProductId);

    total = total.plus(productTotal);
    sub = sub.plus(productSub);
    tax = tax.plus(appliedTax);

    allTaxes = allTaxes.concat(appliedTaxes);

    cartConfig.push({
      id: cartProductId,
      priceAtSale: stock.product.price,
      productId: stock.productId,
      productName: stock.product.name,
      quantity: specifiedStockForItem,
      tax: appliedTax,
      sub: productSub,
      total: productTotal,
      stockId: stock.id,
    });
  }

  return {
    movementConfig,
    cartConfig,
    appliedTaxes: allTaxes,
    total,
    sub,
    tax,
  };
}

export function calculateTax(
  product: ProductWithTax,
  quantity: number,
  cartProductId: string
) {
  const appliedTaxes: Prisma.CartProductTaxCreateManyInput[] = [];

  const productSub = product.price.mul(quantity);
  const taxes = product.appliedTaxes;

  let appliedTax = Decimal(0);
  let runningBase = productSub;

  for (const tax of taxes) {
    const baseAmount = tax.isCumulative ? runningBase : productSub;

    const taxAmount = tax.isFixed
      ? tax.rate.mul(quantity)
      : baseAmount.mul(tax.rate.div(100));

    appliedTax = appliedTax.plus(taxAmount);

    appliedTaxes.push({
      cartProductId,
      isFixed: tax.isFixed,
      isCumulative: tax.isCumulative,
      priority: tax.priority,
      taxName: tax.name,
      taxAmount,
      baseAmount,
      taxId: tax.id,
      taxRate: tax.rate,
    });

    if (tax.isCumulative) runningBase = runningBase.plus(taxAmount);
  }

  const total = productSub.plus(appliedTax);

  return { appliedTaxes, appliedTax, productSub, total };
}

export function updateTaxes(
  taxes: CartProductTax[],
  price: Decimal,
  quantity: number
) {
  const appliedTaxes: Prisma.CartProductTaxUpdateArgs[] = [];

  const productSub = price.mul(quantity);

  let appliedTax = Decimal(0);
  let runningBase = productSub;

  for (const tax of taxes) {
    const baseAmount = tax.isCumulative ? runningBase : productSub;

    const taxAmount = tax.isFixed
      ? tax.taxRate.mul(quantity)
      : baseAmount.mul(tax.taxRate.div(100));

    appliedTax = appliedTax.plus(taxAmount);

    appliedTaxes.push({
      where: {
        id: tax.id,
      },
      data: {
        taxAmount,
        baseAmount,
      },
    });

    if (tax.isCumulative) runningBase = runningBase.plus(taxAmount);
  }

  const total = productSub.plus(appliedTax);

  return { appliedTaxes, appliedTax, productSub, total };
}
