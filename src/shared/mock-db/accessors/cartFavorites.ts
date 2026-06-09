// src/shared/mock-db/accessors/cartFavorites.ts

import type { StoredCartItem } from '@/features/shop/model/shopCartStore';
import { cloneDeep } from '@/shared/mock-db/cloneDeep';
import { patchMockDatabase, unsafeMutableMockDb } from '@/shared/mock-db/store';

export const GUEST_CART_KEY = 'guest';

export function resolveCartFavoritesKey(userId: string | null | undefined): string {
  return userId?.trim() || GUEST_CART_KEY;
}

export function readCartItems(key: string): StoredCartItem[] {
  const items = unsafeMutableMockDb().shop.cartByKey[key];
  return items ? cloneDeep(items) : [];
}

export function writeCartItems(key: string, items: StoredCartItem[]): void {
  patchMockDatabase((db) => {
    if (items.length === 0) {
      delete db.shop.cartByKey[key];
    } else {
      db.shop.cartByKey[key] = cloneDeep(items);
    }
  });
}

export function readFavoriteProductIds(key: string): string[] {
  const ids = unsafeMutableMockDb().shop.favoritesByKey[key];
  return ids ? [...ids] : [];
}

export function writeFavoriteProductIds(key: string, productIds: string[]): void {
  patchMockDatabase((db) => {
    if (productIds.length === 0) {
      delete db.shop.favoritesByKey[key];
    } else {
      db.shop.favoritesByKey[key] = [...productIds];
    }
  });
}
