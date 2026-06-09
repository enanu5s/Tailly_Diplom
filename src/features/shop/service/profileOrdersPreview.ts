// src/features/shop/service/profileOrdersPreview.ts

import { isProductOrderActive, type ProductOrder } from '@/features/orders/model/types';

export function getProfileOrdersPreview(orders: ProductOrder[]): ProductOrder[] {
  if (orders.length === 0) {
    return [];
  }

  const activeOrders = orders.filter((order) => isProductOrderActive(order));
  const source = activeOrders.length > 0 ? activeOrders : orders;

  return [...source]
    .sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 3);
}
