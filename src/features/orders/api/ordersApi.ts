// src/features/orders/api/ordersApi.ts

import { request } from '@/shared/api/http';
import { isMockApiMode } from '@/shared/config/env';

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

/* ---------------- REAL ---------------- */

async function realGetServiceOrders(filter: ServicesFilter): Promise<ServiceOrder[]> {
  return request<ServiceOrder[]>('/me/orders/services', {
    query: filter === 'all' ? undefined : { status: filter },
  });
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

async function realConfirmServiceOrder(orderId: string): Promise<ConfirmOrderResult> {
  return request<ConfirmOrderResult>(
    `/me/orders/services/${encodeURIComponent(orderId)}/confirm`,
    {
      method: 'POST',
    },
  );
}

async function realStartServiceOrder(orderId: string): Promise<StartOrderResult> {
  return request<StartOrderResult>(
    `/me/orders/services/${encodeURIComponent(orderId)}/start`,
    {
      method: 'POST',
    },
  );
}

async function realCompleteServiceOrder(orderId: string): Promise<CompleteOrderResult> {
  return request<CompleteOrderResult>(
    `/me/orders/services/${encodeURIComponent(orderId)}/complete`,
    {
      method: 'POST',
    },
  );
}

async function realCancelServiceOrder(orderId: string): Promise<CancelOrderResult> {
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

async function realCancelProductOrder(orderId: string): Promise<CancelOrderResult> {
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
    isMockApiMode ? mockGetServiceOrders(filter) : realGetServiceOrders(filter),

  getServiceOrderById: (orderId: string) =>
    isMockApiMode ? mockGetServiceOrderById(orderId) : realGetServiceOrderById(orderId),

  createServiceOrder: (payload: CreateServiceOrderPayload) =>
    isMockApiMode ? mockCreateServiceOrder(payload) : realCreateServiceOrder(payload),

  confirmServiceOrder: (orderId: string) =>
    isMockApiMode ? mockConfirmServiceOrder(orderId) : realConfirmServiceOrder(orderId),

  startServiceOrder: (orderId: string) =>
    isMockApiMode ? mockStartServiceOrder(orderId) : realStartServiceOrder(orderId),

  completeServiceOrder: (orderId: string) =>
    isMockApiMode ? mockCompleteServiceOrder(orderId) : realCompleteServiceOrder(orderId),

  cancelServiceOrder: (orderId: string) =>
    isMockApiMode ? mockCancelServiceOrder(orderId) : realCancelServiceOrder(orderId),

  getProductOrders: () =>
    isMockApiMode ? mockGetProductOrders() : realGetProductOrders(),

  getProductOrderById: (orderId: string) =>
    isMockApiMode ? mockGetProductOrderById(orderId) : realGetProductOrderById(orderId),

  cancelProductOrder: (orderId: string) =>
    isMockApiMode ? mockCancelProductOrder(orderId) : realCancelProductOrder(orderId),

  repeatServiceOrder: (orderId: string) =>
    isMockApiMode ? mockRepeatServiceOrder(orderId) : realRepeatServiceOrder(orderId),

  repeatProductOrder: (orderId: string) =>
    isMockApiMode ? mockRepeatProductOrder(orderId) : realRepeatProductOrder(orderId),

  leaveServiceReview: (orderId: string, payload: LeaveServiceReviewPayload) =>
    isMockApiMode
      ? mockLeaveServiceReview(orderId, payload)
      : realLeaveServiceReview(orderId, payload),
};
