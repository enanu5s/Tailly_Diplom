// src/features/shop/service/shopOrderService.ts
import { shopOrderApi, type CreateOrderPayload } from '../api/shopOrderApi';

import type { Order, PickupPoint } from '../model/types';

export const shopOrderService = {
    async getPickupPoints(city?: string): Promise<PickupPoint[]> {
        return shopOrderApi.getPickupPoints(city);
    },

    async createOrder(payload: CreateOrderPayload): Promise<Order> {
        return shopOrderApi.createOrder(payload);
    },

    async getOrderById(orderId: string): Promise<Order | null> {
        return shopOrderApi.getOrderById(orderId);
    },
};