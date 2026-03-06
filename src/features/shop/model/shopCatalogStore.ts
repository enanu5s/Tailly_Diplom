// src/features/shop/model/shopCatalogStore.ts

import { makeAutoObservable, runInAction } from 'mobx';

import { shopService } from '../service/shopService';
import {
    DEFAULT_CATALOG_FILTERS,
    type CatalogFilterState,
    type Product,
} from './types';

export class ShopCatalogStore {
    filters: CatalogFilterState = JSON.parse(JSON.stringify(DEFAULT_CATALOG_FILTERS));
    products: Product[] = [];
    total = 0;
    isLoading = false;
    error: string | null = null;
    isInitialized = false;

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    setSearch(value: string): void {
        this.filters.search = value;
        this.filters.page = 1;
    }

    setSort(value: CatalogFilterState['sort']): void {
        this.filters.sort = value;
        this.filters.page = 1;
    }

    setOnlyAvailable(value: boolean): void {
        this.filters.onlyAvailable = value;
        this.filters.page = 1;
    }

    setCategory(category: Product['category'], checked: boolean): void {
        const nextCategories = new Set(this.filters.categories);

        if (checked) {
            nextCategories.add(category);
        } else {
            nextCategories.delete(category);
        }

        this.filters.categories = Array.from(nextCategories);
        this.filters.page = 1;
    }

    setMinPrice(value: number | null): void {
        this.filters.minPrice = value;
        this.filters.page = 1;
    }

    setMaxPrice(value: number | null): void {
        this.filters.maxPrice = value;
        this.filters.page = 1;
    }

    setPage(page: number): void {
        this.filters.page = page;
    }

    resetFilters(): void {
        this.filters = JSON.parse(JSON.stringify(DEFAULT_CATALOG_FILTERS));
    }

    async load(): Promise<void> {
        this.isLoading = true;
        this.error = null;

        try {
            const response = await shopService.getCatalogProducts(this.filters);

            runInAction(() => {
                this.products = response.items;
                this.total = response.total;
                this.isInitialized = true;
            });
        } catch (error) {
            runInAction(() => {
                this.error =
                    error instanceof Error ? error.message : 'Не удалось загрузить каталог.';
            });
        } finally {
            runInAction(() => {
                this.isLoading = false;
            });
        }
    }

    get totalPages(): number {
        return Math.max(1, Math.ceil(this.total / this.filters.limit));
    }

    get hasProducts(): boolean {
        return this.products.length > 0;
    }
}

export const shopCatalogStore = new ShopCatalogStore();