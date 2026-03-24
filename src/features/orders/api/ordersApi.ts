// src/features/orders/api/ordersApi.ts

import { request } from '@/shared/api/http';

import {
  mockCancelProductOrder,
  mockCancelServiceOrder,
  mockCompleteServiceOrder,
  mockConfirmServiceOrder,
  mockCreateServiceOrder,
  mockGetProductOrderById,
  mockGetProductOrders,
  mockGetServiceOrderById,
  mockGetServiceOrders,
  mockLeaveServiceReview,
  mockRepeatProductOrder,
  mockRepeatServiceOrder,
  mockStartServiceOrder,
} from './ordersApi.mock';

import type { ProductOrderRepeatCheckoutDraft } from '../model/productOrderRepeatCheckout';
import type {
  CancelOrderResult,
  CompleteOrderResult,
  ConfirmOrderResult,
  CreateServiceOrderPayload,
  LeaveServiceReviewPayload,
  ProductOrder,
  RepeatResult,
  ReviewResult,
  ServiceOrder,
  ServicesFilter,
  StartOrderResult,
} from '../model/types';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';

/* ---------------- REAL ---------------- */

async function realGetServiceOrders(
  filter: ServicesFilter,
): Promise<ServiceOrder[]> {
  const query =
    filter === 'all'
      ? ''
      : `?status=${encodeURIComponent(filter)}`;

  return request<ServiceOrder[]>(`/me/orders/services${query}`);
}

async function realGetServiceOrderById(orderId: string): Promise<ServiceOrder> {
  return request<ServiceOrder>(`/me/orders/services/${encodeURIComponent(orderId)}`);
}

async function realCreateServiceOrder(
  payload: CreateServiceOrderPayload,
): Promise<ServiceOrder> {
  return request<ServiceOrder>('/me/orders/services', {
    method: 'POST',
    body: payload,
  });
}

async function realConfirmServiceOrder(
  orderId: string,
): Promise<ConfirmOrderResult> {
  return request<ConfirmOrderResult>(
    `/me/orders/services/${encodeURIComponent(orderId)}/confirm`,
    {
      method: 'POST',
    },
  );
}

async function realStartServiceOrder(
  orderId: string,
): Promise<StartOrderResult> {
  return request<StartOrderResult>(
    `/me/orders/services/${encodeURIComponent(orderId)}/start`,
    {
      method: 'POST',
    },
  );
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

async function realCancelServiceOrder(
  orderId: string,
): Promise<CancelOrderResult> {
  return request<CancelOrderResult>(
    `/me/orders/services/${encodeURIComponent(orderId)}/cancel`,
    {
      method: 'POST',
    },
  );
}

async function realGetProductOrders(): Promise<ProductOrder[]> {
  return request<ProductOrder[]>('/me/orders/products');
}

async function realGetProductOrderById(orderId: string): Promise<ProductOrder> {
  return request<ProductOrder>(`/me/orders/products/${encodeURIComponent(orderId)}`);
}

async function realCancelProductOrder(
  orderId: string,
): Promise<CancelOrderResult> {
  return request<CancelOrderResult>(
    `/me/orders/products/${encodeURIComponent(orderId)}/cancel`,
    {
      method: 'POST',
    },
  );
}

async function realRepeatServiceOrder(orderId: string): Promise<RepeatResult> {
  return request<RepeatResult>(
    `/me/orders/services/${encodeURIComponent(orderId)}/repeat`,
    {
      method: 'POST',
    },
  );
}

async function realRepeatProductOrder(
  orderId: string,
): Promise<ProductOrderRepeatCheckoutDraft> {
  return request<ProductOrderRepeatCheckoutDraft>(
    `/me/orders/products/${encodeURIComponent(orderId)}/repeat`,
    {
      method: 'POST',
    },
  );
}

async function realLeaveServiceReview(
  orderId: string,
  payload: LeaveServiceReviewPayload,
): Promise<ReviewResult> {
  return request<ReviewResult>(
    `/me/orders/services/${encodeURIComponent(orderId)}/review`,
    {
      method: 'POST',
      body: payload,
    },
  );
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

  getProductOrderById: (orderId: string) =>
    USE_MOCK ? mockGetProductOrderById(orderId) : realGetProductOrderById(orderId),

  cancelProductOrder: (orderId: string) =>
    USE_MOCK ? mockCancelProductOrder(orderId) : realCancelProductOrder(orderId),

  repeatServiceOrder: (orderId: string) =>
    USE_MOCK ? mockRepeatServiceOrder(orderId) : realRepeatServiceOrder(orderId),

  repeatProductOrder: (orderId: string) =>
    USE_MOCK ? mockRepeatProductOrder(orderId) : realRepeatProductOrder(orderId),

  leaveServiceReview: (orderId: string, payload: LeaveServiceReviewPayload) =>
    USE_MOCK
      ? mockLeaveServiceReview(orderId, payload)
      : realLeaveServiceReview(orderId, payload),
};