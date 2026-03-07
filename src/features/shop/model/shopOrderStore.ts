// src/features/shop/model/shopOrderStore.ts
import { makeAutoObservable, runInAction } from 'mobx';

import { shopOrderService } from '../service/shopOrderService';
import type { Order } from './types';

export class ShopOrderStore {
    order: Order | null = null;
    isLoading = false;
    error: string | null = null;

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    async loadById(orderId: string): Promise<void> {
        this.isLoading = true;
        this.error = null;
        this.order = null;

        try {
            const order = await shopOrderService.getOrderById(orderId);

            runInAction(() => {
                this.order = order;

                if (!order) {
                    this.error = 'Заказ не найден.';
                }
            });
        } catch (error) {
            runInAction(() => {
                this.error =
                    error instanceof Error ? error.message : 'Не удалось загрузить заказ.';
            });
        } finally {
            runInAction(() => {
                this.isLoading = false;
            });
        }
    }

    reset(): void {
        this.order = null;
        this.isLoading = false;
        this.error = null;
    }
}

export const shopOrderStore = new ShopOrderStore();