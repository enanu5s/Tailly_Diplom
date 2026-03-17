// src/features/shop/data/mockShopOrders.ts

import type {
  Order,
  PickupPoint,
} from '../model/types';

export const ORDERS_STORAGE_KEY = 'tailly_shop_orders';

export const PICKUP_POINTS_MOCK: PickupPoint[] = [
  {
    id: 'pickup-cdek-1',
    provider: 'cdek',
    title: 'СДЭК — ПВЗ на Тверской',
    address: 'Москва, ул. Тверская, д. 12',
    estimatedDate: '2026-03-11',
  },
  {
    id: 'pickup-cdek-2',
    provider: 'cdek',
    title: 'СДЭК — ПВЗ на Арбате',
    address: 'Москва, ул. Арбат, д. 21',
    estimatedDate: '2026-03-12',
  },
  {
    id: 'pickup-cdek-3',
    provider: 'cdek',
    title: 'СДЭК — ПВЗ на Ленинском',
    address: 'Москва, Ленинский проспект, д. 41',
    estimatedDate: '2026-03-12',
  },
];

export function readStoredOrders(): Order[] {
  const raw = localStorage.getItem(ORDERS_STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as Order[];
  } catch {
    return [];
  }
}

export function writeStoredOrders(orders: Order[]): void {
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
}

export function addDays(date: Date, days: number): string {
  const next = new Date(date);
  next.setDate(next.getDate() + days);

  return next.toISOString();
}

export function generateOrderId(): string {
  return `order-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}