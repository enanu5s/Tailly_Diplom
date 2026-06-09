// src/features/shop/api/shopApi.mock.ts

import {
  applyFilters,
  applySort,
  buildCatalogMetaForLists,
} from '@/shared/mock-db/seed/shop.seed';
import {
  getShopCategoriesSnapshot,
  getShopProductsSnapshot,
} from '../data/mockShopCatalogDb';
import { patchMockDatabase } from '@/shared/mock-db/store';

import type {
  CatalogFilterState,
  CatalogMetaResponse,
  CatalogProductsResponse,
  Product,
} from '../model/types';
import type {
  CreateProductReviewPayload,
  ReplyToProductReviewPayload,
} from './shopApi';

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

export async function mockSubmitProductReview(
  payload: CreateProductReviewPayload,
): Promise<void> {
  if (![1, 2, 3, 4, 5].includes(payload.rating)) {
    throw new Error('Оценка должна быть от 1 до 5.');
  }

  if (!payload.text.trim()) {
    throw new Error('Текст отзыва не может быть пустым.');
  }

  let wasCreated = false;

  patchMockDatabase((db) => {
    const product = db.shop.products.find((item) => item.id === payload.productId);
    if (!product) {
      return;
    }

    const nextReview = {
      id: `shop-review-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      authorName: 'Вы',
      rating: payload.rating,
      text: payload.text.trim(),
      createdAt: new Date().toISOString(),
      siteReply: null,
    } as const;

    product.reviews = [nextReview, ...product.reviews];
    product.reviewsCount = product.reviews.length;
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    product.rating = Number((totalRating / product.reviews.length).toFixed(1));
    product.updatedAt = new Date().toISOString();
    wasCreated = true;
  });

  if (!wasCreated) {
    throw new Error('Товар не найден.');
  }
}

export async function mockReplyToProductReview(
  reviewId: string,
  payload: ReplyToProductReviewPayload,
): Promise<void> {
  if (!payload.text.trim()) {
    throw new Error('Текст ответа не может быть пустым.');
  }

  let wasUpdated = false;

  patchMockDatabase((db) => {
    for (const product of db.shop.products) {
      const review = product.reviews.find((item) => item.id === reviewId);
      if (!review) {
        continue;
      }

      review.siteReply = {
        authorName: 'Магазин Tailly',
        text: payload.text.trim(),
        createdAt: new Date().toISOString(),
      };
      product.updatedAt = new Date().toISOString();
      wasUpdated = true;
      break;
    }
  });

  if (!wasUpdated) {
    throw new Error('Отзыв не найден.');
  }
}
