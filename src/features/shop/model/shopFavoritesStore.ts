// src/features/shop/model/shopFavoritesStore.ts

import { makeAutoObservable } from 'mobx';

const STORAGE_KEY = 'tailly_shop_favorites';

export class ShopFavoritesStore {
  productIds: string[] = [];

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    this.restore();
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.productIds));
  }

  private restore(): void {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
        this.productIds = parsed;
      }
    } catch {
      this.productIds = [];
    }
  }

  has(productId: string): boolean {
    return this.productIds.includes(productId);
  }

  toggle(productId: string): void {
    if (this.has(productId)) {
      this.productIds = this.productIds.filter((id) => id !== productId);
    } else {
      this.productIds = [productId, ...this.productIds];
    }

    this.persist();
  }

  remove(productId: string): void {
    this.productIds = this.productIds.filter((id) => id !== productId);
    this.persist();
  }

  clear(): void {
    this.productIds = [];
    this.persist();
  }

  get total(): number {
    return this.productIds.length;
  }
}

export const shopFavoritesStore = new ShopFavoritesStore();
