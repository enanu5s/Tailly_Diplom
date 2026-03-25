// src/features/shop/api/shopOrderApi.mock.ts

import { authStore } from '@/features/auth/model/authStore';
import { notifyShopOrderEvent } from '@/shared/lib/emailNotifications';

import { getShopProductsSnapshot } from '../data/mockShopCatalogDb';
import {
  addDays,
  generateOrderId,
  getPickupPointsSnapshot,
  readStoredOrders,
  writeStoredOrders,
} from '../data/mockShopOrders';
import {
  applyShopOrderStockDelta,
  assertOrderLinesHaveStock,
} from '../data/mockShopStock';

import type { CreateOrderPayload } from './shopOrderApi';
import type { CartDetailedItem, Order, PickupPoint, Product } from '../model/types';

const MOCK_UNSCOPED_SHOP_ORDER_FALLBACK_USER_ID = 'client-1';

export function assertCurrentUserOwnsMockShopOrder(order: Order): void {
  const user = authStore.getState().user;
  const uid = user?.id;

  if (!uid) {
    throw new Error('Нужна авторизация.');
  }

  if (!order.ownerUserId) {
    if (uid !== MOCK_UNSCOPED_SHOP_ORDER_FALLBACK_USER_ID) {
      throw new Error('Заказ не найден.');
    }

    return;
  }

  if (order.ownerUserId !== uid) {
    throw new Error('Заказ не найден.');
  }
}

type OrderLineInput = {
  productId: string;
  quantity: number;
};

function buildDetailedItems(
  items: OrderLineInput[],
  products: Product[],
): CartDetailedItem[] {
  return items
    .map((item) => {
      const product = products.find((entry) => entry.id === item.productId);

      if (!product || item.quantity <= 0) {
        return null;
      }

      return {
        product,
        quantity: item.quantity,
        lineTotal: product.price * item.quantity,
      };
    })
    .filter((item): item is CartDetailedItem => item !== null);
}

export async function mockGetPickupPoints(city?: string): Promise<PickupPoint[]> {
  const normalizedCity = city?.trim().toLowerCase() ?? '';

  const points = getPickupPointsSnapshot();

  if (!normalizedCity) {
    return points;
  }

  return points.filter((point) => point.address.toLowerCase().includes(normalizedCity));
}

export async function mockCreateOrder(payload: CreateOrderPayload): Promise<Order> {
  const productIds = payload.items.map((item) => item.productId);
  const products = getShopProductsSnapshot().filter((product) =>
    productIds.includes(product.id),
  );
  const detailedItems = buildDetailedItems(payload.items, products);
  const totalPrice = detailedItems.reduce((sum, item) => sum + item.lineTotal, 0);

  assertOrderLinesHaveStock(detailedItems);

  const estimatedDeliveryDate =
    payload.form.deliveryMethod === 'courier'
      ? addDays(new Date(), 1)
      : addDays(new Date(), 2);

  const recipientName =
    `${payload.form.recipient.firstName} ${payload.form.recipient.lastName}`.trim();

  const ownerUserId = authStore.getState().user?.id;

  const order: Order = {
    id: generateOrderId(),
    status: 'created',
    items: detailedItems,
    totalPrice,
    deliveryMethod: payload.form.deliveryMethod,
    paymentMethod: payload.form.paymentMethod,
    estimatedDeliveryDate,
    createdAt: new Date().toISOString(),
    canBeCancelled: true,
    ownerUserId,
    recipientEmail: payload.form.recipient.email.trim().toLowerCase(),
    recipientName: recipientName || undefined,
  };

  const existingOrders = readStoredOrders();
  writeStoredOrders([order, ...existingOrders]);

  if (payload.form.paymentMethod === 'cash') {
    applyShopOrderStockDelta(order, 'subtract');
  }

  notifyShopOrderEvent({ order, event: 'created' });

  return order;
}

export async function mockGetOrderById(orderId: string): Promise<Order | null> {
  const orders = readStoredOrders();
  const order = orders.find((item) => item.id === orderId) ?? null;

  if (!order) {
    return null;
  }

  try {
    assertCurrentUserOwnsMockShopOrder(order);
  } catch {
    return null;
  }

  return order;
}

export async function mockPayShopOrder(
  orderId: string,
  paymentMethod: 'card' | 'sbp',
): Promise<Order> {
  const orders = readStoredOrders();
  const index = orders.findIndex((order) => order.id === orderId);

  if (index === -1) {
    throw new Error('Заказ не найден.');
  }

  const current = orders[index];

  assertCurrentUserOwnsMockShopOrder(current);

  if (current.status === 'cancelled') {
    throw new Error('Этот заказ отменён.');
  }

  if (current.status === 'paid') {
    throw new Error('Заказ уже оплачен.');
  }

  if (current.paymentMethod === 'cash') {
    throw new Error('Для этого заказа предусмотрена оплата при получении.');
  }

  assertOrderLinesHaveStock(current.items);

  const updated: Order = {
    ...current,
    status: 'paid',
    paymentMethod,
  };

  orders[index] = updated;
  writeStoredOrders(orders);

  applyShopOrderStockDelta(updated, 'subtract');

  notifyShopOrderEvent({ order: updated, event: 'paid' });

  return updated;
}

export async function mockCancelOrder(orderId: string): Promise<Order> {
  const orders = readStoredOrders();
  const index = orders.findIndex((order) => order.id === orderId);

  if (index === -1) {
    throw new Error('Заказ не найден.');
  }

  const current = orders[index];

  assertCurrentUserOwnsMockShopOrder(current);

  if (!current.canBeCancelled) {
    throw new Error('Этот заказ уже нельзя отменить.');
  }

  if (current.status !== 'created' && current.status !== 'paid') {
    throw new Error('Этот заказ уже нельзя отменить.');
  }

  if (current.status === 'paid') {
    applyShopOrderStockDelta(current, 'add');
  } else if (current.status === 'created' && current.paymentMethod === 'cash') {
    applyShopOrderStockDelta(current, 'add');
  }

  const updated: Order = {
    ...current,
    status: 'cancelled',
    canBeCancelled: false,
  };

  orders[index] = updated;
  writeStoredOrders(orders);

  notifyShopOrderEvent({ order: updated, event: 'cancelled' });

  return updated;
}
