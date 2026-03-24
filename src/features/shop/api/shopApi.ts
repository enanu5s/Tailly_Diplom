// src/features/shop/api/shopApi.ts

import { request } from '@/shared/api/http';
import { isMockApiMode } from '@/shared/config/env';

import {
  mockGetCatalogMeta,
  mockGetCatalogProducts,
  mockGetProductBySlug,
  mockGetProductsByIds,
} from './shopApi.mock';

import type {
  CatalogFilterState,
  CatalogMetaResponse,
  CatalogProductsResponse,
  Product,
} from '../model/types';

async function getCatalogMetaReal(): Promise<CatalogMetaResponse> {
  return request<CatalogMetaResponse>('/shop/catalog/meta');
}

async function getCatalogProductsReal(
  filters: CatalogFilterState,
): Promise<CatalogProductsResponse> {
  return request<CatalogProductsResponse>('/shop/products', {
    query: {
      search: filters.search.trim() || undefined,
      categoryIds: filters.categoryIds.length ? filters.categoryIds.join(',') : undefined,
      minPrice: filters.minPrice ?? undefined,
      maxPrice: filters.maxPrice ?? undefined,
      onlyAvailable: filters.onlyAvailable || undefined,
      sort: filters.sort,
      page: filters.page,
      limit: filters.limit,
    },
  });
}

async function getProductsByIdsReal(productIds: string[]): Promise<Product[]> {
  if (productIds.length === 0) {
    return [];
  }

  return request<Product[]>('/shop/products/by-ids', {
    query: {
      ids: productIds.join(','),
    },
  });
}

async function getProductBySlugReal(slug: string): Promise<Product | null> {
  return request<Product | null>(`/shop/products/${encodeURIComponent(slug)}`);
}

export const shopApi = {
  async getCatalogMeta(): Promise<CatalogMetaResponse> {
    if (isMockApiMode) {
      return mockGetCatalogMeta();
    }

    return getCatalogMetaReal();
  },

  async getCatalogProducts(
    filters: CatalogFilterState,
  ): Promise<CatalogProductsResponse> {
    if (isMockApiMode) {
      return mockGetCatalogProducts(filters);
    }

    return getCatalogProductsReal(filters);
  },

  async getProductsByIds(productIds: string[]): Promise<Product[]> {
    if (isMockApiMode) {
      return mockGetProductsByIds(productIds);
    }

    return getProductsByIdsReal(productIds);
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    if (isMockApiMode) {
      return mockGetProductBySlug(slug);
    }

    return getProductBySlugReal(slug);
  },
};
