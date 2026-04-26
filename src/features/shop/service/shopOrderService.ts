// src/features/shop/service/shopOrderService.ts
import { authStore } from '@/features/auth/model/authStore';
import { canOrderShopProducts } from '@/shared/lib/auth/roleAccess';

import {
  shopOrderApi,
  type CreateOrderPayload,
  type PayShopOrderPayload,
} from '../api/shopOrderApi';
import { shopCartStore } from '../model/shopCartStore';
import type { ProductOrderRepeatCheckoutDraft } from '@/features/orders/model/productOrderRepeatCheckout';

import type { Order, PickupPoint } from '../model/types';

export const shopOrderService = {
  async getPickupPoints(city?: string): Promise<PickupPoint[]> {
    return shopOrderApi.getPickupPoints(city);
  },

  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const user = authStore.getState().user;

    if (!canOrderShopProducts(user)) {
      throw new Error(
        'Оформление заказов в магазине доступно только клиентам и специалистам.',
      );
    }

    await shopCartStore.ensureServerSynced();

    return shopOrderApi.createOrder(payload);
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    return shopOrderApi.getOrderById(orderId);
  },

  async getMyOrders(): Promise<Order[]> {
    const user = authStore.getState().user;

    if (!canOrderShopProducts(user)) {
      throw new Error('Просмотр заказов доступен только клиентам и специалистам.');
    }

    return shopOrderApi.getMyOrders();
  },

  async repeatOrder(orderId: string): Promise<ProductOrderRepeatCheckoutDraft> {
    const user = authStore.getState().user;

    if (!canOrderShopProducts(user)) {
      throw new Error('Повтор заказа доступен только клиентам и специалистам.');
    }

    return shopOrderApi.repeatOrder(orderId);
  },

  async confirmOrder(orderId: string): Promise<void> {
    const user = authStore.getState().user;

    if (!canOrderShopProducts(user)) {
      throw new Error('Подтверждение заказа доступно только клиентам и специалистам.');
    }

    return shopOrderApi.confirmOrder(orderId);
  },

  async payShopOrder(orderId: string, payload: PayShopOrderPayload): Promise<Order> {
    const user = authStore.getState().user;

    if (!canOrderShopProducts(user)) {
      throw new Error('Оплата заказа доступна только клиентам и специалистам.');
    }

    return shopOrderApi.payShopOrder(orderId, payload);
  },
};
