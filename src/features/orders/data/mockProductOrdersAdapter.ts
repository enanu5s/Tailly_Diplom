// src/features/orders/data/mockProductOrdersAdapter.ts

import { authStore } from '@/features/auth/model/authStore';
import { readStoredOrders } from '@/features/shop/data/mockShopOrders';
import { canOrderShopProducts } from '@/shared/lib/auth/roleAccess';
import { cloneDeep } from '@/shared/mock-db/cloneDeep';
import { ensureMockDatabaseLoaded, unsafeMutableMockDb } from '@/shared/mock-db/store';

import type { ProductOrder } from '../model/types';

/** Заказы без owner (старые данные) в демо показываем только этому аккаунту */
const MOCK_UNSCOPED_ORDERS_FALLBACK_USER_ID = 'client-1';

export function getMockProductOrdersViewerId(): string | null {
  const user = authStore.getState().user;

  if (!canOrderShopProducts(user)) {
    return null;
  }

  return user?.id ?? null;
}

export function isMockProductOrderVisibleToViewer(
  order: ProductOrder,
  viewerId: string,
): boolean {
  if (order.ownerUserId === viewerId) {
    return true;
  }

  return (
    order.ownerUserId === undefined && viewerId === MOCK_UNSCOPED_ORDERS_FALLBACK_USER_ID
  );
}

export function filterMockProductOrdersForCurrentViewer(
  orders: ProductOrder[],
): ProductOrder[] {
  const viewerId = getMockProductOrdersViewerId();

  if (!viewerId) {
    return [];
  }

  return orders.filter((order) => isMockProductOrderVisibleToViewer(order, viewerId));
}

export function readProductOrdersFromShop(): ProductOrder[] {
  const shopOrders = readStoredOrders();

  const mapped = shopOrders.map((order): ProductOrder => {
    const expectedAt =
      typeof order.estimatedDeliveryDate === 'string' &&
      order.estimatedDeliveryDate.trim().length > 0
        ? order.estimatedDeliveryDate
        : undefined;

    return {
      id: order.id,
      number: `№ ${order.id}`,
      status: mapStatus(order.status),
      createdAt: order.createdAt,
      price: order.totalPrice,
      currency: 'RUB',
      itemsCount: order.items.length,
      ownerUserId: order.ownerUserId,
      productThumbs: order.items
        .map((item) => item.product.images[0]?.url ?? '')
        .filter((value): value is string => value.length > 0),
      items: order.items.map((item) => ({
        productId: item.product.id,
        title: item.product.title,
        quantity: item.quantity,
        price: item.product.price,
        imageUrl: item.product.images[0]?.url,
      })),
      recipient: undefined,
      delivery:
        order.deliveryMethod === 'courier'
          ? {
              method: 'courier',
              expectedAt,
            }
          : {
              method: 'pickup',
              pickupPointLabel: 'ПВЗ СДЭК',
              expectedAt,
            },
      payment: {
        method:
          order.paymentMethod === 'cash'
            ? 'cash_on_delivery'
            : order.paymentMethod === 'sbp'
              ? 'sbp'
              : 'card',
        status:
          order.status === 'paid'
            ? 'paid'
            : order.status === 'cancelled'
              ? 'refunded'
              : 'pending',
      },
      cancelReason: order.status === 'cancelled' ? 'Отменено пользователем' : undefined,
      canceledAt: order.status === 'cancelled' ? order.createdAt : undefined,
      lifecycle: [
        {
          status: mapStatus(order.status),
          changedAt: order.createdAt,
          comment:
            order.status === 'cancelled' ? 'Пользователь отменил заказ' : undefined,
        },
      ],
    };
  });

  if (mapped.length > 0) {
    return mapped;
  }

  ensureMockDatabaseLoaded();

  return cloneDeep(unsafeMutableMockDb().legacyProductOrders);
}

function mapStatus(status: string): ProductOrder['status'] {
  if (status === 'created') return 'created';
  if (status === 'paid') return 'paid';
  if (status === 'delivering') return 'shipped';
  if (status === 'completed') return 'delivered';
  if (status === 'cancelled') return 'canceled';

  return 'created';
}
