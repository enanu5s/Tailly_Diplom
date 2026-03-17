// src/features/orders/api/ordersApi.mock.ts

import {
  MOCK_PRODUCT_ORDERS,
  MOCK_SERVICE_ORDERS,
} from '../data/mockOrders';

import type {
  ProductOrder,
  RepeatResult,
  ReviewResult,
  ServiceOrder,
  ServicesFilter,
} from '../model/types';


function filterServices(
  list: ServiceOrder[],
  filter: ServicesFilter,
): ServiceOrder[] {
  if (filter === 'all') {
    return list;
  }

  return list.filter((item) => item.status === filter);
}

export async function mockGetServiceOrders(
  filter: ServicesFilter,
): Promise<ServiceOrder[]> {
  const sorted = [...MOCK_SERVICE_ORDERS].sort(
    (a, b) => +new Date(b.dateFrom) - +new Date(a.dateFrom),
  );

  return filterServices(sorted, filter);
}

export async function mockGetProductOrders(): Promise<ProductOrder[]> {
  return [...MOCK_PRODUCT_ORDERS].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  );
}

export async function mockRepeatServiceOrder(): Promise<RepeatResult> {
  return { ok: true };
}

export async function mockRepeatProductOrder(): Promise<RepeatResult> {
  return { ok: true };
}

export async function mockLeaveServiceReview(
  orderId: string,
  rating: number,
): Promise<ReviewResult> {
  const idx = MOCK_SERVICE_ORDERS.findIndex((item) => item.id === orderId);

  if (idx >= 0) {
    MOCK_SERVICE_ORDERS[idx] = {
      ...MOCK_SERVICE_ORDERS[idx],
      hasReview: true,
      rating,
    };
  }

  return { ok: true };
}