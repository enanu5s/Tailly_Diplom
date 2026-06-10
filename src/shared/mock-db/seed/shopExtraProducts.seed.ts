// src/shared/mock-db/seed/shopExtraProducts.seed.ts — товары product-6 … product-24

import type { Product } from '@/features/shop/model/types';

import { createProduct } from './shop.seed';

const EXTRA_TITLES = [
  'Поводок нейлоновый 2 м',
  'Когтеточка напольная',
  'Пелёнки впитывающие 60×60',
  'Фильтр для поилки',
  'Колесо для грызунов',
  'Корм для птиц премиум',
  'Шампунь гипоаллергенный',
  'Переноска мягкая M',
  'Сено для кроликов',
  'Игрушка-канат для собак',
  'Паста для чистки зубов',
  'Лоток закрытый XL',
  'Миска керамическая',
  'Намордник сетчатый',
  'Пакет для корма 5 кг',
  'Плед для питомца',
  'Поилка автоматическая',
  'Щётка для вычёсывания',
  'Контейнер для корма',
];

const CATEGORY_ROTATION = [
  { id: '4', title: 'Аксессуары' },
  { id: '2', title: 'Игрушки' },
  { id: '3', title: 'Уход' },
  { id: '1', title: 'Корм' },
  { id: '5', title: 'Здоровье' },
] as const;

export function buildExtraShopProducts(): Product[] {
  return EXTRA_TITLES.map((title, i) => {
    const num = i + 6;
    const pad = String(num).padStart(2, '0');
    const cat = CATEGORY_ROTATION[i % CATEGORY_ROTATION.length]!;

    return createProduct({
      id: `product-${num}`,
      slug: `demo-product-${num}`,
      title,
      categoryId: cat.id,
      categoryTitle: cat.title,
      shortDescription: `${title} — демо-товар каталога Тейлли.`,
      description: `${title}. Качественный товар для домашних питомцев с подробным описанием характеристик и рекомендациями по применению.`,
      price: 390 + num * 85,
      oldPrice: num % 3 === 0 ? 390 + num * 110 : null,
      isAvailable: num % 7 !== 0,
      stockQuantity: num % 7 === 0 ? 0 : 8 + (num % 20),
      images: [
        {
          id: `product-${num}-img-1`,
          url: `/images/shop/products/product-${pad}.jpg`,
          alt: title,
        },
      ],
      reviews:
        num % 2 === 0
          ? [
              {
                id: `review-product-${num}-1`,
                authorName: 'Покупатель',
                rating: 5 as const,
                text: 'Товар полностью соответствует описанию, доставка быстрая.',
                createdAt: `2026-03-${String(10 + (num % 15)).padStart(2, '0')}T10:00:00.000Z`,
              },
            ]
          : [],
      createdAt: `2026-02-${String(5 + (num % 20)).padStart(2, '0')}T12:00:00.000Z`,
      updatedAt: '2026-03-15T09:00:00.000Z',
    });
  });
}

export const SEED_SHOP_PRODUCTS_ALL = (): Product[] => {
  // lazy import avoided — merged in buildInitialSnapshot
  return buildExtraShopProducts();
};
