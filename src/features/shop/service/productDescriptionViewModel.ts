// src/features/shop/service/productDescriptionViewModel.ts

import type { Product, ProductDescriptionContent } from '../model/types';

export type ProductDescriptionSection = {
  title: string;
  items?: string[];
  text?: string;
};

export type ProductDescriptionViewModel = {
  summary: string;
  availabilityLabel: string;
  sections: ProductDescriptionSection[];
};

function normalizeItems(items?: string[]): string[] {
  if (!items) {
    return [];
  }

  return items
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildSectionsFromStructuredContent(
  content: ProductDescriptionContent,
): ProductDescriptionSection[] {
  const suitableFor = normalizeItems(content.suitableFor);
  const benefits = normalizeItems(content.benefits);
  const features = normalizeItems(content.features);

  const sections: ProductDescriptionSection[] = [];

  if (suitableFor.length > 0) {
    sections.push({
      title: 'Подходит для',
      items: suitableFor,
    });
  }

  if (benefits.length > 0) {
    sections.push({
      title: 'Преимущества',
      items: benefits,
    });
  }

  if (features.length > 0) {
    sections.push({
      title: 'Особенности',
      items: features,
    });
  }

  if (content.composition?.trim()) {
    sections.push({
      title: 'Состав и особенности',
      text: content.composition.trim(),
    });
  }

  if (content.usage?.trim()) {
    sections.push({
      title: 'Как использовать',
      text: content.usage.trim(),
    });
  }

  return sections;
}

function buildFallbackSections(product: Product): ProductDescriptionSection[] {
  switch (product.categoryTitle) {
    case 'Корм':
      return [
        {
          title: 'Преимущества',
          items: [
            'Подходит для ежедневного кормления',
            'Сбалансирован по основным питательным веществам',
            'Удобен для включения в постоянный рацион',
          ],
        },
        {
          title: 'Состав и особенности',
          text: product.description,
        },
      ];

    case 'Игрушки':
      return [
        {
          title: 'Преимущества',
          items: [
            'Подходит для активных игр дома и на улице',
            'Помогает разнообразить досуг питомца',
            'Способствует поддержанию активности',
          ],
        },
        {
          title: 'Особенности',
          text: product.description,
        },
      ];

    case 'Уход':
      return [
        {
          title: 'Преимущества',
          items: [
            'Удобен для ежедневного использования',
            'Помогает поддерживать чистоту и комфорт',
            'Подходит для регулярного ухода',
          ],
        },
        {
          title: 'Особенности',
          text: product.description,
        },
      ];

    case 'Аксессуары':
      return [
        {
          title: 'Преимущества',
          items: [
            'Подходит для повседневного использования',
            'Удобен в уходе и эксплуатации',
            'Помогает сделать быт питомца комфортнее',
          ],
        },
        {
          title: 'Особенности',
          text: product.description,
        },
      ];

    case 'Здоровье':
      return [
        {
          title: 'Преимущества',
          items: [
            'Подходит для поддержки общего состояния питомца',
            'Удобен для курсового применения',
            'Может использоваться как часть регулярного ухода',
          ],
        },
        {
          title: 'Особенности',
          text: product.description,
        },
      ];

    default:
      return [
        {
          title: 'Особенности',
          text: product.description,
        },
      ];
  }
}

export function buildProductDescriptionViewModel(
  product: Product,
): ProductDescriptionViewModel {
  const structuredContent = product.descriptionContent;
  const summary =
    structuredContent?.summary?.trim() ||
    product.shortDescription.trim() ||
    product.description.trim();

  const availabilityLabel = product.isAvailable ? 'В наличии' : 'Нет в наличии';

  const sections =
    structuredContent
      ? buildSectionsFromStructuredContent(structuredContent)
      : buildFallbackSections(product);

  const safeSections =
    sections.length > 0
      ? sections
      : [
          {
            title: 'Особенности',
            text: product.description,
          },
        ];

  return {
    summary,
    availabilityLabel,
    sections: [
      ...safeSections,
      {
        title: 'Наличие',
        text: availabilityLabel,
      },
    ],
  };
}