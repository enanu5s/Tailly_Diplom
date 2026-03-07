// src/features/shop/model/shopCartPageStore.ts
import { makeAutoObservable, runInAction } from 'mobx';

import { shopCartStore } from './shopCartStore';
import type { Product } from './types';
import { shopService } from '../service/shopService';

export class ShopCartPageStore {
    products: Product[] = [];
    isLoading = false;
    error: string | null = null;
    isInitialized = false;

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    async load(): Promise<void> {
        const productIds = shopCartStore.items.map((item) => item.productId);

        if (productIds.length === 0) {
            runInAction(() => {
                this.products = [];
                this.error = null;
                this.isInitialized = true;
                this.isLoading = false;
            });

            return;
        }

        this.isLoading = true;
        this.error = null;

        try {
            const products = await shopService.getProductsByIds(productIds);

            runInAction(() => {
                this.products = products;
                this.isInitialized = true;
            });
        } catch (error) {
            runInAction(() => {
                this.error =
                    error instanceof Error ? error.message : 'Не удалось загрузить корзину.';
            });
        } finally {
            runInAction(() => {
                this.isLoading = false;
            });
        }
    }

    get itemsCount(): number {
        return shopCartStore.totalItems;
    }

    get detailedItems(): Array<{
        product: Product;
        quantity: number;
        lineTotal: number;
    }> {
        return this.products
            .map((product) => {
                const quantity = shopCartStore.getQuantity(product.id);

                if (quantity <= 0) {
                    return null;
                }

                return {
                    product,
                    quantity,
                    lineTotal: product.price * quantity,
                };
            })
            .filter(
                (
                    item,
                ): item is {
                    product: Product;
                    quantity: number;
                    lineTotal: number;
                } => item !== null,
            );
    }

    get totalPrice(): number {
        return this.detailedItems.reduce((sum, item) => sum + item.lineTotal, 0);
    }

    get isEmpty(): boolean {
        return shopCartStore.items.length === 0;
    }

    removeUnavailableOrMissing(): void {
        const availableProductIds = new Set(this.products.map((product) => product.id));

        shopCartStore.items.forEach((item) => {
            const product = this.products.find((entry) => entry.id === item.productId);

            if (!availableProductIds.has(item.productId) || !product?.isAvailable) {
                shopCartStore.remove(item.productId);
            }
        });
    }

    reset(): void {
        this.products = [];
        this.isLoading = false;
        this.error = null;
        this.isInitialized = false;
    }
}

export const shopCartPageStore = new ShopCartPageStore();