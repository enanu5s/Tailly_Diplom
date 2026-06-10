// src/shared/mock-db/seed/specialists.seed.ts

import { buildRollingDemoCalendar } from '@/features/specialist-profile/data/buildRollingDemoCalendar';
import type { SpecialistProfileResponse, SpecialistReview } from '@/features/specialist-profile/model/types';
import type { ManagedSpecialistMockAccount } from '@/shared/lib/mock/specialistAccountsStorage';

import {
  DEMO_SPECIALIST_PASSWORD,
  SPECIALIST_ACCOUNT_META,
} from './accounts.seed';
import { buildSpecialistServices } from './services.seed';

const ABOUT_SNIPPETS = [
  'Работаю с собаками и кошками, аккуратный подход к кормлению и прогулкам.',
  'Опыт передержки и выгула, фотоотчёты каждый день.',
  'Спокойно нахожу контакт с тревожными питомцами.',
  'Могу дать лекарства по расписанию владельца.',
  'Принимаю мелких животных и средних собак.',
];

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function buildGallery(specialistIndex: number) {
  const pad = pad2(specialistIndex);

  return [
    {
      id: `sp-${pad}-g1`,
      imageUrl: `/images/specialists/gallery/sp-${pad}-g1.jpg`,
      alt: 'Фото специалиста',
    },
    {
      id: `sp-${pad}-g2`,
      imageUrl: `/images/specialists/gallery/sp-${pad}-g2.jpg`,
      alt: 'Работа с питомцем',
    },
  ];
}

function buildPetGallery(specialistIndex: number) {
  const pad = pad2(specialistIndex);

  return [
    {
      id: `sp-${pad}-work-1`,
      imageUrl: `/images/specialists/work/sp-${pad}-work-1.jpg`,
      alt: 'Питомец клиента',
    },
  ];
}

function buildReviewsForSpecialist(specialistIndex: number): SpecialistReview[] {
  if (specialistIndex > 3) {
    return [];
  }

  const pad = pad2(specialistIndex);

  return [
    {
      id: `review-sp-${pad}-1`,
      orderId: `service-order-completed-client-${specialistIndex}-1`,
      serviceTitle: 'Передержка',
      authorName: 'Елена Смирнова',
      petName: 'Марта',
      rating: 5,
      createdAt: '2026-02-19',
      text:
        'Очень тёплый и бережный подход: питомец быстро привык к новому месту, каждый день приходили фото и короткий отчёт о кормлении и настроении. Рекомендуем и сами обратимся снова.',
      photos: [`/images/home-reviews/hr-${pad}.jpg`],
      specialistReply:
        specialistIndex === 1
          ? { text: 'Спасибо большое за доверие!', createdAt: '2026-02-19' }
          : undefined,
    },
    {
      id: `review-sp-${pad}-2`,
      orderId: `service-order-completed-client-${specialistIndex}-2`,
      serviceTitle: 'Выгул',
      authorName: 'Алексей Козлов',
      petName: 'Барсик',
      rating: 5,
      createdAt: '2026-02-10',
      text:
        'Всё чётко по нашим рекомендациям: специалист приходил вовремя, соблюдал маршрут и темп прогулки, всегда был на связи и прислал фото после выгула.',
      photos: [`/images/home-reviews/hr-${pad}-2.jpg`],
    },
  ];
}

export function buildSeedSpecialistProfiles(): SpecialistProfileResponse[] {
  return SPECIALIST_ACCOUNT_META.map((meta, i) => {
    const index = i + 1;
    const years = 2 + (index % 7);
    const reviews = buildReviewsForSpecialist(index);
    const pad = pad2(index);

    return {
      id: meta.id,
      slug: meta.slug,
      main: {
        avatarUrl: `/images/specialists/avatars/sp-${pad}.jpg`,
        firstName: meta.firstName,
        lastName: meta.lastName,
        middleName: meta.middleName,
        city: meta.city,
        district: meta.district,
        phone: meta.phone,
        email: meta.email,
      },
      stats: {
        experienceYears: years,
        rating: reviews.length > 0 ? 5 : 4.8,
        reviewsCount: reviews.length,
        completedOrdersCount: Math.max(reviews.length + 3, reviews.length),
        repeatOrdersCount: index % 4,
      },
      calendar: buildRollingDemoCalendar(index),
      specialistGallery: buildGallery(index),
      petGallery: buildPetGallery(index),
      details: {
        experienceLabel: `${years} ${years === 1 ? 'год' : years < 5 ? 'года' : 'лет'} опыта`,
        experienceDurationValue: years,
        experienceDurationUnit: 'years',
        housingType: index % 2 === 0 ? 'apartment' : 'house',
        petSizes: ['up_to_2kg', '2_5kg', '5_10kg', '10_20kg'],
        petAges: ['baby', 'young', 'adult', 'senior'],
        hasChildrenUnderTen: index % 3 === 0 ? 'yes' : 'no',
        petTypes: ['cat', 'dog', 'rodent', 'rabbit', 'bird'],
        advantages: [
          { id: `adv-${pad}-1`, title: 'Ежедневные фотоотчёты' },
          { id: `adv-${pad}-2`, title: 'Опыт с тревожными питомцами' },
        ],
        about: ABOUT_SNIPPETS[i % ABOUT_SNIPPETS.length]!,
      },
      services: buildSpecialistServices(index),
      reviews,
    };
  });
}

export function buildSeedManagedSpecialists(): ManagedSpecialistMockAccount[] {
  const base = '2026-02-01T10:00:00.000Z';

  return SPECIALIST_ACCOUNT_META.map((meta) => ({
    id: meta.id,
    email: meta.email,
    password: DEMO_SPECIALIST_PASSWORD,
    role: 'specialist',
    firstName: meta.firstName,
    lastName: meta.lastName,
    middleName: meta.middleName,
    phone: meta.phone,
    city: meta.city,
    about: ABOUT_SNIPPETS[SPECIALIST_ACCOUNT_META.indexOf(meta) % ABOUT_SNIPPETS.length]!,
    specialistId: meta.id,
    specialistSlug: meta.slug,
    applicationId: undefined,
    createdAt: base,
    createdBy: 'system',
    isBlocked: false,
    blockReason: undefined,
    blockedUntil: undefined,
    isPermanentBlock: false,
  }));
}

export const SEED_SPECIALIST_PROFILES = buildSeedSpecialistProfiles();
export const SEED_MANAGED_SPECIALISTS = buildSeedManagedSpecialists();
