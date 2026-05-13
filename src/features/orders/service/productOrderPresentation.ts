// src/features/orders/service/productOrderPresentation.ts

import type { ProductOrder, ProductOrderStatus } from '../model/types';

export type ProductOrderStatusTone =
  | 'created'
  | 'paid'
  | 'shipped'
  | 'delivered'
  | 'canceled';

export function getProductOrderStatusLabel(status: ProductOrderStatus): string {
  switch (status) {
    case 'created':
      return 'Создан';
    case 'paid':
      return 'Оплачен';
    case 'shipped':
      return 'В пути';
    case 'delivered':
      return 'Получен';
    case 'canceled':
      return 'Отменён';
    default:
      return 'Статус уточняется';
  }
}

export function getProductOrderStatusTone(
  status: ProductOrderStatus,
): ProductOrderStatusTone {
  return status;
}

export function canRepeatProductOrder(order: ProductOrder): boolean {
  return order.items.length > 0;
}
