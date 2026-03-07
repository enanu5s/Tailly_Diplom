// src/features/shop/api/shopApi.ts
import { fetchJson } from '@/shared/api/fetchJson';

import { SHOP_CATEGORIES_MOCK, SHOP_PRODUCTS_MOCK } from './mockData';

import type {
    CatalogFilterState,
    CatalogMetaResponse,
    CatalogProductsResponse,
    Product,
    ProductSort,
} from '../model/types';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

function normalizeText(value: string): string {
    return value
        .toLowerCase()
        .replace(/ё/g, 'е')
        .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function tokenize(value: string): string[] {
    return normalizeText(value)
        .split(' ')
        .map((token) => token.trim())
        .filter(Boolean);
}

function getSearchFields(product: Product): string[] {
    return [
        product.title,
        product.shortDescription,
        product.description,
        product.categoryTitle,
    ];
}

function levenshteinDistance(a: string, b: string): number {
    if (a === b) {
        return 0;
    }

    if (a.length === 0) {
        return b.length;
    }

    if (b.length === 0) {
        return a.length;
    }

    const matrix: number[][] = Array.from({ length: a.length + 1 }, (_, rowIndex) =>
        Array.from({ length: b.length + 1 }, (_, columnIndex) => {
            if (rowIndex === 0) {
                return columnIndex;
            }

            if (columnIndex === 0) {
                return rowIndex;
            }

            return 0;
        }),
    );

    for (let row = 1; row <= a.length; row += 1) {
        for (let column = 1; column <= b.length; column += 1) {
            const cost = a[row - 1] === b[column - 1] ? 0 : 1;

            matrix[row][column] = Math.min(
                matrix[row - 1][column] + 1,
                matrix[row][column - 1] + 1,
                matrix[row - 1][column - 1] + cost,
            );
        }
    }

    return matrix[a.length][b.length];
}

function matchesSearch(product: Product, search: string): boolean {
    const queryTokens = tokenize(search);

    if (queryTokens.length === 0) {
        return true;
    }

    const normalizedFields = getSearchFields(product).map(normalizeText);
    const fullText = normalizedFields.join(' ');
    const fieldTokens = tokenize(fullText);

    return queryTokens.every((queryToken) => {
        if (fullText.includes(queryToken)) {
            return true;
        }

        return fieldTokens.some((fieldToken) => {
            return (
                fieldToken.includes(queryToken) ||
                queryToken.includes(fieldToken) ||
                levenshteinDistance(fieldToken, queryToken) <= 1
            );
        });
    });
}

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
        const isMatchedBySearch = matchesSearch(product, filters.search);

        const isMatchedByCategory =
            filters.categoryIds.length === 0 ||
            filters.categoryIds.includes(product.categoryId);

        const isMatchedByMinPrice =
            filters.minPrice === null || product.price >= filters.minPrice;

        const isMatchedByMaxPrice =
            filters.maxPrice === null || product.price <= filters.maxPrice;

        const isMatchedByAvailability =
            !filters.onlyAvailable || product.isAvailable;

        return (
            isMatchedBySearch &&
            isMatchedByCategory &&
            isMatchedByMinPrice &&
            isMatchedByMaxPrice &&
            isMatchedByAvailability
        );
    });
}

async function getCatalogMetaMock(): Promise<CatalogMetaResponse> {
    const prices = SHOP_PRODUCTS_MOCK.map((product) => product.price);
    return {
        categories: SHOP_CATEGORIES_MOCK,
        minPrice: prices.length > 0 ? Math.min(...prices) : 0,
        maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
        availableSorts: ['popular', 'newest', 'rating-desc', 'price-asc', 'price-desc'],
    };
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

async function getProductsByIdsMock(productIds: string[]): Promise<Product[]> {
    if (productIds.length === 0) {
        return [];
    }

    const productIdsSet = new Set(productIds);
    const orderedProducts = productIds
        .map((productId) => SHOP_PRODUCTS_MOCK.find((product) => product.id === productId) ?? null)
        .filter((product): product is Product => product !== null);

    const uniqueOrderedProducts: Product[] = [];
    const seenIds = new Set<string>();

    orderedProducts.forEach((product) => {
        if (!productIdsSet.has(product.id) || seenIds.has(product.id)) {
            return;
        }

        seenIds.add(product.id);
        uniqueOrderedProducts.push(product);
    });

    return uniqueOrderedProducts;
}

async function getCatalogMetaReal(): Promise<CatalogMetaResponse> {
    return fetchJson<CatalogMetaResponse>(`${API_BASE_URL} / shop / catalog / meta`);
}

async function getCatalogProductsReal(
    filters: CatalogFilterState,
): Promise<CatalogProductsResponse> {
    const params = new URLSearchParams();

    if (filters.search.trim()) {
        params.set('search', filters.search.trim());
    }

    if (filters.categoryIds.length > 0) {
        params.set('categoryIds', filters.categoryIds.join(','));
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

async function getProductsByIdsReal(productIds: string[]): Promise<Product[]> {
    if (productIds.length === 0) {
        return [];
    }

    const params = new URLSearchParams();
    params.set('ids', productIds.join(','));

    return fetchJson<Product[]>(`${API_BASE_URL} / shop / products / by - ids ? ${params.toString()}`);
}

async function getProductBySlugMock(slug: string): Promise<Product | null> {
    return SHOP_PRODUCTS_MOCK.find((product) => product.slug === slug) ?? null;
}

async function getProductBySlugReal(slug: string): Promise<Product | null> {
    return fetchJson<Product | null>(`${API_BASE_URL} / shop / products / ${slug}`);
}

export const shopApi = {
    async getCatalogMeta(): Promise<CatalogMetaResponse> {
        if (USE_MOCK) {
            return getCatalogMetaMock();
        }

        return getCatalogMetaReal();
    },

    async getCatalogProducts(
        filters: CatalogFilterState,
    ): Promise<CatalogProductsResponse> {
        if (USE_MOCK) {
            return getCatalogProductsMock(filters);
        }

        return getCatalogProductsReal(filters);
    },

    async getProductsByIds(productIds: string[]): Promise<Product[]> {
        if (USE_MOCK) {
            return getProductsByIdsMock(productIds);
        }

        return getProductsByIdsReal(productIds);
    },

    async getProductBySlug(slug: string): Promise<Product | null> {
        if (USE_MOCK) {
            return getProductBySlugMock(slug);
        }

        return getProductBySlugReal(slug);
    },
};