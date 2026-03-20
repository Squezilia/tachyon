import { createAccessControl } from 'better-auth/plugins/access';
import {
  defaultStatements,
  adminAc,
} from 'better-auth/plugins/organization/access';

export const statement = {
  ...defaultStatements,
  organization: ['update', 'delete', 'manage'],
  retail: ['sell', 'refund'],
  sell: ['view'],
  gastro: ['order', 'refund', 'close'],
  order: ['view'],
  table: ['view', 'create', 'update', 'delete'],
  tenant: ['view', 'create', 'delete', 'update'],
  product: ['view', 'create', 'update', 'delete'],
  category: ['view', 'create', 'update', 'delete'],
  tax: ['view', 'create', 'update', 'delete'],
  stock: ['view', 'create', 'restock', 'drain', 'audit'],
  analytics: ['view', 'report'],
  campaign: ['view', 'create', 'update', 'delete', 'apply'],
} as const;

export const ac = createAccessControl(statement);

export const admin = ac.newRole({
  ...adminAc.statements,
  organization: ['update', 'delete', 'manage'],
  tenant: ['view', 'create', 'delete', 'update'],
  retail: ['sell', 'refund'],
  gastro: ['order', 'refund'],
  product: ['view', 'create', 'update', 'delete'],
  category: ['view', 'create', 'update', 'delete'],
  analytics: ['view', 'report'],
  stock: ['create', 'view', 'restock', 'drain', 'audit'],
  tax: ['view', 'create', 'update', 'delete'],
  campaign: ['view', 'create', 'update', 'delete', 'apply'],
});

export const owner = ac.newRole({
  organization: ['update', 'delete', 'manage'],
  tenant: ['view', 'create', 'delete', 'update'],
  retail: ['refund', 'sell'],
  gastro: ['order', 'refund'],
  product: ['view', 'create', 'update', 'delete'],
  category: ['view', 'create', 'update', 'delete'],
  analytics: ['view', 'report'],
  stock: ['create', 'view', 'restock', 'drain', 'audit'],
  tax: ['view', 'create', 'update', 'delete'],
  campaign: ['view', 'create', 'update', 'delete', 'apply'],
});

export const manager = ac.newRole({
  organization: ['manage'],
  tenant: ['update'],
  product: ['create', 'update'],
  analytics: ['view'],
  stock: ['view', 'restock', 'audit'],
  tax: ['view'],
  campaign: ['view', 'apply'],
});

export const staff = ac.newRole({
  retail: ['sell'],
  gastro: ['order'],
  product: ['view'],
  stock: ['view'],
  tax: ['view'],
  campaign: ['view', 'apply'],
});

export const accountant = ac.newRole({
  tenant: ['view'],
  product: ['view'],
  analytics: ['view', 'report'],
  stock: ['view', 'audit'],
  tax: ['view', 'create', 'update'],
  campaign: ['view'],
});
