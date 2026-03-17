// src/features/orders/data/mockOrders.ts

import type { ProductOrder, ServiceOrder } from '../model/types';

export let MOCK_SERVICE_ORDERS: ServiceOrder[] = [
  {
    id: 'so-1',
    dateFrom: '2026-02-28T10:00:00.000Z',
    dateTo: '2026-02-28T12:00:00.000Z',
    petId: 'p-1',
    petName: 'Ричи',
    sitterId: 's-1',
    sitterName: 'Анна Соколова',
    status: 'upcoming',
    price: 1600,
    currency: 'RUB',
    rating: undefined,
    hasReview: false,
    serviceTitle: 'Выгул собаки',
  },
  {
    id: 'so-2',
    dateFrom: '2026-02-05T09:00:00.000Z',
    dateTo: '2026-02-05T10:00:00.000Z',
    petId: 'p-1',
    petName: 'Ричи',
    sitterId: 's-2',
    sitterName: 'Илья Кузнецов',
    status: 'completed',
    price: 900,
    currency: 'RUB',
    rating: 5,
    hasReview: true,
    serviceTitle: 'Выгул собаки',
  },
  {
    id: 'so-3',
    dateFrom: '2026-01-20T18:00:00.000Z',
    petId: 'p-1',
    petName: 'Ричи',
    sitterId: 's-3',
    sitterName: 'Марина Белова',
    status: 'canceled',
    price: 1200,
    currency: 'RUB',
    rating: undefined,
    hasReview: false,
    serviceTitle: 'Выгул собаки',
  },
];

export const MOCK_PRODUCT_ORDERS: ProductOrder[] = [
  {
    id: 'po-1',
    number: '№ 10239',
    status: 'delivered',
    createdAt: '2026-02-12T12:00:00.000Z',
    price: 2490,
    currency: 'RUB',
    itemsCount: 5,
    productThumbs: [
      '/images/product-1.png',
      '/images/product-2.png',
      '/images/product-3.png',
      '/images/product-4.png',
      '/images/product-5.png',
    ],
  },
  {
    id: 'po-2',
    number: '№ 10218',
    status: 'shipped',
    createdAt: '2026-02-08T10:00:00.000Z',
    price: 990,
    currency: 'RUB',
    itemsCount: 2,
    productThumbs: ['/images/product-2.png', '/images/product-6.png'],
  },
];