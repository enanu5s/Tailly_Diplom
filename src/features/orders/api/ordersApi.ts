// src/features/orders/api/ordersApi.ts

import { request } from '@/shared/api/http';

import {
  mockCancelServiceOrder,
  mockCompleteServiceOrder,
  mockConfirmServiceOrder,
  mockCreateServiceOrder,
  mockGetProductOrders,
  mockGetServiceOrderById,
  mockGetServiceOrders,
  mockLeaveServiceReview,
  mockRepeatProductOrder,
  mockRepeatServiceOrder,
  mockStartServiceOrder,
} from './ordersApi.mock';

import type {
  CancelOrderResult,
  CompleteOrderResult,
  ConfirmOrderResult,
  CreateServiceOrderPayload,
  ProductOrder,
  RepeatResult,
  ReviewResult,
  ServiceOrder,
  ServicesFilter,
  StartOrderResult,
} from '../model/types';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

void API_BASE_URL;

/* ---------------- REAL ---------------- */

async function realGetServiceOrders(
  filter: ServicesFilter,
): Promise<ServiceOrder[]> {
  return request('/me/orders/services', {
    query: {
      status: filter !== 'all' ? filter : undefined,
    },
  });
}

async function realGetServiceOrderById(orderId: string): Promise<ServiceOrder> {
  return request(`/me/orders/services/${encodeURIComponent(orderId)}`);
}

async function realCreateServiceOrder(
  payload: CreateServiceOrderPayload,
): Promise<ServiceOrder> {
  return request('/me/orders/services', {
    method: 'POST',
    body: payload,
  });
}

async function realConfirmServiceOrder(
  orderId: string,
): Promise<ConfirmOrderResult> {
  return request(`/me/orders/services/${encodeURIComponent(orderId)}/confirm`, {
    method: 'POST',
  });
}

async function realStartServiceOrder(
  orderId: string,
): Promise<StartOrderResult> {
  return request(`/me/orders/services/${encodeURIComponent(orderId)}/start`, {
    method: 'POST',
  });
}

async function realCompleteServiceOrder(
  orderId: string,
): Promise<CompleteOrderResult> {
  return request(`/me/orders/services/${encodeURIComponent(orderId)}/complete`, {
    method: 'POST',
  });
}

async function realCancelServiceOrder(
  orderId: string,
): Promise<CancelOrderResult> {
  return request(`/me/orders/services/${encodeURIComponent(orderId)}/cancel`, {
    method: 'POST',
  });
}

async function realGetProductOrders(): Promise<ProductOrder[]> {
  return request('/me/orders/products');
}

async function realRepeatServiceOrder(orderId: string): Promise<RepeatResult> {
  return request(`/me/orders/services/${encodeURIComponent(orderId)}/repeat`, {
    method: 'POST',
  });
}

async function realRepeatProductOrder(orderId: string): Promise<RepeatResult> {
  return request(`/me/orders/products/${encodeURIComponent(orderId)}/repeat`, {
    method: 'POST',
  });
}

async function realLeaveServiceReview(
  orderId: string,
  rating: number,
): Promise<ReviewResult> {
  return request(`/me/orders/services/${encodeURIComponent(orderId)}/review`, {
    method: 'POST',
    body: { rating },
  });
}

/* ---------------- EXPORT ---------------- */

export const ordersApi = {
  getServiceOrders: (filter: ServicesFilter) =>
    USE_MOCK ? mockGetServiceOrders(filter) : realGetServiceOrders(filter),

  getServiceOrderById: (orderId: string) =>
    USE_MOCK ? mockGetServiceOrderById(orderId) : realGetServiceOrderById(orderId),

  createServiceOrder: (payload: CreateServiceOrderPayload) =>
    USE_MOCK ? mockCreateServiceOrder(payload) : realCreateServiceOrder(payload),

  confirmServiceOrder: (orderId: string) =>
    USE_MOCK ? mockConfirmServiceOrder(orderId) : realConfirmServiceOrder(orderId),

  startServiceOrder: (orderId: string) =>
    USE_MOCK ? mockStartServiceOrder(orderId) : realStartServiceOrder(orderId),

  completeServiceOrder: (orderId: string) =>
    USE_MOCK ? mockCompleteServiceOrder(orderId) : realCompleteServiceOrder(orderId),

  cancelServiceOrder: (orderId: string) =>
    USE_MOCK ? mockCancelServiceOrder(orderId) : realCancelServiceOrder(orderId),

  getProductOrders: () =>
    USE_MOCK ? mockGetProductOrders() : realGetProductOrders(),

  repeatServiceOrder: (orderId: string) =>
    USE_MOCK ? mockRepeatServiceOrder(orderId) : realRepeatServiceOrder(orderId),

  repeatProductOrder: (orderId: string) =>
    USE_MOCK ? mockRepeatProductOrder() : realRepeatProductOrder(orderId),

  leaveServiceReview: (orderId: string, rating: number) =>
    USE_MOCK
      ? mockLeaveServiceReview(orderId, rating)
      : realLeaveServiceReview(orderId, rating),
};