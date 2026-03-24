// src/features/shop/model/shopFavoritesPageStore.ts
import { makeAutoObservable, runInAction } from 'mobx';

import { shopFavoritesStore } from './shopFavoritesStore';
import { shopService } from '../service/shopService';

import type { Product } from './types';

export class ShopFavoritesPageStore {
  products: Product[] = [];
  isLoading = false;
  error: string | null = null;
  isInitialized = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  async load(): Promise<void> {
    const productIds = shopFavoritesStore.productIds;

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
          error instanceof Error ? error.message : 'Не удалось загрузить избранное.';
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  get isEmpty(): boolean {
    return shopFavoritesStore.productIds.length === 0;
  }

  /** Товары, которые ещё в избранном — `products` с сервера не очищается при remove/clear в сторе */
  get displayProducts(): Product[] {
    if (shopFavoritesStore.productIds.length === 0) {
      return [];
    }

    const allowed = new Set(shopFavoritesStore.productIds);
    return this.products.filter((product) => allowed.has(product.id));
  }

  reset(): void {
    this.products = [];
    this.isLoading = false;
    this.error = null;
    this.isInitialized = false;
  }
}

export const shopFavoritesPageStore = new ShopFavoritesPageStore();
