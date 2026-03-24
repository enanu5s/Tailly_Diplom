// src/features/shop/data/mockShopCatalogDb.ts

import { cloneDeep } from '@/shared/mock-db/cloneDeep';
import { ensureMockDatabaseLoaded, unsafeMutableMockDb } from '@/shared/mock-db/store';

import type { Product, ProductCategory } from '../model/types';

export function getShopProductsSnapshot(): Product[] {
  ensureMockDatabaseLoaded();

  return cloneDeep(unsafeMutableMockDb().shop.products);
}

export function getShopCategoriesSnapshot(): ProductCategory[] {
  ensureMockDatabaseLoaded();

  return cloneDeep(unsafeMutableMockDb().shop.categories);
}
