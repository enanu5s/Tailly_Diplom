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

function getPlainCategoryIds(categoryIds: CatalogFilterState['categoryIds']): string[] {
    return JSON.parse(JSON.stringify(categoryIds)) as string[];
}

function getSearchFields(product: Product): string[] {
    return [
        product.title,
        product.shortDescription,
        product.description,
        product.categoryTitle,
    ];
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
    const selectedCategoryIds = getPlainCategoryIds(filters.categoryIds);

    console.log('[shopApi] applyFilters input:', {
        filters: {
            ...filters,
            categoryIds: selectedCategoryIds,
        },
        allProducts: items.map((item) => ({
            id: item.id,
            title: item.title,
            categoryId: item.categoryId,
            categoryTitle: item.categoryTitle,
            price: item.price,
            isAvailable: item.isAvailable,
        })),
    });

    const result = items.filter((product) => {
        const isMatchedBySearch = matchesSearch(product, filters.search);
        const isMatchedByCategory =
            selectedCategoryIds.length === 0 ||
            selectedCategoryIds.includes(product.categoryId);

        const isMatchedByMinPrice =
            filters.minPrice === null || product.price >= filters.minPrice;

        const isMatchedByMaxPrice =
            filters.maxPrice === null || product.price <= filters.maxPrice;

        const isMatchedByAvailability =
            !filters.onlyAvailable || product.isAvailable;

        const matches =
            isMatchedBySearch &&
            isMatchedByCategory &&
            isMatchedByMinPrice &&
            isMatchedByMaxPrice &&
            isMatchedByAvailability;

        console.log('[shopApi] product filter result:', {
            productId: product.id,
            productTitle: product.title,
            productCategoryId: product.categoryId,
            selectedCategoryIds,
            isMatchedBySearch,
            isMatchedByCategory,
            isMatchedByMinPrice,
            isMatchedByMaxPrice,
            isMatchedByAvailability,
            matches,
        });

        return matches;
    });

    console.log('[shopApi] applyFilters output:', {
        resultCount: result.length,
        resultIds: result.map((item) => item.id),
        resultTitles: result.map((item) => item.title),
    });

    return result;
}

async function getCatalogMetaMock(): Promise<CatalogMetaResponse> {
    const prices = SHOP_PRODUCTS_MOCK.map((product) => product.price);

    const result = {
        categories: SHOP_CATEGORIES_MOCK,
        minPrice: prices.length > 0 ? Math.min(...prices) : 0,
        maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
        availableSorts: ['popular', 'newest', 'rating-desc', 'price-asc', 'price-desc'] as ProductSort[],
    };

    console.log('[shopApi] getCatalogMetaMock result:', result);

    return result;
}

async function getCatalogProductsMock(
    filters: CatalogFilterState,
): Promise<CatalogProductsResponse> {
    console.log('[shopApi] getCatalogProductsMock called with filters:', {
        ...filters,
        categoryIds: getPlainCategoryIds(filters.categoryIds),
    });

    const filtered = applyFilters(SHOP_PRODUCTS_MOCK, filters);
    const sorted = applySort(filtered, filters.sort);

    const startIndex = (filters.page - 1) * filters.limit;
    const paginated = sorted.slice(startIndex, startIndex + filters.limit);

    const result = {
        items: paginated,
        total: sorted.length,
        page: filters.page,
        limit: filters.limit,
    };

    console.log('[shopApi] getCatalogProductsMock result:', {
        total: result.total,
        page: result.page,
        limit: result.limit,
        itemIds: result.items.map((item) => item.id),
        itemTitles: result.items.map((item) => item.title),
    });

    return result;
}

async function getCatalogMetaReal(): Promise<CatalogMetaResponse> {
    return fetchJson<CatalogMetaResponse>(`${API_BASE_URL} / shop / catalog / meta`);
}

async function getCatalogProductsReal(
    filters: CatalogFilterState,
): Promise<CatalogProductsResponse> {
    const plainFilters: CatalogFilterState = JSON.parse(JSON.stringify(filters));
    const params = new URLSearchParams();

    if (plainFilters.search.trim()) {
        params.set('search', plainFilters.search.trim());
    }

    if (plainFilters.categoryIds.length > 0) {
        params.set('categoryIds', plainFilters.categoryIds.join(','));
    }

    if (plainFilters.minPrice !== null) {
        params.set('minPrice', String(plainFilters.minPrice));
    }

    if (plainFilters.maxPrice !== null) {
        params.set('maxPrice', String(plainFilters.maxPrice));
    }

    if (plainFilters.onlyAvailable) {
        params.set('onlyAvailable', 'true');
    }

    params.set('sort', plainFilters.sort);
    params.set('page', String(plainFilters.page));
    params.set('limit', String(plainFilters.limit));

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

    async getProductBySlug(slug: string): Promise<Product | null> {
        if (USE_MOCK) {
            return getProductBySlugMock(slug);
        }

        return getProductBySlugReal(slug);
    },
};