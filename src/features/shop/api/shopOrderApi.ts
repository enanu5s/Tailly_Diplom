// src/features/shop/api/shopOrderApi.ts
import { request } from '@/shared/api/http';

import {
  mockCreateOrder,
  mockGetOrderById,
  mockGetPickupPoints,
} from './shopOrderApi.mock';

import type {
  CheckoutForm,
  Order,
  PickupPoint,
} from '../model/types';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';

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
  return request<Order | null>(
    `/shop/orders/${encodeURIComponent(orderId)}`,
  );
}

export const shopOrderApi = {
  async getPickupPoints(city?: string): Promise<PickupPoint[]> {
    if (USE_MOCK) {
      return mockGetPickupPoints(city);
    }

    return getPickupPointsReal(city);
  },

  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    if (USE_MOCK) {
      return mockCreateOrder(payload);
    }

    return createOrderReal(payload);
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    if (USE_MOCK) {
      return mockGetOrderById(orderId);
    }

    return getOrderByIdReal(orderId);
  },
};