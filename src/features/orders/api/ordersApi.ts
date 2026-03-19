// src/features/orders/api/ordersApi.ts

import { request } from '@/shared/api/http';

import {
  mockCompleteServiceOrder,
  mockCreateServiceOrder,
  mockGetProductOrders,
  mockGetServiceOrderById,
  mockGetServiceOrders,
  mockLeaveServiceReview,
  mockRepeatProductOrder,
  mockRepeatServiceOrder,
} from './ordersApi.mock';
import type {
  CompleteOrderResult,
  CreateServiceOrderPayload,
  ProductOrder,
  RepeatResult,
  ReviewResult,
  ServiceOrder,
  ServicesFilter,
} from '../model/types';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
void API_BASE_URL;

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

async function realGetServiceOrderById(orderId: string): Promise<ServiceOrder> {
  return request<ServiceOrder>(
    `/me/orders/services/${encodeURIComponent(orderId)}`,
  );
}

async function realCreateServiceOrder(
  payload: CreateServiceOrderPayload,
): Promise<ServiceOrder> {
  return request<ServiceOrder>('/me/orders/services', {
    method: 'POST',
    body: payload,
  });
}

async function realCompleteServiceOrder(
  orderId: string,
): Promise<CompleteOrderResult> {
  return request<CompleteOrderResult>(
    `/me/orders/services/${encodeURIComponent(orderId)}/complete`,
    {
      method: 'POST',
    },
  );
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

  getServiceOrderById: (orderId: string) =>
    USE_MOCK
      ? mockGetServiceOrderById(orderId)
      : realGetServiceOrderById(orderId),

  createServiceOrder: (payload: CreateServiceOrderPayload) =>
    USE_MOCK
      ? mockCreateServiceOrder(payload)
      : realCreateServiceOrder(payload),

  completeServiceOrder: (orderId: string) =>
    USE_MOCK
      ? mockCompleteServiceOrder(orderId)
      : realCompleteServiceOrder(orderId),

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