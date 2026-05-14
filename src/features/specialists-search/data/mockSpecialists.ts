// src/features/specialists-search/data/mockSpecialists.ts

import { MOCK_SPECIALIST_PROFILES } from '@/features/specialist-profile/data/mockSpecialistProfiles';
import { computeSpecialistStats } from '@/features/specialist-profile/lib/computeSpecialistStats';
import {
  buildDemoSpecialistSpecs,
  getDemoSpecialistDisplayNameForProfileId,
} from '@/shared/mock-db/seed/demoDataset.seed';

import {
  buildSpecialistCalendarSlots,
  calendarSlotsFromSpecialistCalendar,
} from './mockSpecialistCalendar';

import type { SpecialistProfileResponse } from '@/features/specialist-profile/model/types';
import type { PetAgeCategory, PetSizeCategory, Specialist } from '../model/types';

const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  Москва: { lat: 55.7558, lon: 37.6173 },
  'Санкт-Петербург': { lat: 59.9343, lon: 30.3351 },
  Казань: { lat: 55.7887, lon: 49.1221 },
  'Нижний Новгород': { lat: 56.2965, lon: 43.9361 },
  Екатеринбург: { lat: 56.8389, lon: 60.6057 },
  Краснодар: { lat: 45.0355, lon: 38.9753 },
};

/** Дни приёма для мока: от расписания зависит попадание в выбранный пользователем диапазон дат */
function availabilityWeekdaysForIndex(index: number): number[] {
  const base = [1, 2, 3, 4, 5];
  if (index <= 0) {
    return base;
  }
  const rotated = base.filter((_, i) => (i + index) % 2 === 0);
  const withWeekend =
    index % 4 === 0 ? [...rotated, 0, 6] : index % 3 === 0 ? [...rotated, 6] : rotated;
  return withWeekend.length > 0 ? withWeekend : [1, 3, 5];
}

/**
 * Разнообразные наборы услуг: цены, длительность, типы питомцев.
 * Индекс берётся по модулю при сборке синтетических специалистов.
 */
const SERVICE_SETS: Specialist['services'][] = [
  [
    {
      serviceId: 'walking',
      petTypes: ['dog'],
      priceFrom: 1200,
      priceTo: 1800,
      durationMinutes: 60,
      note: 'Выгул',
    },
    {
      serviceId: 'boarding',
      petTypes: ['cat', 'dog'],
      priceFrom: 2500,
      priceTo: 4200,
      durationMinutes: 1440,
      note: 'Передержка',
    },
  ],
  [
    {
      serviceId: 'walking',
      petTypes: ['dog'],
      priceFrom: 1000,
      durationMinutes: 45,
    },
    {
      serviceId: 'boarding',
      petTypes: ['cat', 'dog', 'bird'],
      priceFrom: 1800,
      priceTo: 3500,
      durationMinutes: 720,
    },
  ],
  [
    {
      serviceId: 'boarding',
      petTypes: ['cat', 'dog'],
      priceFrom: 1500,
      durationMinutes: 1080,
    },
  ],
  [
    {
      serviceId: 'walking',
      petTypes: ['dog'],
      priceFrom: 1100,
      priceTo: 1500,
      durationMinutes: 90,
    },
    {
      serviceId: 'boarding',
      petTypes: ['cat', 'dog'],
      priceFrom: 1700,
      durationMinutes: 720,
    },
  ],
  [
    {
      serviceId: 'grooming',
      petTypes: ['dog', 'cat'],
      priceFrom: 1900,
      priceTo: 4500,
      durationMinutes: 120,
      note: 'Груминг',
    },
    {
      serviceId: 'walking',
      petTypes: ['dog'],
      priceFrom: 950,
      durationMinutes: 60,
    },
  ],
  [
    {
      serviceId: 'training',
      petTypes: ['dog'],
      priceFrom: 1600,
      durationMinutes: 60,
      note: 'Тренировки',
    },
    {
      serviceId: 'boarding',
      petTypes: ['dog'],
      priceFrom: 2200,
      durationMinutes: 1440,
    },
  ],
  [
    {
      serviceId: 'photoshoot',
      petTypes: ['dog', 'cat'],
      priceFrom: 3500,
      priceTo: 8000,
      durationMinutes: 120,
      note: 'Фотосессия',
    },
    {
      serviceId: 'grooming',
      petTypes: ['dog', 'cat'],
      priceFrom: 2100,
      durationMinutes: 90,
    },
  ],
  [
    {
      serviceId: 'walking',
      petTypes: ['dog'],
      priceFrom: 800,
      durationMinutes: 30,
      note: 'Выгул',
    },
    {
      serviceId: 'training',
      petTypes: ['dog', 'cat'],
      priceFrom: 1400,
      durationMinutes: 45,
    },
    {
      serviceId: 'boarding',
      petTypes: ['cat', 'dog', 'bird'],
      priceFrom: 2000,
      durationMinutes: 720,
    },
  ],
];

const PET_SIZE_SETS: PetSizeCategory[][] = [
  ['under_2', '2_to_8', '8_15'],
  ['8_15', '15_25'],
  ['15_25', 'over_25'],
  ['under_2', '2_to_8', '8_15', '15_25'],
  ['8_15'],
  ['over_25'],
  ['2_to_8', 'over_25'],
  ['8_15', '15_25', 'over_25'],
];

const PET_AGE_SETS: PetAgeCategory[][] = [
  ['under_6mo', '6mo_to_2', '2_to_5'],
  ['2_to_5', 'over_5'],
  ['6mo_to_2'],
  ['over_5'],
  ['2_to_5'],
  ['under_6mo', '6mo_to_2'],
  ['under_6mo', '6mo_to_2', '2_to_5', 'over_5'],
  ['2_to_5', 'over_5'],
];

function buildMockSpecialists(): Specialist[] {
  const profiles = MOCK_SPECIALIST_PROFILES;

  const primaryProfile = profiles[0];
  const primary: Specialist = {
    id: 'specialist-1',
    name: getDemoSpecialistDisplayNameForProfileId('specialist-1'),
    avatarUrl: '/images/mock/specialists/sp3.jpg',
    city: 'Москва',
    district: 'Пресненский район',
    description:
      'Передержка и выгул: забота о привычках питомца, внимание к деталям и регулярная связь.',
    rating: 5,
    reviewsCount: 18,
    location: { lat: 55.7572, lon: 37.5598 },
    experienceYears: 5,
    petSizeCategories: ['under_2', '2_to_8', '8_15', '15_25'],
    petAgeCategories: ['6mo_to_2', '2_to_5', 'over_5'],
    availabilityWeekdays: availabilityWeekdaysForIndex(0),
    services: [
      {
        serviceId: 'boarding',
        petTypes: ['cat', 'dog'],
        priceFrom: 1500,
        priceTo: 3800,
        durationMinutes: 720,
        note: 'Передержка',
      },
      {
        serviceId: 'walking',
        petTypes: ['dog'],
        priceFrom: 900,
        priceTo: 1300,
        durationMinutes: 60,
      },
      {
        serviceId: 'grooming',
        petTypes: ['cat', 'dog'],
        priceFrom: 2200,
        durationMinutes: 90,
      },
    ],
    calendarSlots: calendarSlotsFromSpecialistCalendar(
      primaryProfile.calendar,
      primaryProfile.services,
    ),
  };

  const specs = buildDemoSpecialistSpecs();

  const synthetic: Specialist[] = specs.map((s) => {
    const loc = CITY_COORDS[s.city] ?? CITY_COORDS['Москва'];
    const jitter = s.index * 0.012;
    const services = SERVICE_SETS[s.index % SERVICE_SETS.length] ?? SERVICE_SETS[0];
    const profile = profiles[s.index - 1];
    const slots =
      profile?.calendar && profile.services
        ? calendarSlotsFromSpecialistCalendar(profile.calendar, profile.services)
        : buildSpecialistCalendarSlots(s.index);

    return {
      id: `specialist-${s.index}`,
      name: getDemoSpecialistDisplayNameForProfileId(`specialist-${s.index}`),
      avatarUrl: s.index % 3 === 0 ? '/images/mock/specialists/sp1.jpg' : null,
      city: s.city,
      district: s.city === 'Москва' ? 'В пределах МКАД' : '',
      description: s.about,
      rating: Math.min(5, 4.3 + (s.index % 7) * 0.1),
      reviewsCount: 4 + s.index * 2,
      experienceYears: 2 + (s.index % 6),
      location: { lat: loc.lat + jitter, lon: loc.lon + jitter },
      petSizeCategories: PET_SIZE_SETS[s.index % PET_SIZE_SETS.length],
      petAgeCategories: PET_AGE_SETS[s.index % PET_AGE_SETS.length],
      availabilityWeekdays: availabilityWeekdaysForIndex(s.index),
      services,
      calendarSlots: slots,
    };
  });

  return [primary, ...synthetic];
}

export const MOCK_SPECIALISTS: Specialist[] = buildMockSpecialists();

/** После сохранения календаря в `MOCK_SPECIALIST_PROFILES` — обновить слоты в списке поиска. */
export function syncMockSpecialistCalendarSlotsFromProfile(
  profile: SpecialistProfileResponse,
): void {
  const idx = MOCK_SPECIALISTS.findIndex((s) => s.id === profile.id);

  if (idx === -1) {
    return;
  }

  MOCK_SPECIALISTS[idx].calendarSlots = calendarSlotsFromSpecialistCalendar(
    profile.calendar,
    profile.services,
  );
}

/** Рейтинг и число отзывов в поиске — как у профиля после пересчёта по заказам. */
export function syncMockSpecialistListingStatsFromProfile(
  profile: SpecialistProfileResponse,
): void {
  const idx = MOCK_SPECIALISTS.findIndex((s) => s.id === profile.id);

  if (idx === -1) {
    return;
  }

  MOCK_SPECIALISTS[idx].rating = profile.stats.rating;
  MOCK_SPECIALISTS[idx].reviewsCount = profile.stats.reviewsCount;
}

/** После загрузки мок-БД: цифры в списке поиска совпадают с заказами и отзывами. */
export function refreshAllMockSpecialistListingStatsFromOrders(): void {
  for (const p of MOCK_SPECIALIST_PROFILES) {
    syncMockSpecialistListingStatsFromProfile({
      ...p,
      stats: computeSpecialistStats({
        id: p.id,
        slug: p.slug,
        experienceYears: p.stats.experienceYears,
        reviews: p.reviews,
      }),
    });
  }
}

export function cloneSpecialists(): Specialist[] {
  return JSON.parse(JSON.stringify(MOCK_SPECIALISTS)) as Specialist[];
}
