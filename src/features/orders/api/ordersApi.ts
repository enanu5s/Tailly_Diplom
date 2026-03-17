// src/features/orders/api/ordersApi.ts

import { request } from '@/shared/api/http';

import {
  mockGetProductOrders,
  mockGetServiceOrders,
  mockLeaveServiceReview,
  mockRepeatProductOrder,
  mockRepeatServiceOrder,
} from './ordersApi.mock';

import type {
  ProductOrder,
  RepeatResult,
  ReviewResult,
  ServiceOrder,
  ServicesFilter,
} from '../model/types';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';

/* ---------------- REAL ---------------- */

async function realGetServiceOrders(
  filter: ServicesFilter,
): Promise<ServiceOrder[]> {
  return request<ServiceOrder[]>('/me/orders/services', {
    query: {
      status: filter !== 'all' ? filter : undefined,
    },
  });
}

async function realGetProductOrders(): Promise<ProductOrder[]> {
  return request<ProductOrder[]>('/me/orders/products');
}

async function realRepeatServiceOrder(
  orderId: string,
): Promise<RepeatResult> {
  return request<RepeatResult>(
    `/me/orders/services/${encodeURIComponent(orderId)}/repeat`,
    {
      method: 'POST',
    },
  );
}

async function realRepeatProductOrder(
  orderId: string,
): Promise<RepeatResult> {
  return request<RepeatResult>(
    `/me/orders/products/${encodeURIComponent(orderId)}/repeat`,
    {
      method: 'POST',
    },
  );
}

async function realLeaveServiceReview(
  orderId: string,
  rating: number,
): Promise<ReviewResult> {
  return request<ReviewResult>(
    `/me/orders/services/${encodeURIComponent(orderId)}/review`,
    {
      method: 'POST',
      body: { rating },
    },
  );
}

/* ---------------- EXPORT ---------------- */

export const ordersApi = {
  getServiceOrders: (filter: ServicesFilter) =>
    USE_MOCK ? mockGetServiceOrders(filter) : realGetServiceOrders(filter),

  getProductOrders: () =>
    USE_MOCK ? mockGetProductOrders() : realGetProductOrders(),

  repeatServiceOrder: (orderId: string) =>
    USE_MOCK
      ? mockRepeatServiceOrder()
      : realRepeatServiceOrder(orderId),

  repeatProductOrder: (orderId: string) =>
    USE_MOCK
      ? mockRepeatProductOrder()
      : realRepeatProductOrder(orderId),

  leaveServiceReview: (orderId: string, rating: number) =>
    USE_MOCK
      ? mockLeaveServiceReview(orderId, rating)
      : realLeaveServiceReview(orderId, rating),
};