// src/shared/mock-db/seed/shopOrders.seed.ts

import type { ProductOrder } from '@/features/orders/model/types';

const STATUSES: ProductOrder['status'][] = ['created', 'paid', 'shipped', 'delivered', 'canceled'];

export function buildSeedProductOrders(): ProductOrder[] {
  const rows: ProductOrder[] = [];

  for (let clientNum = 1; clientNum <= 6; clientNum += 1) {
    const count = 3 + (clientNum % 4);

    for (let j = 0; j < count; j += 1) {
      const i = clientNum * 10 + j;
      const status = STATUSES[(i + j) % STATUSES.length]!;
      const day = String(1 + (i % 27)).padStart(2, '0');

      rows.push({
        id: `product-order-c${clientNum}-${j + 1}`,
        number: `№ T-${1000 + i}`,
        status,
        createdAt: `2026-02-${day}T10:15:00.000Z`,
        price: 890 + i * 150,
        currency: 'RUB',
        itemsCount: 1 + (j % 3),
        ownerUserId: `client-${clientNum}`,
        productThumbs: ['/images/shop/products/product-01.jpg'],
        items: [
          {
            productId: j % 2 === 0 ? 'product-1' : 'product-2',
            title: j % 2 === 0 ? 'Лежанка для кошки' : 'Игрушка-мышка',
            quantity: 1 + (j % 2),
            price: 590 + i * 40,
            imageUrl: '/images/shop/products/product-01.jpg',
          },
        ],
      });
    }
  }

  rows.push({
    id: 'product-order-client8-1',
    number: '№ T-2008',
    status: 'paid',
    createdAt: '2026-03-10T12:00:00.000Z',
    price: 1590,
    currency: 'RUB',
    itemsCount: 1,
    ownerUserId: 'client-8',
    productThumbs: ['/images/shop/products/product-02.jpg'],
    items: [
      {
        productId: 'product-2',
        title: 'Игрушка-мышка',
        quantity: 1,
        price: 1590,
        imageUrl: '/images/shop/products/product-02.jpg',
      },
    ],
  });

  return rows;
}
