// src/features/shop/data/mockShopOrders.ts

import {
  ensureMockDatabaseLoaded,
  patchMockDatabase,
  unsafeMutableMockDb,
} from '@/shared/mock-db/store';

import type { Order, PickupPoint } from '../model/types';

export const ORDERS_STORAGE_KEY = 'tailly_shop_orders';

export function readStoredOrders(): Order[] {
  ensureMockDatabaseLoaded();

  return unsafeMutableMockDb().shop.orders.map((order) => ({ ...order }));
}

export function writeStoredOrders(orders: Order[]): void {
  patchMockDatabase((db) => {
    db.shop.orders = orders.map((order) => ({ ...order }));
  });
}

export function getPickupPointsSnapshot(): PickupPoint[] {
  ensureMockDatabaseLoaded();

  return unsafeMutableMockDb().shop.pickupPoints.map((p) => ({ ...p }));
}

export function replacePickupPoints(points: PickupPoint[]): void {
  patchMockDatabase((db) => {
    db.shop.pickupPoints = points.map((p) => ({ ...p }));
  });
}

export function addDays(date: Date, days: number): string {
  const next = new Date(date);
  next.setDate(next.getDate() + days);

  return next.toISOString();
}

export function generateOrderId(): string {
  return `order-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
