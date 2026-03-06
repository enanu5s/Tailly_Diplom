// src/features/shop/model/shopCartStore.ts

import { makeAutoObservable } from 'mobx';

import type { Product } from './types';

type StoredCartItem = {
    productId: string;
    quantity: number;
};

const STORAGE_KEY = 'tailly_shop_cart';

export class ShopCartStore {
    items: StoredCartItem[] = [];

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
        this.restore();
    }

    private persist(): void {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
    }

    private restore(): void {
        const raw = localStorage.getItem(STORAGE_KEY);

        if (!raw) {
            return;
        }

        try {
            const parsed = JSON.parse(raw);

            if (
                Array.isArray(parsed) &&
                parsed.every(
                    (item) =>
                        typeof item === 'object' &&
                        item !== null &&
                        typeof item.productId === 'string' &&
                        typeof item.quantity === 'number',
                )
            ) {
                this.items = parsed;
            }
        } catch {
            this.items = [];
        }
    }

    getQuantity(productId: string): number {
        const item = this.items.find((entry) => entry.productId === productId);
        return item?.quantity ?? 0;
    }

    add(productId: string, quantity = 1): void {
        const existing = this.items.find((item) => item.productId === productId);

        if (existing) {
            existing.quantity += quantity;
        } else {
            this.items = [...this.items, { productId, quantity }];
        }

        this.items = this.items.filter((item) => item.quantity > 0);
        this.persist();
    }

    setQuantity(productId: string, quantity: number): void {
        if (quantity <= 0) {
            this.remove(productId);
            return;
        }

        const existing = this.items.find((item) => item.productId === productId);

        if (existing) {
            existing.quantity = quantity;
        } else {
            this.items = [...this.items, { productId, quantity }];
        }

        this.persist();
    }

    increment(productId: string): void {
        this.add(productId, 1);
    }

    decrement(productId: string): void {
        const currentQuantity = this.getQuantity(productId);

        if (currentQuantity <= 1) {
            this.remove(productId);
            return;
        }

        this.setQuantity(productId, currentQuantity - 1);
    }

    remove(productId: string): void {
        this.items = this.items.filter((item) => item.productId !== productId);
        this.persist();
    }

    clear(): void {
        this.items = [];
        this.persist();
    }

    get totalItems(): number {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    getTotalPrice(products: Product[]): number {
        return this.items.reduce((sum, item) => {
            const product = products.find((entry) => entry.id === item.productId);

            if (!product) {
                return sum;
            }

            return sum + product.price * item.quantity;
        }, 0);
    }
}

export const shopCartStore = new ShopCartStore();