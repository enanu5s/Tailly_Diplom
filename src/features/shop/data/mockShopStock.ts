// src/features/shop/data/mockShopStock.ts

import { patchMockDatabase } from '@/shared/mock-db/store';

import { getShopProductsSnapshot } from './mockShopCatalogDb';

import type { CartDetailedItem, Order } from '../model/types';

export function assertOrderLinesHaveStock(items: CartDetailedItem[]): void {
  const snapshot = getShopProductsSnapshot();
  const byId = new Map(snapshot.map((p) => [p.id, p]));

  for (const line of items) {
    const product = byId.get(line.product.id);

    if (!product || line.quantity > product.stockQuantity) {
      throw new Error(
        `Недостаточно товара «${line.product.title}» на складе (доступно: ${product?.stockQuantity ?? 0} шт.).`,
      );
    }
  }
}

/**
 * В mock-БД изменяет остатки по позициям заказа.
 * subtract — списание со склада (оплата / наличные при оформлении);
 * add — возврат на склад при отмене.
 */
export function applyShopOrderStockDelta(order: Order, direction: 'subtract' | 'add'): void {
  const sign = direction === 'subtract' ? -1 : 1;

  patchMockDatabase((db) => {
    for (const line of order.items) {
      const productId = line.product.id;
      const idx = db.shop.products.findIndex((p) => p.id === productId);

      if (idx === -1) {
        continue;
      }

      const product = db.shop.products[idx];
      const next = Math.max(0, product.stockQuantity + sign * line.quantity);

      product.stockQuantity = next;
      product.isAvailable = next > 0;
    }
  });
}
