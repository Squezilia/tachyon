import { Decimal } from '@prisma/client/runtime/library';
import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator,
} from 'unique-names-generator';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import readline from 'node:readline';
import prisma from 'lib/prisma';
import { auth } from 'lib/auth';
import logger from 'lib/logger';

const decimal = (value: Decimal | number | string) =>
  value instanceof Decimal ? value : new Decimal(value);

type SeedUserConfig = {
  key: 'admin' | 'manager' | 'cashier';
  email: string;
  password: string;
  name: string;
  image: string;
  role: string;
  memberRole: string;
};

type SizeProfile = {
  label: string;
  extraProducts: number;
  extraSells: number;
  extraOrders: number;
};

type CategorySnapshot = { id: string; name: string };
type TaxSnapshot = {
  id: string;
  name: string;
  priority: number;
  rate: Decimal;
  isFixed: boolean;
  isCumulative: boolean;
};
type ProductSnapshot = {
  id: string;
  name: string;
  price: Decimal;
  categoryId: string;
  taxIds: string[];
};
type StockSnapshot = { id: string; productId: string };
type SellSnapshot = { id: string };
type OrderSnapshot = { id: string };

const ORGANIZATION_CONFIG = {
  id: 'org_tachyon_test',
  slug: 'tachyon-test',
  name: 'Tachyon Test Organization',
};

const SIZE_PRESETS: Record<string, SizeProfile> = {
  none: { label: 'none', extraProducts: 0, extraSells: 0, extraOrders: 0 },
  small: { label: 'small', extraProducts: 5, extraSells: 8, extraOrders: 3 },
  medium: {
    label: 'medium',
    extraProducts: 12,
    extraSells: 20,
    extraOrders: 6,
  },
  large: { label: 'large', extraProducts: 24, extraSells: 40, extraOrders: 14 },
};

const argv = yargs(hideBin(process.argv))
  .option('size', {
    type: 'string',
    describe:
      'Enrichment size preset (none, small, medium, large) or a custom number',
  })
  .option('seed', {
    type: 'string',
    describe: 'Seed label for RNG to get deterministic random data',
  })
  .option('yes', {
    alias: 'y',
    type: 'boolean',
    default: false,
    describe: 'Skip confirmation prompt and continue seeding',
  })
  .help()
  .parseSync();

const sizeProfile = resolveSizeProfile(argv.size as string | undefined);
const rng = createRng(argv.seed as string | undefined);

const userConfigs: SeedUserConfig[] = [
  {
    key: 'admin',
    email: 'admin@tachyon.test',
    password: 'Qweqwe.1221',
    name: 'Admin User',
    image: 'https://via.placeholder.com/40x40/10b981/ffffff?text=A',
    role: 'ADMIN',
    memberRole: 'admin',
  },
  {
    key: 'manager',
    email: 'manager@tachyon.test',
    password: 'Qweqwe.1221',
    name: 'Manager User',
    image: 'https://via.placeholder.com/40x40/f59e0b/ffffff?text=M',
    role: 'MANAGER',
    memberRole: 'manager',
  },
  {
    key: 'cashier',
    email: 'cashier@tachyon.test',
    password: 'Qweqwe.1221',
    name: 'Cashier User',
    image: 'https://via.placeholder.com/40x40/ef4444/ffffff?text=C',
    role: 'CASHIER',
    memberRole: 'cashier',
  },
];

const categoryConfigs = [
  { key: 'beverages', name: 'Beverages' },
  { key: 'food', name: 'Food' },
  { key: 'electronics', name: 'Electronics' },
] as const;

const taxConfigs = [
  {
    key: 'vat',
    name: 'VAT',
    priority: 1,
    rate: 20,
    isFixed: false,
    isCumulative: false,
  },
  {
    key: 'service',
    name: 'Service Charge',
    priority: 2,
    rate: 10,
    isFixed: false,
    isCumulative: true,
  },
  {
    key: 'environmental',
    name: 'Environmental Fee',
    priority: 3,
    rate: 2.5,
    isFixed: true,
    isCumulative: false,
  },
] as const;

const productConfigs = [
  {
    key: 'premiumCoffee',
    name: 'Premium Coffee',
    price: '4.50',
    categoryKey: 'beverages',
    taxKeys: ['vat', 'service'],
  },
  {
    key: 'chickenSandwich',
    name: 'Chicken Sandwich',
    price: '8.99',
    categoryKey: 'food',
    taxKeys: ['vat', 'service'],
  },
  {
    key: 'gamingLaptop',
    name: 'Gaming Laptop',
    price: '1299.99',
    categoryKey: 'electronics',
    taxKeys: ['vat'],
  },
  {
    key: 'greenTea',
    name: 'Green Tea',
    price: '3.25',
    categoryKey: 'beverages',
    taxKeys: ['vat'],
  },
  {
    key: 'espresso',
    name: 'Espresso',
    price: '3.75',
    categoryKey: 'beverages',
    taxKeys: ['vat'],
  },
  {
    key: 'margheritaPizza',
    name: 'Margherita Pizza',
    price: '12.50',
    categoryKey: 'food',
    taxKeys: ['vat', 'service'],
  },
] as const;

const stockConfigs = [
  {
    key: 'coffeeStock',
    productKey: 'premiumCoffee',
    quantity: 120,
    minQuantity: 15,
    maxQuantity: 300,
  },
  {
    key: 'sandwichStock',
    productKey: 'chickenSandwich',
    quantity: 60,
    minQuantity: 10,
    maxQuantity: 150,
  },
  {
    key: 'laptopStock',
    productKey: 'gamingLaptop',
    quantity: 8,
    minQuantity: 1,
    maxQuantity: 20,
  },
  {
    key: 'teaStock',
    productKey: 'greenTea',
    quantity: 90,
    minQuantity: 20,
    maxQuantity: 200,
  },
  {
    key: 'espressoStock',
    productKey: 'espresso',
    quantity: 70,
    minQuantity: 15,
    maxQuantity: 150,
  },
  {
    key: 'pizzaStock',
    productKey: 'margheritaPizza',
    quantity: 40,
    minQuantity: 5,
    maxQuantity: 80,
  },
] as const;

type RelativeTimeConfig = {
  hoursAgo?: number;
  minutesAgo?: number;
};

type SellSeedConfig = RelativeTimeConfig & {
  key: string;
};

type OrderSeedConfig = RelativeTimeConfig & {
  key: string;
  status: 'OPEN' | 'CLOSED';
};

type CartProductSeedConfig = {
  productKey: (typeof productConfigs)[number]['key'];
  quantity: number;
  taxKeys: (typeof taxConfigs)[number]['key'][];
  sellKey?: string;
  orderKey?: string;
};

type StockMovementSeedConfig = RelativeTimeConfig & {
  stockKey: (typeof stockConfigs)[number]['key'];
  quantityChange: number;
  reason: 'SALE' | 'RESTOCK' | 'ADJUSTMENT' | 'REVERSAL';
  userKey: SeedUserConfig['key'];
  daysAgo?: number;
};

const campaignConfigs = [
  {
    key: 'welcome',
    name: 'Welcome Discount',
    code: 'WELCOME10',
    value: '10',
    isFixed: true,
    type: 'BASKET' as const,
  },
  {
    key: 'weekend',
    name: 'Weekend Special',
    code: 'WEEKEND20',
    value: '20',
    isFixed: false,
    type: 'PRODUCT' as const,
  },
] as const;

type CampaignAvailabilityConfig = {
  campaignKey: (typeof campaignConfigs)[number]['key'];
  active: boolean;
  afterDaysAgo?: number | null;
  beforeDaysAhead?: number | null;
};

type CampaignTargetConfig = {
  campaignKey: (typeof campaignConfigs)[number]['key'];
  type: 'PRODUCTS' | 'CATEGORIES';
  productKeys?: (typeof productConfigs)[number]['key'][];
  categoryKeys?: (typeof categoryConfigs)[number]['key'][];
  active?: boolean;
};

const campaignAvailabilityConfigs: CampaignAvailabilityConfig[] = [
  {
    campaignKey: 'welcome',
    active: true,
    afterDaysAgo: 60,
    beforeDaysAhead: null,
  },
  {
    campaignKey: 'weekend',
    active: true,
    afterDaysAgo: 14,
    beforeDaysAhead: 14,
  },
] as const;

const campaignTargetConfigs: CampaignTargetConfig[] = [
  {
    campaignKey: 'welcome',
    type: 'CATEGORIES' as const,
    categoryKeys: ['beverages', 'food'],
  },
  {
    campaignKey: 'weekend',
    type: 'PRODUCTS' as const,
    productKeys: ['premiumCoffee', 'greenTea', 'espresso'],
  },
] as const;

const sellConfigs: SellSeedConfig[] = [
  { key: 'morningRush', hoursAgo: 2 },
  { key: 'techBundle', hoursAgo: 1 },
  { key: 'downtownBreak', minutesAgo: 30 },
];

const orderConfigs: OrderSeedConfig[] = [
  { key: 'dineInClosed', status: 'CLOSED', hoursAgo: 3 },
  { key: 'dineInOpen', status: 'OPEN', minutesAgo: 15 },
];

const cartProductConfigs: CartProductSeedConfig[] = [
  {
    productKey: 'premiumCoffee',
    quantity: 2,
    taxKeys: ['vat', 'service'],
    sellKey: 'morningRush',
  },
  {
    productKey: 'chickenSandwich',
    quantity: 1,
    taxKeys: ['vat', 'service'],
    sellKey: 'morningRush',
  },
  {
    productKey: 'gamingLaptop',
    quantity: 1,
    taxKeys: ['vat'],
    sellKey: 'techBundle',
  },
  {
    productKey: 'greenTea',
    quantity: 2,
    taxKeys: ['vat'],
    sellKey: 'downtownBreak',
  },
  {
    productKey: 'margheritaPizza',
    quantity: 2,
    taxKeys: ['vat', 'service'],
    orderKey: 'dineInClosed',
  },
  {
    productKey: 'espresso',
    quantity: 1,
    taxKeys: ['vat'],
    orderKey: 'dineInOpen',
  },
];

const stockMovementConfigs: StockMovementSeedConfig[] = [
  {
    stockKey: 'coffeeStock',
    quantityChange: 100,
    reason: 'RESTOCK',
    daysAgo: 7,
    userKey: 'manager',
  },
  {
    stockKey: 'sandwichStock',
    quantityChange: 50,
    reason: 'RESTOCK',
    daysAgo: 7,
    userKey: 'manager',
  },
  {
    stockKey: 'coffeeStock',
    quantityChange: -2,
    reason: 'SALE',
    hoursAgo: 2,
    userKey: 'cashier',
  },
  {
    stockKey: 'sandwichStock',
    quantityChange: -1,
    reason: 'SALE',
    hoursAgo: 2,
    userKey: 'cashier',
  },
  {
    stockKey: 'laptopStock',
    quantityChange: -1,
    reason: 'SALE',
    hoursAgo: 1,
    userKey: 'manager',
  },
];

const hoursAgo = (hours: number) =>
  new Date(Date.now() - hours * 60 * 60 * 1000);
const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60 * 1000);
const daysAgo = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000);
const daysFromNow = (days: number) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000);

async function ensureUser(config: SeedUserConfig) {
  try {
    const result = await auth.api.signUpEmail({
      body: {
        email: config.email,
        password: config.password,
        name: config.name,
      },
    });
    return await prisma.user.update({
      where: { id: result.user.id },
      data: {
        image: config.image,
        role: config.role,
      },
    });
  } catch (error) {
    const existingUser = await prisma.user.findUnique({
      where: { email: config.email },
    });
    if (!existingUser) {
      const message = error instanceof Error ? error.message : 'unknown error';
      throw new Error(`Failed to provision user ${config.email}: ${message}`);
    }
    if (
      existingUser.image !== config.image ||
      existingUser.role !== config.role ||
      existingUser.name !== config.name
    ) {
      return prisma.user.update({
        where: { id: existingUser.id },
        data: {
          image: config.image,
          role: config.role,
          name: config.name,
        },
      });
    }
    return existingUser;
  }
}

function calculateAppliedTaxes(
  subtotal: Decimal,
  quantity: number,
  taxes: TaxSnapshot[]
) {
  const sorted = [...taxes].sort((a, b) => a.priority - b.priority);
  let runningBase = subtotal;
  const quantityDecimal = decimal(quantity);
  const applied: Array<{
    tax: TaxSnapshot;
    baseAmount: Decimal;
    taxAmount: Decimal;
  }> = [];
  let totalTax = decimal(0);

  for (const tax of sorted) {
    const baseAmount = tax.isCumulative ? runningBase : subtotal;
    const taxAmount = tax.isFixed
      ? decimal(tax.rate).mul(quantityDecimal)
      : baseAmount.mul(decimal(tax.rate)).div(100);

    applied.push({ tax, baseAmount, taxAmount });
    totalTax = totalTax.plus(taxAmount);

    if (tax.isCumulative) runningBase = runningBase.plus(taxAmount);
  }

  return {
    applied,
    totalTax,
    total: subtotal.plus(totalTax),
  };
}

async function cleanupRandomizedRecords() {
  await prisma.cartProductTax.deleteMany({
    where: { cartProductId: { startsWith: 'cart_extra_' } },
  });
  await prisma.cartProduct.deleteMany({
    where: { id: { startsWith: 'cart_extra_' } },
  });
  await prisma.sell.deleteMany({
    where: { id: { startsWith: 'sell_extra_' } },
  });
  await prisma.order.deleteMany({
    where: { id: { startsWith: 'order_extra_' } },
  });
  await prisma.stock.deleteMany({
    where: { id: { startsWith: 'stock_extra_' } },
  });
  await prisma.product.deleteMany({
    where: { id: { startsWith: 'prod_extra_' } },
  });
}

async function createCartProductSnapshot(options: {
  product: ProductSnapshot;
  quantity: number;
  sellId?: string;
  orderId?: string;
  taxSnapshots?: TaxSnapshot[];
  taxesById: Map<string, TaxSnapshot>;
}) {
  const { product, quantity, sellId, orderId, taxSnapshots, taxesById } =
    options;
  if (!sellId && !orderId)
    throw new Error(`Cart product must reference a sell or an order`);

  const resolvedTaxes =
    taxSnapshots ??
    product.taxIds
      .map((taxId) => taxesById.get(taxId))
      .filter((tax): tax is TaxSnapshot => Boolean(tax));

  const subtotal = product.price.mul(decimal(quantity));
  const { applied, totalTax, total } = calculateAppliedTaxes(
    subtotal,
    quantity,
    resolvedTaxes
  );

  const cartProduct = await prisma.cartProduct.create({
    data: {
      quantity,
      productId: product.id,
      productName: product.name,
      priceAtSale: product.price,
      subtotal,
      totalTax,
      total,
      sellId: sellId ?? null,
      orderId: orderId ?? null,
    },
  });

  await prisma.cartProductTax.deleteMany({
    where: { cartProductId: cartProduct.id },
  });

  if (applied.length) {
    await prisma.cartProductTax.createMany({
      data: applied.map((tax) => ({
        cartProductId: cartProduct.id,
        taxId: tax.tax.id,
        taxName: tax.tax.name,
        isFixed: tax.tax.isFixed,
        priority: tax.tax.priority,
        taxRate: tax.tax.rate,
        taxAmount: tax.taxAmount,
        baseAmount: tax.baseAmount,
      })),
    });
  }
}

async function enrichWithRandomData(params: {
  organizationId: string;
  categories: Record<string, CategorySnapshot>;
  taxes: Record<string, TaxSnapshot>;
  taxesById: Map<string, TaxSnapshot>;
  products: Map<string, ProductSnapshot>;
  stocks: Map<string, StockSnapshot>;
  sells: Map<string, SellSnapshot>;
  orders: Map<string, OrderSnapshot>;
  size: SizeProfile;
  issuerId: string;
}) {
  const {
    organizationId,
    categories,
    taxes,
    taxesById,
    products,
    stocks,
    sells,
    orders,
    size,
    issuerId,
  } = params;

  if (!size.extraProducts && !size.extraSells && !size.extraOrders) return;

  logger.info(
    `🎲 Enriching dataset (${size.label}) → +${size.extraProducts} products, +${size.extraSells} sells, +${size.extraOrders} orders`
  );

  const categoryPool = Object.values(categories);
  const taxPool = Object.values(taxes);

  if (!categoryPool.length || !taxPool.length) {
    logger.warn('Skipping enrichment because categories or taxes are missing.');
    return;
  }

  for (let i = 0; i < size.extraProducts; i++) {
    const productId = randomId('prod_extra_');
    const productName = uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals],
      separator: ' ',
      style: 'capital',
      seed: rng.nextInt(0, Number.MAX_SAFE_INTEGER),
    });
    const category = categoryPool[rng.nextInt(0, categoryPool.length - 1)];
    const selectedTaxes = pickRandomTaxes(taxPool);
    const taxRefs = selectedTaxes.map((tax) => ({ id: tax.id }));
    const price = decimal((rng.nextFloat() * 90 + 5).toFixed(2));

    const product = await prisma.product.create({
      data: {
        id: productId,
        name: productName,
        price,
        organizationId,
        categoryId: category.id,
        ...(taxRefs.length && {
          appliedTaxes: {
            connect: taxRefs,
          },
        }),
      },
    });

    const snapshot: ProductSnapshot = {
      id: product.id,
      name: product.name,
      price: decimal(product.price),
      categoryId: category.id,
      taxIds: selectedTaxes.map((tax) => tax.id),
    };
    products.set(product.id, snapshot);

    const stockId = randomId('stock_extra_');
    const stock = await prisma.stock.create({
      data: {
        id: stockId,
        productId: product.id,
        organizationId,
        quantity: randomIntInclusive(20, 200),
        minQuantity: randomIntInclusive(5, 30),
        maxQuantity: randomIntInclusive(200, 400),
        lastRestockedAt: new Date(),
      },
    });
    stocks.set(stock.id, { id: stock.id, productId: stock.productId });
  }

  const productPool = () => Array.from(products.values());

  for (let i = 0; i < size.extraSells; i++) {
    const sellId = randomId('sell_extra_');
    const sell = await prisma.sell.create({
      data: {
        id: sellId,
        organizationId,
        createdAt: hoursAgo(randomIntInclusive(1, 72)),
        isReversal: false,
        issuerId,
      },
    });
    sells.set(sell.id, { id: sell.id });

    const lineCount = randomIntInclusive(1, 4);
    for (let line = 0; line < lineCount; line++) {
      const pool = productPool();
      if (!pool.length) break;
      const product = pool[rng.nextInt(0, pool.length - 1)];
      await createCartProductSnapshot({
        product,
        quantity: randomIntInclusive(1, 5),
        sellId: sell.id,
        taxesById,
      });
    }
  }

  const orderStatuses: Array<'OPEN' | 'CLOSED'> = ['OPEN', 'CLOSED'];
  for (let i = 0; i < size.extraOrders; i++) {
    const orderId = randomId('order_extra_');
    const status =
      orderStatuses.length === 1
        ? orderStatuses[0]
        : orderStatuses[rng.nextInt(0, orderStatuses.length - 1)];
    const order = await prisma.order.create({
      data: {
        id: orderId,
        status,
        organizationId,
        createdAt: hoursAgo(randomIntInclusive(1, 48)),
        issuerId,
      },
    });
    orders.set(order.id, { id: order.id });

    const lineCount = randomIntInclusive(1, 3);
    for (let line = 0; line < lineCount; line++) {
      const pool = productPool();
      if (!pool.length) break;
      const product = pool[rng.nextInt(0, pool.length - 1)];
      await createCartProductSnapshot({
        product,
        quantity: randomIntInclusive(1, 4),
        orderId: order.id,
        taxesById,
      });
    }
  }
}

function resolveSizeProfile(value?: string | number | null): SizeProfile {
  if (!value) return SIZE_PRESETS.none;
  const stringValue = `${value}`.toLowerCase();
  if (SIZE_PRESETS[stringValue]) {
    return SIZE_PRESETS[stringValue];
  }
  const numeric = Number(stringValue);
  if (!Number.isNaN(numeric) && numeric > 0) {
    return {
      label: `custom-${numeric}`,
      extraProducts: numeric,
      extraSells: Math.ceil(numeric * 1.6),
      extraOrders: Math.ceil(numeric * 0.6),
    };
  }
  logger.warn(`Unknown --size value "${value}". Falling back to base dataset.`);
  return SIZE_PRESETS.none;
}

type SeededRng = {
  nextFloat: () => number;
  nextInt: (min: number, max: number) => number;
  nextId: (prefix: string) => string;
  seedLabel: string;
};

function createRng(seedValue?: string | number | null): SeededRng {
  const label = seedValue ?? 'tachyon-seed';
  let state = hashSeed(`${label}`);
  if (state === 0) state = 0x6d2b79f5;

  const nextFloat = () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return {
    nextFloat,
    nextInt(min, max) {
      if (max < min) [min, max] = [max, min];
      const range = max - min + 1;
      return Math.floor(nextFloat() * range) + min;
    },
    nextId(prefix: string) {
      const value = Math.floor(nextFloat() * 36 ** 10)
        .toString(36)
        .padStart(10, '0');
      return `${prefix}${value}`;
    },
    seedLabel: `${label}`,
  };
}

function hashSeed(value: string) {
  let hash = 2166136261 >>> 0;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

const randomIntInclusive = (min: number, max: number) => rng.nextInt(min, max);
const randomId = (prefix: string) => rng.nextId(prefix);

const pickRandomTaxes = (taxes: TaxSnapshot[]) => {
  if (!taxes.length) return [];
  const maxPick = Math.max(1, Math.min(3, taxes.length));
  const count = randomIntInclusive(1, maxPick);
  const shuffled = [...taxes];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = rng.nextInt(0, i);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
};

async function confirmContinue(): Promise<boolean> {
  if ((argv as any).yes) return true;
  const question = `This will seed the database for organization "${ORGANIZATION_CONFIG.name}". Do you want to continue? (y/N) `;
  return await new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, (answer: string) => {
      rl.close();
      const normalized = String(answer).trim().toLowerCase();
      resolve(normalized === 'y' || normalized === 'yes');
    });
  });
}

async function seed() {
  logger.info('🌱 Starting database seeding...');
  logger.info(`🔧 Random enrichment preset: ${sizeProfile.label}`);
  logger.info(`🎲 RNG seed: ${rng.seedLabel}`);

  const proceed = await confirmContinue();
  if (!proceed) {
    logger.info('Seeding cancelled by user.');
    await prisma.$disconnect();
    process.exit(0);
  }

  try {
    const organization = await prisma.organization.upsert({
      where: { id: ORGANIZATION_CONFIG.id },
      update: {},
      create: {
        id: ORGANIZATION_CONFIG.id,
        name: ORGANIZATION_CONFIG.name,
        slug: ORGANIZATION_CONFIG.slug,
        logo: 'https://via.placeholder.com/100x100/6366f1/ffffff?text=T',
        metadata: JSON.stringify({
          description: 'Test organization for Tachyon POS system',
          industry: 'Retail & Hospitality',
          features: ['POS', 'Inventory', 'Analytics'],
        }),
        createdAt: new Date(),
      },
    });

    await cleanupRandomizedRecords();

    logger.info('👥 Ensuring test users exist...');
    const userEntries = await Promise.all(
      userConfigs.map(async (config) => {
        const user = await ensureUser(config);
        return [config.key, user] as const;
      })
    );
    const users = Object.fromEntries(userEntries) as Record<
      SeedUserConfig['key'],
      (typeof userEntries)[number][1]
    >;

    logger.info('👤 Creating organization members...');
    await Promise.all(
      userConfigs.map((config) =>
        prisma.member.upsert({
          where: { id: `member_${config.key}` },
          update: {
            role: config.memberRole,
          },
          create: {
            id: `member_${config.key}`,
            organizationId: organization.id,
            userId: users[config.key].id,
            role: config.memberRole,
            createdAt: new Date(),
          },
        })
      )
    );

    logger.info('📂 Creating categories...');
    const categories: Record<string, CategorySnapshot> = {};
    await Promise.all(
      categoryConfigs.map(async (config) => {
        const category = await prisma.category.upsert({
          where: {
            organizationId_name: {
              organizationId: organization.id,
              name: config.name,
            },
          },
          update: { name: config.name },
          create: {
            name: config.name,
            organizationId: organization.id,
          },
        });
        categories[config.key] = { id: category.id, name: category.name };
      })
    );

    logger.info('💰 Creating taxes...');
    const taxesByKey: Record<string, TaxSnapshot> = {};
    const taxesById = new Map<string, TaxSnapshot>();
    await Promise.all(
      taxConfigs.map(async (config) => {
        const tax = await prisma.tax.upsert({
          where: {
            organizationId_name: {
              organizationId: organization.id,
              name: config.name,
            },
          },
          update: {
            name: config.name,
            priority: config.priority,
            rate: decimal(config.rate),
            isFixed: config.isFixed,
            isCumulative: config.isCumulative,
          },
          create: {
            name: config.name,
            priority: config.priority,
            rate: decimal(config.rate),
            isFixed: config.isFixed,
            isCumulative: config.isCumulative,
            organizationId: organization.id,
          },
        });
        const snapshot: TaxSnapshot = {
          id: tax.id,
          name: tax.name,
          priority: tax.priority,
          rate: decimal(tax.rate),
          isFixed: tax.isFixed,
          isCumulative: tax.isCumulative,
        };
        taxesByKey[config.key] = snapshot;
        taxesById.set(snapshot.id, snapshot);
      })
    );

    logger.info('🛍️ Creating products...');
    const products = new Map<string, ProductSnapshot>();
    const productKeyToId: Record<string, string> = {};
    await Promise.all(
      productConfigs.map(async (config) => {
        const category = categories[config.categoryKey];
        if (!category)
          throw new Error(
            `Category ${config.categoryKey} missing for product ${config.key}`
          );
        const taxSnapshots = config.taxKeys.map((key) => {
          const snapshot = taxesByKey[key];
          if (!snapshot)
            throw new Error(`Tax ${key} missing for product ${config.key}`);
          return snapshot;
        });
        const taxRefs = taxSnapshots.map((tax) => ({ id: tax.id }));
        const existing = await prisma.product.findFirst({
          where: { organizationId: organization.id, name: config.name },
          select: { id: true },
        });
        const product = existing
          ? await prisma.product.update({
              where: { id: existing.id },
              data: {
                name: config.name,
                price: decimal(config.price),
                categoryId: category.id,
                appliedTaxes: { set: taxRefs },
              },
            })
          : await prisma.product.create({
              data: {
                name: config.name,
                price: decimal(config.price),
                organizationId: organization.id,
                categoryId: category.id,
                ...(taxRefs.length && {
                  appliedTaxes: { connect: taxRefs },
                }),
              },
            });
        const snapshot: ProductSnapshot = {
          id: product.id,
          name: product.name,
          price: decimal(product.price),
          categoryId: product.categoryId,
          taxIds: taxSnapshots.map((tax) => tax.id),
        };
        products.set(product.id, snapshot);
        productKeyToId[config.key] = product.id;
      })
    );

    logger.info('📦 Creating stock records...');
    const stocks = new Map<string, StockSnapshot>();
    const stockKeyToId: Record<string, string> = {};
    await Promise.all(
      stockConfigs.map(async (config) => {
        const productId = productKeyToId[config.productKey];
        const product = productId ? products.get(productId) : undefined;
        if (!product)
          throw new Error(
            `Product ${config.productKey} missing for stock ${config.key}`
          );
        const stock = await prisma.stock.upsert({
          where: {
            organizationId_productId: {
              organizationId: organization.id,
              productId: product.id,
            },
          },
          update: {
            productId: product.id,
            organizationId: organization.id,
            quantity: config.quantity,
            minQuantity: config.minQuantity,
            maxQuantity: config.maxQuantity,
            lastRestockedAt: new Date(),
          },
          create: {
            productId: product.id,
            organizationId: organization.id,
            quantity: config.quantity,
            minQuantity: config.minQuantity,
            maxQuantity: config.maxQuantity,
            lastRestockedAt: new Date(),
          },
        });
        stocks.set(stock.id, { id: stock.id, productId: stock.productId });
        stockKeyToId[config.key] = stock.id;
      })
    );

    logger.info('🎯 Creating campaigns...');
    const campaignEntries = await Promise.all(
      campaignConfigs.map(async (config) => {
        const campaign = await prisma.campaign.upsert({
          where: {
            organizationId_code: {
              organizationId: organization.id,
              code: config.code,
            },
          },
          update: {
            name: config.name,
            code: config.code,
            value: decimal(config.value),
            isFixed: config.isFixed,
            type: config.type,
          },
          create: {
            name: config.name,
            code: config.code,
            value: decimal(config.value),
            isFixed: config.isFixed,
            type: config.type,
            organizationId: organization.id,
          },
        });
        return [config.key, { id: campaign.id, name: campaign.name }] as const;
      })
    );
    const campaigns = Object.fromEntries(campaignEntries);
    const campaignKeyToId: Record<string, string> = {};
    for (const [key, snapshot] of campaignEntries) {
      campaignKeyToId[key] = snapshot.id;
    }

    logger.info('📅 Creating campaign availabilities...');
    await Promise.all(
      campaignAvailabilityConfigs.map((config) => {
        const campaignId = campaignKeyToId[config.campaignKey];
        if (!campaignId)
          throw new Error(
            `Campaign ${config.campaignKey} missing for availability config.`
          );

        const afterDate =
          typeof config.afterDaysAgo === 'number'
            ? daysAgo(config.afterDaysAgo)
            : null;
        const beforeDate =
          typeof config.beforeDaysAhead === 'number'
            ? daysFromNow(config.beforeDaysAhead)
            : null;

        // Clear existing availabilities for this campaign to avoid duplicates
        return prisma.$transaction([
          prisma.campaignAvailability.deleteMany({ where: { campaignId } }),
          prisma.campaignAvailability.create({
            data: {
              active: config.active,
              after: afterDate,
              before: beforeDate,
              campaignId,
            },
          }),
        ]);
      })
    );

    logger.info('🎯 Creating campaign targets...');
    await Promise.all(
      campaignTargetConfigs.map((config) => {
        const campaignId = campaignKeyToId[config.campaignKey];
        if (!campaignId)
          throw new Error(
            `Campaign ${config.campaignKey} missing for target config.`
          );

        const productConnect = (config.productKeys ?? []).map((key) => {
          const productId = productKeyToId[key];
          if (!productId)
            throw new Error(`Product ${key} missing for campaign target`);
          return { id: productId };
        });

        const categoryConnect = (config.categoryKeys ?? []).map((key) => {
          const category = categories[key];
          if (!category)
            throw new Error(`Category ${key} missing for campaign target`);
          return { id: category.id };
        });

        // Clear existing targets for this campaign to avoid duplicates
        return prisma.$transaction([
          prisma.campaignTarget.deleteMany({ where: { campaignId } }),
          prisma.campaignTarget.create({
            data: {
              active: config.active ?? true,
              type: config.type,
              campaignId,
              ...(productConnect.length && {
                products: { connect: productConnect },
              }),
              ...(categoryConnect.length && {
                categories: { connect: categoryConnect },
              }),
            },
          }),
        ]);
      })
    );

    logger.info('🛒 Creating sells...');
    const sells = new Map<string, SellSnapshot>();
    const sellKeyToId: Record<string, string> = {};
    await Promise.all(
      sellConfigs.map(async (config) => {
        const createdAt =
          config.hoursAgo !== undefined
            ? hoursAgo(config.hoursAgo)
            : minutesAgo(config.minutesAgo ?? 0);
        const sell = await prisma.sell.create({
          data: {
            organizationId: organization.id,
            createdAt,
            isReversal: false,
            issuerId: users.cashier.id,
          },
        });
        sells.set(sell.id, { id: sell.id });
        sellKeyToId[config.key] = sell.id;
      })
    );

    logger.info('🍽️ Creating orders...');
    const orders = new Map<string, OrderSnapshot>();
    const orderKeyToId: Record<string, string> = {};
    await Promise.all(
      orderConfigs.map(async (config) => {
        const createdAt =
          config.hoursAgo !== undefined
            ? hoursAgo(config.hoursAgo)
            : minutesAgo(config.minutesAgo ?? 0);
        const order = await prisma.order.create({
          data: {
            status: config.status as any,
            organizationId: organization.id,
            createdAt,
            issuerId: users.cashier.id,
          },
        });
        orders.set(order.id, { id: order.id });
        orderKeyToId[config.key] = order.id;
      })
    );

    logger.info('🧾 Creating cart products and tax snapshots...');
    for (const config of cartProductConfigs) {
      const productId = productKeyToId[config.productKey];
      const product = productId ? products.get(productId) : undefined;
      if (!product)
        throw new Error(
          `Product ${config.productKey} missing for cart product`
        );

      const sellId = config.sellKey ? sellKeyToId[config.sellKey] : undefined;
      const orderId = config.orderKey
        ? orderKeyToId[config.orderKey]
        : undefined;

      const taxSnapshots = config.taxKeys.map((key) => {
        const snapshot = taxesByKey[key];
        if (!snapshot) throw new Error(`Tax ${key} missing for cart product`);
        return snapshot;
      });

      await createCartProductSnapshot({
        product,
        quantity: config.quantity,
        sellId,
        orderId,
        taxSnapshots,
        taxesById,
      });
    }

    logger.info(
      '💳 Payments are skipped (sellId and orderId are both required in the current schema).'
    );

    logger.info('📊 Creating stock movements...');
    await Promise.all(
      stockMovementConfigs.map((config) => {
        const stockId = stockKeyToId[config.stockKey];
        const stock = stockId ? stocks.get(stockId) : undefined;
        if (!stock)
          throw new Error(`Stock ${config.stockKey} missing for movement`);
        const createdAt = config.daysAgo
          ? daysAgo(config.daysAgo)
          : config.hoursAgo
            ? hoursAgo(config.hoursAgo)
            : minutesAgo(config.minutesAgo ?? 0);

        return prisma.stockMovement.create({
          data: {
            stockId: stock.id,
            quantityChange: config.quantityChange,
            reason: config.reason as any,
            createdAt,
            createdById: users[config.userKey].id,
            organizationId: organization.id,
          },
        });
      })
    );

    await enrichWithRandomData({
      organizationId: organization.id,
      categories,
      taxes: taxesByKey,
      taxesById,
      products,
      stocks,
      sells,
      orders,
      size: sizeProfile,
      issuerId: users.cashier.id,
    });

    logger.info('✅ Database seeded successfully!');
    logger.info('📊 Summary:');
    logger.info(`- Organization: ${organization.name}`);
    logger.info(`- Users: ${userConfigs.length}`);
    logger.info(`- Categories: ${Object.keys(categories).length}`);
    logger.info(`- Products: ${products.size}`);
    logger.info(`- Taxes: ${Object.keys(taxesByKey).length}`);
    logger.info(`- Stocks: ${stocks.size}`);
    logger.info(`- Sells: ${sells.size}`);
    logger.info(`- Orders: ${orders.size}`);
    logger.info(`- Campaigns: ${Object.keys(campaigns).length}`);
    logger.info(
      `- Campaign availabilities: ${campaignAvailabilityConfigs.length}`
    );
    logger.info(`- Campaign targets: ${campaignTargetConfigs.length}`);
    logger.info(`- Enrichment preset: ${sizeProfile.label}`);
    logger.info('🔑 Test Credentials:');
    logger.info('Admin: admin@tachyon.test / Qweqwe.1221');
    logger.info('Manager: manager@tachyon.test / Qweqwe.1221');
    logger.info('Cashier: cashier@tachyon.test / Qweqwe.1221');
  } catch (error) {
    logger.error({ err: error }, '❌ Error seeding database');
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed().catch((error) => {
  logger.error({ err: error }, '❌ Seeding failed');
  process.exit(1);
});
