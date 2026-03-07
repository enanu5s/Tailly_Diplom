// src/features/shop/model/shopProductStore.ts
import { makeAutoObservable, runInAction } from 'mobx';

import { shopService } from '../service/shopService';
import type { Product } from './types';

export class ShopProductStore {
    product: Product | null = null;
    isLoading = false;
    error: string | null = null;

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    async loadBySlug(slug: string): Promise<void> {
        this.isLoading = true;
        this.error = null;
        this.product = null;

        try {
            const product = await shopService.getProductBySlug(slug);

            runInAction(() => {
                this.product = product;

                if (!product) {
                    this.error = 'Товар не найден.';
                }
            });
        } catch (error) {
            runInAction(() => {
                this.error =
                    error instanceof Error ? error.message : 'Не удалось загрузить товар.';
            });
        } finally {
            runInAction(() => {
                this.isLoading = false;
            });
        }
    }

    reset(): void {
        this.product = null;
        this.isLoading = false;
        this.error = null;
    }
}

export const shopProductStore = new ShopProductStore();