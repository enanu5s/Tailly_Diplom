// src/features/shop/data/seedReceivedShopOrder.ts

import { SEED_AUTH_BASE_ACCOUNTS } from '@/shared/mock-db/seed/authBaseAccounts.seed';
import { cloneDeep } from '@/shared/mock-db/cloneDeep';

import type { Order } from '../model/types';
import { SEED_SHOP_PRODUCTS } from '@/shared/mock-db/seed/shop.seed';

/** Стабильный id демо-заказа «Получен» (shop: completed → product order: delivered). */
export const SEED_RECEIVED_SHOP_ORDER_ID = 'order-seed-received-1';

/** Демо-клиент Елена Смирнова (`client@tailly.local`) — тот же id, что в `SEED_AUTH_BASE_ACCOUNTS`. */
function getElenaSmirnovaDemoAccount() {
  const account = SEED_AUTH_BASE_ACCOUNTS.find((entry) => entry.id === 'client-1');

  if (!account) {
    throw new Error('seedReceivedShopOrder: client-1 (Елена Смирнова) отсутствует в SEED_AUTH_BASE_ACCOUNTS');
  }

  return account;
}

export function getSeedReceivedShopOrder(): Order {
  const owner = getElenaSmirnovaDemoAccount();
  const product1 = SEED_SHOP_PRODUCTS.find((p) => p.id === 'product-1');
  const product2 = SEED_SHOP_PRODUCTS.find((p) => p.id === 'product-2');

  if (!product1 || !product2) {
    throw new Error('seedReceivedShopOrder: catalog products product-1 / product-2 missing');
  }

  const q1 = 1;
  const q2 = 1;
  const line1 = product1.price * q1;
  const line2 = product2.price * q2;

  return {
    id: SEED_RECEIVED_SHOP_ORDER_ID,
    status: 'completed',
    items: [
      { product: cloneDeep(product1), quantity: q1, lineTotal: line1 },
      { product: cloneDeep(product2), quantity: q2, lineTotal: line2 },
    ],
    totalPrice: line1 + line2,
    deliveryMethod: 'courier',
    paymentMethod: 'card',
    estimatedDeliveryDate: '2026-05-10T12:00:00.000Z',
    createdAt: '2026-05-08T09:30:00.000Z',
    canBeCancelled: false,
    ownerUserId: owner.id,
    recipientEmail: owner.email.trim().toLowerCase(),
    recipientName: `${owner.lastName} ${owner.firstName}`.trim(),
  };
}
