// src/features/shop/api/shopApi.ts

import { fetchJson } from '@/shared/api/fetchJson';

import { SHOP_PRODUCTS_MOCK } from './mockData';

import type {
    CatalogFilterState,
    CatalogProductsResponse,
    Product,
    ProductSort,
} from '../model/types';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

function applySort(items: Product[], sort: ProductSort): Product[] {
    const copy = [...items];

    switch (sort) {
        case 'price-asc':
            return copy.sort((a, b) => a.price - b.price);
        case 'price-desc':
            return copy.sort((a, b) => b.price - a.price);
        case 'rating-desc':
            return copy.sort((a, b) => b.rating - a.rating);
        case 'newest':
            return copy.sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            );
        case 'popular':
        default:
            return copy.sort((a, b) => b.reviewsCount - a.reviewsCount);
    }
}

function applyFilters(items: Product[], filters: CatalogFilterState): Product[] {
    return items.filter((product) => {
        const search = filters.search.trim().toLowerCase();

        const matchesSearch =
            search.length === 0
        product.title.toLowerCase().includes(search)
        product.shortDescription.toLowerCase().includes(search)
        product.description.toLowerCase().includes(search);

        const matchesCategory =
            filters.categories.length === 0 || filters.categories.includes(product.category);

        const matchesMinPrice =
            filters.minPrice === null || product.price >= filters.minPrice;

        const matchesMaxPrice =
            filters.maxPrice === null || product.price <= filters.maxPrice;

        const matchesAvailability =
            !filters.onlyAvailable || product.isAvailable;

        return (
            matchesSearch &&
            matchesCategory &&
            matchesMinPrice &&
            matchesMaxPrice &&
            matchesAvailability
        );
    });
}

async function getCatalogProductsMock(
    filters: CatalogFilterState,
): Promise<CatalogProductsResponse> {
    const filtered = applyFilters(SHOP_PRODUCTS_MOCK, filters);
    const sorted = applySort(filtered, filters.sort);

    const startIndex = (filters.page - 1) * filters.limit;
    const paginated = sorted.slice(startIndex, startIndex + filters.limit);

    return {
        items: paginated,
        total: sorted.length,
        page: filters.page,
        limit: filters.limit,
    };
}

async function getCatalogProductsReal(
    filters: CatalogFilterState,
): Promise<CatalogProductsResponse> {
    const params = new URLSearchParams();

    if (filters.search.trim()) {
        params.set('search', filters.search.trim());
    }

    if (filters.categories.length > 0) {
        params.set('categories', filters.categories.join(','));
    }

    if (filters.minPrice !== null) {
        params.set('minPrice', String(filters.minPrice));
    }

    if (filters.maxPrice !== null) {
        params.set('maxPrice', String(filters.maxPrice));
    }

    if (filters.onlyAvailable) {
        params.set('onlyAvailable', 'true');
    }

    params.set('sort', filters.sort);
    params.set('page', String(filters.page));
    params.set('limit', String(filters.limit));

    return fetchJson<CatalogProductsResponse>(
        `${API_BASE_URL} / shop / products ? ${params.toString()}`,
    );
}

async function getProductBySlugMock(slug: string): Promise<Product | null> {
    return SHOP_PRODUCTS_MOCK.find((product) => product.slug === slug) ?? null;
}

async function getProductBySlugReal(slug: string): Promise<Product | null> {
    return fetchJson<Product | null>(`${API_BASE_URL} / shop / products / ${slug}`);
}

export const shopApi = {
    async getCatalogProducts(
        filters: CatalogFilterState,
    ): Promise<CatalogProductsResponse> {
        if (USE_MOCK) {
            return getCatalogProductsMock(filters);
        }

        return getCatalogProductsReal(filters);
    },

    async getProductBySlug(slug: string): Promise<Product | null> {
        if (USE_MOCK) {
            return getProductBySlugMock(slug);
        }

        return getProductBySlugReal(slug);
    },
};