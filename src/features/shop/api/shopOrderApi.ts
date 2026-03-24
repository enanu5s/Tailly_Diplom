// src/features/shop/api/shopOrderApi.ts

import { request } from '@/shared/api/http';
import { isMockApiMode } from '@/shared/config/env';

import {
  mockCancelOrder,
  mockCreateOrder,
  mockGetOrderById,
  mockGetPickupPoints,
  mockPayShopOrder,
} from './shopOrderApi.mock';

import type { CheckoutForm, Order, PickupPoint } from '../model/types';

type OrderLineInput = {
  productId: string;
  quantity: number;
};

export type CreateOrderPayload = {
  form: CheckoutForm;
  items: OrderLineInput[];
};

async function getPickupPointsReal(city?: string): Promise<PickupPoint[]> {
  return request<PickupPoint[]>('/shop/pickup-points', {
    query: {
      city: city?.trim() || undefined,
    },
  });
}

async function createOrderReal(payload: CreateOrderPayload): Promise<Order> {
  return request<Order>('/shop/orders', {
    method: 'POST',
    body: payload,
  });
}

async function getOrderByIdReal(orderId: string): Promise<Order | null> {
  return request<Order | null>(`/shop/orders/${encodeURIComponent(orderId)}`);
}

async function cancelOrderReal(orderId: string): Promise<Order> {
  return request<Order>(`/shop/orders/${encodeURIComponent(orderId)}/cancel`, {
    method: 'POST',
  });
}

export type PayShopOrderPayload = {
  paymentMethod: 'card' | 'sbp';
};

async function payShopOrderReal(
  orderId: string,
  payload: PayShopOrderPayload,
): Promise<Order> {
  return request<Order>(`/shop/orders/${encodeURIComponent(orderId)}/pay`, {
    method: 'POST',
    body: payload,
  });
}

export const shopOrderApi = {
  async getPickupPoints(city?: string): Promise<PickupPoint[]> {
    if (isMockApiMode) {
      return mockGetPickupPoints(city);
    }

    return getPickupPointsReal(city);
  },

  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    if (isMockApiMode) {
      return mockCreateOrder(payload);
    }

    return createOrderReal(payload);
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    if (isMockApiMode) {
      return mockGetOrderById(orderId);
    }

    return getOrderByIdReal(orderId);
  },

  async cancelOrder(orderId: string): Promise<Order> {
    if (isMockApiMode) {
      return mockCancelOrder(orderId);
    }

    return cancelOrderReal(orderId);
  },

  async payShopOrder(orderId: string, payload: PayShopOrderPayload): Promise<Order> {
    if (isMockApiMode) {
      return mockPayShopOrder(orderId, payload.paymentMethod);
    }

    return payShopOrderReal(orderId, payload);
  },
};
