// src/features/orders/api/ordersApi.ts

import { HttpError, request } from '@/shared/api/http';
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

function shouldFallbackToMock(error: unknown): boolean {
  return error instanceof HttpError && (error.status === 401 || error.status === 404);
}

/* ---------------- EXPORT ---------------- */

export const ordersApi = {
  async getServiceOrders(filter: ServicesFilter): Promise<ServiceOrder[]> {
    if (isMockApiMode) {
      return mockGetServiceOrders(filter);
    }

    try {
      return await realGetServiceOrders(filter);
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        console.warn('[ordersApi.getServiceOrders] falling back to mock:', error);
        return mockGetServiceOrders(filter);
      }

      throw error;
    }
  },

  async getServiceOrderById(orderId: string): Promise<ServiceOrder> {
    if (isMockApiMode) {
      return mockGetServiceOrderById(orderId);
    }

    try {
      return await realGetServiceOrderById(orderId);
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        console.warn('[ordersApi.getServiceOrderById] falling back to mock:', error);
        return mockGetServiceOrderById(orderId);
      }

      throw error;
    }
  },

  async createServiceOrder(payload: CreateServiceOrderPayload): Promise<ServiceOrder> {
    if (isMockApiMode) {
      return mockCreateServiceOrder(payload);
    }

    try {
      return await realCreateServiceOrder(payload);
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        console.warn('[ordersApi.createServiceOrder] falling back to mock:', error);
        return mockCreateServiceOrder(payload);
      }

      throw error;
    }
  },

  async confirmServiceOrder(orderId: string): Promise<ConfirmOrderResult> {
    if (isMockApiMode) {
      return mockConfirmServiceOrder(orderId);
    }

    try {
      return await realConfirmServiceOrder(orderId);
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        console.warn('[ordersApi.confirmServiceOrder] falling back to mock:', error);
        return mockConfirmServiceOrder(orderId);
      }

      throw error;
    }
  },

  async startServiceOrder(orderId: string): Promise<StartOrderResult> {
    if (isMockApiMode) {
      return mockStartServiceOrder(orderId);
    }

    try {
      return await realStartServiceOrder(orderId);
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        console.warn('[ordersApi.startServiceOrder] falling back to mock:', error);
        return mockStartServiceOrder(orderId);
      }

      throw error;
    }
  },

  async completeServiceOrder(orderId: string): Promise<CompleteOrderResult> {
    if (isMockApiMode) {
      return mockCompleteServiceOrder(orderId);
    }

    try {
      return await realCompleteServiceOrder(orderId);
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        console.warn('[ordersApi.completeServiceOrder] falling back to mock:', error);
        return mockCompleteServiceOrder(orderId);
      }

      throw error;
    }
  },

  async cancelServiceOrder(orderId: string): Promise<CancelOrderResult> {
    if (isMockApiMode) {
      return mockCancelServiceOrder(orderId);
    }

    try {
      return await realCancelServiceOrder(orderId);
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        console.warn('[ordersApi.cancelServiceOrder] falling back to mock:', error);
        return mockCancelServiceOrder(orderId);
      }

      throw error;
    }
  },

  async getProductOrders(): Promise<ProductOrder[]> {
    if (isMockApiMode) {
      return mockGetProductOrders();
    }

    try {
      return await realGetProductOrders();
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        console.warn('[ordersApi.getProductOrders] falling back to mock:', error);
        return mockGetProductOrders();
      }

      throw error;
    }
  },

  async getProductOrderById(orderId: string): Promise<ProductOrder> {
    if (isMockApiMode) {
      return mockGetProductOrderById(orderId);
    }

    try {
      return await realGetProductOrderById(orderId);
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        console.warn('[ordersApi.getProductOrderById] falling back to mock:', error);
        return mockGetProductOrderById(orderId);
      }

      throw error;
    }
  },

  async cancelProductOrder(orderId: string): Promise<CancelOrderResult> {
    if (isMockApiMode) {
      return mockCancelProductOrder(orderId);
    }

    try {
      return await realCancelProductOrder(orderId);
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        console.warn('[ordersApi.cancelProductOrder] falling back to mock:', error);
        return mockCancelProductOrder(orderId);
      }

      throw error;
    }
  },

  async repeatServiceOrder(orderId: string): Promise<RepeatResult> {
    if (isMockApiMode) {
      return mockRepeatServiceOrder(orderId);
    }

    try {
      return await realRepeatServiceOrder(orderId);
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        console.warn('[ordersApi.repeatServiceOrder] falling back to mock:', error);
        return mockRepeatServiceOrder(orderId);
      }

      throw error;
    }
  },

  async repeatProductOrder(orderId: string): Promise<ProductOrderRepeatCheckoutDraft> {
    if (isMockApiMode) {
      return mockRepeatProductOrder(orderId);
    }

    try {
      return await realRepeatProductOrder(orderId);
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        console.warn('[ordersApi.repeatProductOrder] falling back to mock:', error);
        return mockRepeatProductOrder(orderId);
      }

      throw error;
    }
  },

  async leaveServiceReview(
    orderId: string,
    payload: LeaveServiceReviewPayload,
  ): Promise<ReviewResult> {
    if (isMockApiMode) {
      return mockLeaveServiceReview(orderId, payload);
    }

    try {
      return await realLeaveServiceReview(orderId, payload);
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        console.warn('[ordersApi.leaveServiceReview] falling back to mock:', error);
        return mockLeaveServiceReview(orderId, payload);
      }

      throw error;
    }
  },
};