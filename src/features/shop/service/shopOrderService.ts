// src/features/shop/service/shopOrderService.ts
import { authStore } from '@/features/auth/model/authStore';
import { canOrderShopProducts } from '@/shared/lib/auth/roleAccess';

import { shopOrderApi, type CreateOrderPayload } from '../api/shopOrderApi';

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

        return shopOrderApi.createOrder(payload);
    },

    async getOrderById(orderId: string): Promise<Order | null> {
        return shopOrderApi.getOrderById(orderId);
    },
};