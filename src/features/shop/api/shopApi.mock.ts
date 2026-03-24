// src/features/shop/api/shopApi.mock.ts

import { applyFilters, applySort, buildCatalogMetaForLists } from '../data/mockShop';
import {
  getShopCategoriesSnapshot,
  getShopProductsSnapshot,
} from '../data/mockShopCatalogDb';

import type {
  CatalogFilterState,
  CatalogMetaResponse,
  CatalogProductsResponse,
  Product,
} from '../model/types';

export async function mockGetCatalogMeta(): Promise<CatalogMetaResponse> {
  return buildCatalogMetaForLists(getShopProductsSnapshot(), getShopCategoriesSnapshot());
}

export async function mockGetCatalogProducts(
  filters: CatalogFilterState,
): Promise<CatalogProductsResponse> {
  const filtered = applyFilters(getShopProductsSnapshot(), filters);
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

export async function mockGetProductsByIds(productIds: string[]): Promise<Product[]> {
  if (productIds.length === 0) {
    return [];
  }

  const productIdsSet = new Set(productIds);
  const catalog = getShopProductsSnapshot();
  const orderedProducts = productIds
    .map((productId) => catalog.find((product) => product.id === productId) ?? null)
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

export async function mockGetProductBySlug(slug: string): Promise<Product | null> {
  return getShopProductsSnapshot().find((product) => product.slug === slug) ?? null;
}
