// src/shared/mock-db/accessors/orders.ts

import { cloneDeep } from '@/shared/mock-db/cloneDeep';
import { patchMockDatabase, unsafeMutableMockDb } from '@/shared/mock-db/store';

import type { ProductOrder, ServiceOrder } from '@/features/orders/model/types';

export function readServiceOrders(): ServiceOrder[] {
  return cloneDeep(unsafeMutableMockDb().orders.service);
}

export function writeServiceOrders(orders: ServiceOrder[]): void {
  patchMockDatabase((db) => {
    db.orders.service = cloneDeep(orders);
  });
}

export function readProductOrders(): ProductOrder[] {
  return cloneDeep(unsafeMutableMockDb().orders.product);
}

export function writeProductOrders(orders: ProductOrder[]): void {
  patchMockDatabase((db) => {
    db.orders.product = cloneDeep(orders);
  });
}

export function patchServiceOrders(recipe: (orders: ServiceOrder[]) => ServiceOrder[]): void {
  patchMockDatabase((db) => {
    db.orders.service = recipe(cloneDeep(db.orders.service));
  });
}
