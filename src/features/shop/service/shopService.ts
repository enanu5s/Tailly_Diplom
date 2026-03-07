// src/features/shop/service/shopService.ts
import { shopApi } from '../api/shopApi';
import type {
    CatalogFilterState,
    CatalogMetaResponse,
    CatalogProductsResponse,
    Product,
} from '../model/types';

export const shopService = {
    async getCatalogMeta(): Promise<CatalogMetaResponse> {
        return shopApi.getCatalogMeta();
    },

    async getCatalogProducts(
        filters: CatalogFilterState,
    ): Promise<CatalogProductsResponse> {
        return shopApi.getCatalogProducts(filters);
    },

    async getProductsByIds(productIds: string[]): Promise<Product[]> {
        return shopApi.getProductsByIds(productIds);
    },

    async getProductBySlug(slug: string): Promise<Product | null> {
        return shopApi.getProductBySlug(slug);
    },
};