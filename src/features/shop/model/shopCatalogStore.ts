// src/features/shop/model/shopCatalogStore.ts
import { makeAutoObservable, reaction, runInAction } from 'mobx';

import { shopService } from '../service/shopService';
import {
    DEFAULT_CATALOG_FILTERS,
    type CatalogFilterState,
    type Product,
    type ProductCategory,
    type ProductSort,
} from './types';

export class ShopCatalogStore {
    filters: CatalogFilterState = JSON.parse(JSON.stringify(DEFAULT_CATALOG_FILTERS));
    products: Product[] = [];
    total = 0;

    categories: ProductCategory[] = [];
    minCatalogPrice = 0;
    maxCatalogPrice = 0;
    availableSorts: ProductSort[] = [];

    isLoading = false;
    isMetaLoading = false;
    error: string | null = null;
    metaError: string | null = null;
    isInitialized = false;
    isMetaInitialized = false;

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });

        reaction(
            () => JSON.stringify(this.filters),
            (filtersSnapshot) => {
                console.log('[ShopCatalogStore] filters changed:', JSON.parse(filtersSnapshot));
            },
        );
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

    setCategory(categoryId: string, checked: boolean): void {
        const nextCategoryIds = new Set(this.filters.categoryIds);

        if (checked) {
            nextCategoryIds.add(categoryId);
        } else {
            nextCategoryIds.delete(categoryId);
        }

        this.filters.categoryIds = Array.from(nextCategoryIds);
        this.filters.page = 1;

        console.log('[ShopCatalogStore] setCategory result:', {
            categoryId,
            checked,
            nextCategoryIds: this.filters.categoryIds,
        });
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
        console.log('[ShopCatalogStore] filters reset:', this.filters);
    }

    async loadMeta(): Promise<void> {
        this.isMetaLoading = true;
        this.metaError = null;

        console.log('[ShopCatalogStore] loadMeta started');

        try {
            const response = await shopService.getCatalogMeta();

            runInAction(() => {
                this.categories = response.categories;
                this.minCatalogPrice = response.minPrice;
                this.maxCatalogPrice = response.maxPrice;
                this.availableSorts = response.availableSorts;
                this.isMetaInitialized = true;

                if (
                    this.availableSorts.length > 0 &&
                    !this.availableSorts.includes(this.filters.sort)
                ) {
                    this.filters.sort = this.availableSorts[0];
                }
            });

            console.log('[ShopCatalogStore] loadMeta success:', {
                categories: response.categories,
                minPrice: response.minPrice,
                maxPrice: response.maxPrice,
                availableSorts: response.availableSorts,
            });
        } catch (error) {
            runInAction(() => {
                this.metaError =
                    error instanceof Error
                        ? error.message
                        : 'Не удалось загрузить параметры каталога.';
            });

            console.error('[ShopCatalogStore] loadMeta failed:', error);
        } finally {
            runInAction(() => {
                this.isMetaLoading = false;
            });
        }
    }

    async load(): Promise<void> {
        this.isLoading = true;
        this.error = null;

        const plainFilters: CatalogFilterState = JSON.parse(JSON.stringify(this.filters));

        console.log('[ShopCatalogStore] load started with filters:', plainFilters);

        try {
            const response = await shopService.getCatalogProducts(plainFilters);

            runInAction(() => {
                this.products = response.items;
                this.total = response.total;
                this.isInitialized = true;
            });
            console.log('[ShopCatalogStore] load success:', {
                total: response.total,
                page: response.page,
                limit: response.limit,
                productIds: response.items.map((item) => item.id),
                productTitles: response.items.map((item) => item.title),
            });
        } catch (error) {
            runInAction(() => {
                this.error =
                    error instanceof Error ? error.message : 'Не удалось загрузить каталог.';
            });

            console.error('[ShopCatalogStore] load failed:', error);
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