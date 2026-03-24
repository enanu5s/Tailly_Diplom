// src/features/orders/data/mockProductOrdersAdapter.ts

import { readStoredOrders } from '@/features/shop/data/mockShopOrders';

import type { ProductOrder } from '../model/types';

export function readProductOrdersFromShop(): ProductOrder[] {
  const shopOrders = readStoredOrders();

  return shopOrders.map((order): ProductOrder => {
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
      cancelReason:
        order.status === 'cancelled' ? 'Отменено пользователем' : undefined,
      canceledAt:
        order.status === 'cancelled' ? order.createdAt : undefined,
      lifecycle: [
        {
          status: mapStatus(order.status),
          changedAt: order.createdAt,
          comment:
            order.status === 'cancelled'
              ? 'Пользователь отменил заказ'
              : undefined,
        },
      ],
    };
  });
}

function mapStatus(status: string): ProductOrder['status'] {
  if (status === 'created') return 'created';
  if (status === 'paid') return 'paid';
  if (status === 'delivering') return 'shipped';
  if (status === 'completed') return 'delivered';
  if (status === 'cancelled') return 'canceled';

  return 'created';
}