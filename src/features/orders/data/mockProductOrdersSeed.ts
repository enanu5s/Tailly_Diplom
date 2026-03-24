// src/features/orders/data/mockProductOrdersSeed.ts

import type { ProductOrder } from '../model/types';

const SYNTH_STATUSES: ProductOrder['status'][] = [
  'created',
  'paid',
  'shipped',
  'delivered',
  'canceled',
];

function buildSyntheticProductOrders(): ProductOrder[] {
  const rows: ProductOrder[] = [];

  for (let i = 2; i <= 48; i += 1) {
    const status = SYNTH_STATUSES[(i - 2) % SYNTH_STATUSES.length];
    const day = String(1 + (i % 27)).padStart(2, '0');
    const hour = String(8 + (i % 10)).padStart(2, '0');

    const ownerNum = ((i - 2) % 20) + 1;

    rows.push({
      id: `product-order-${i}`,
      number: `№ T-${1000 + i}`,
      status,
      createdAt: `2026-02-${day}T${hour}:15:00.000Z`,
      price: 890 + i * 211,
      currency: 'RUB',
      itemsCount: 1 + (i % 4),
      ownerUserId: `client-${ownerNum}`,
      productThumbs: ['/images/shop/product-1.jpg', '/images/shop/product-2.jpg'],
      items: [
        {
          productId: i % 2 === 0 ? 'product-1' : 'product-demo-01',
          title: i % 2 === 0 ? 'Лежанка для кошки' : 'Поводок нейлоновый 2 м',
          quantity: 1 + (i % 2),
          price: 590 + i * 40,
          imageUrl: '/images/shop/product-1.jpg',
        },
      ],
    });
  }

  return rows;
}

export const MOCK_PRODUCT_ORDERS_SEED: ProductOrder[] = [
  {
    id: 'product-order-1',
    number: '№ T-1001',
    status: 'delivered',
    createdAt: '2026-03-15T10:00:00.000Z',
    price: 2590,
    currency: 'RUB',
    itemsCount: 2,
    ownerUserId: 'client-1',
    productThumbs: ['/images/shop/product-1.jpg', '/images/shop/product-2.jpg'],
    items: [
      {
        productId: 'product-1',
        title: 'Лежанка для кошки',
        quantity: 1,
        price: 1590,
        imageUrl: '/images/shop/product-1.jpg',
        variantId: 'gray-m',
        variantLabel: 'Серая, M',
      },
      {
        productId: 'product-2',
        title: 'Игрушка-мышка',
        quantity: 1,
        price: 1000,
        imageUrl: '/images/shop/product-2.jpg',
      },
    ],
  },
  ...buildSyntheticProductOrders(),
];
