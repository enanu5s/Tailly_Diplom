// src/shared/mock-db/accessors/shop.ts

import { cloneDeep } from '@/shared/mock-db/cloneDeep';
import { patchMockDatabase, unsafeMutableMockDb } from '@/shared/mock-db/store';

import type { Order, Product, ProductCategory } from '@/features/shop/model/types';

export function readShopCategories(): ProductCategory[] {
  return cloneDeep(unsafeMutableMockDb().shop.categories);
}

export function readShopProducts(): Product[] {
  return cloneDeep(unsafeMutableMockDb().shop.products);
}

export function readShopOrders(): Order[] {
  return cloneDeep(unsafeMutableMockDb().shop.orders);
}

export function writeShopProducts(products: Product[]): void {
  patchMockDatabase((db) => {
    db.shop.products = cloneDeep(products);
  });
}

export function patchShopProducts(recipe: (products: Product[]) => Product[]): void {
  patchMockDatabase((db) => {
    db.shop.products = recipe(cloneDeep(db.shop.products));
  });
}

export function patchShopOrders(recipe: (orders: Order[]) => Order[]): void {
  patchMockDatabase((db) => {
    db.shop.orders = recipe(cloneDeep(db.shop.orders));
  });
}

export function findShopProductById(id: string): Product | undefined {
  return readShopProducts().find((p) => p.id === id);
}

export function findShopProductBySlug(slug: string): Product | undefined {
  const normalized = slug.trim().toLowerCase();
  return readShopProducts().find((p) => p.slug.trim().toLowerCase() === normalized);
}
