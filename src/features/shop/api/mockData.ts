// src/features/shop/api/mockData.ts
import type { Product, ProductCategory } from '../model/types';

export const SHOP_CATEGORIES_MOCK: ProductCategory[] = [
  {
    id: '1',
    slug: 'food',
    title: 'Корм',
  },
  {
    id: '2',
    slug: 'toys',
    title: 'Игрушки',
  },
  {
    id: '3',
    slug: 'care',
    title: 'Уход',
  },
  {
    id: '4',
    slug: 'accessories',
    title: 'Аксессуары',
  },
  {
    id: '5',
    slug: 'medicine',
    title: 'Здоровье',
  },
];

export const SHOP_PRODUCTS_MOCK: Product[] = [
  {
    id: 'product-1',
    slug: 'cat-food-premium-salmon',
    title: 'Премиум-корм для кошек с лососем',
    categoryId: '1',
    categoryTitle: 'Корм',
    shortDescription: 'Сухой корм для взрослых кошек, 1.5 кг.',
    deliveryRange: {
      from: '2026-04-18T00:00:00.000Z',
      to: '2026-04-22T00:00:00.000Z',
    },
    description:
      'Сбалансированный корм для ежедневного питания взрослых кошек. Содержит белок, омега-3, витамины и полезные микроэлементы.',
    price: 1890,
    oldPrice: 2190,
    rating: 4.8,
    reviewsCount: 12,
    isAvailable: true,
    stockQuantity: 18,
    images: [
      {
        id: 'product-1-image-1',
        url: '/images/shop/1.jpg',
        alt: 'Премиум-корм для кошек с лососем',
      },
      {
        id: 'product-1-image-2',
        url: '/images/shop/1.jpg',
        alt: 'Упаковка корма для кошек',
      },
    ],
    reviews: [
      {
        id: 'review-1',
        authorName: 'Анна',
        rating: 5,
        text: 'Кошке очень понравился корм, ест с удовольствием.',
        createdAt: '2026-03-01T10:00:00.000Z',
      },
    ],
    createdAt: '2026-02-10T12:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'product-2',
    slug: 'dog-toy-rope-ball',
    title: 'Игрушка для собак: канат с мячом',
    categoryId: '2',
    categoryTitle: 'Игрушки',
    shortDescription: 'Прочная игрушка для активных игр.',
    deliveryRange: {
      from: '2026-04-19T00:00:00.000Z',
      to: '2026-04-23T00:00:00.000Z',
    },
    description:
      'Подходит для игр дома и на улице. Помогает снизить тревожность, поддерживать активность и отвлекать питомца.',
    price: 790,
    oldPrice: null,
    rating: 4.6,
    reviewsCount: 8,
    isAvailable: true,
    stockQuantity: 34,
    images: [
      {
        id: 'product-2-image-1',
        url: '/images/shop/2.jpg',
        alt: 'Игрушка для собак: канат с мячом',
      },
    ],
    reviews: [],
    createdAt: '2026-02-15T09:00:00.000Z',
    updatedAt: '2026-02-28T11:00:00.000Z',
  },
  {
    id: 'product-3',
    slug: 'pet-bowl-ceramic',
    title: 'Керамическая миска для питомца',
    categoryId: '3',
    categoryTitle: 'Аксессуары',
    shortDescription: 'Устойчивая миска для воды и корма.',
    deliveryRange: {
      from: '2026-04-20T00:00:00.000Z',
      to: '2026-04-24T00:00:00.000Z',
    },
    description:
      'Керамическая миска с нескользящим основанием. Подходит для воды, влажного и сухого корма.',
    price: 990,
    oldPrice: 1190,
    rating: 4.7,
    reviewsCount: 5,
    isAvailable: true,
    stockQuantity: 11,
    images: [
      {
        id: 'product-3-image-1',
        url: '/images/shop/product-bowl-1.jpg',
        alt: 'Керамическая миска для питомца',
      },
    ],
    reviews: [],
    createdAt: '2026-02-18T08:00:00.000Z',
    updatedAt: '2026-02-27T12:00:00.000Z',
  },
  {
    id: 'product-4',
    slug: 'pet-shampoo-sensitive',
    title: 'Шампунь для чувствительной кожи',
    categoryId: '5',
    categoryTitle: 'Уход',
    shortDescription: 'Мягкий шампунь для собак и кошек.',
    deliveryRange: {
      from: '2026-04-21T00:00:00.000Z',
      to: '2026-04-25T00:00:00.000Z',
    },
    description:
      'Подходит для деликатного ухода за шерстью и кожей питомца. Без агрессивных ПАВ и сильной отдушки.',
    price: 650,
    oldPrice: null,
    rating: 4.4,
    reviewsCount: 3,
    isAvailable: false,
    stockQuantity: 0,
    images: [
      {
        id: 'product-4-image-1',
        url: '/images/shop/product-shampoo-1.jpg',
        alt: 'Шампунь для чувствительной кожи',
      },
    ],
    reviews: [],
    createdAt: '2026-02-20T10:20:00.000Z',
    updatedAt: '2026-02-28T10:20:00.000Z',
  },
];
