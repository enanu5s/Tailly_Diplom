// src/features/specialist-profile/data/mockSpecialistProfiles.ts

import {
  buildDemoSpecialistSpecs,
  specialistDemoSlug,
} from '@/shared/mock-db/seed/demoDataset.seed';

import type { SpecialistProfileResponse } from '../model/types';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const PRIMARY_SPECIALIST_PROFILE: SpecialistProfileResponse = {
    id: 'specialist-1',
    slug: 'maria-ivanova',
    main: {
      avatarUrl: '/images/specialists/maria-ivanova.jpg',
      firstName: 'Мария',
      lastName: 'Иванова',
      middleName: 'Сергеевна',
      city: 'Москва',
      district: 'Пресненский район',
      phone: '+7 (999) 123-45-67',
      email: 'specialist@tailly.ru',
    },
    stats: {
      experienceYears: 5,
      rating: 5,
      reviewsCount: 18,
      completedOrdersCount: 46,
      repeatOrdersCount: 14,
    },
    calendar: {
      timezone: 'Europe/Moscow',
      dayOverrides: [
        { date: '2026-03-25', status: 'day_off' },
        { date: '2026-03-28', status: 'fully_booked' },
      ],
      bookedSlots: [
        {
          id: 'booked-1',
          date: '2026-03-20',
          startTime: '10:00',
          endTime: '11:00',
          serviceIds: ['service-walk-1'],
          orderId: 'seed-booking-1',
          bufferAfterMinutes: 15,
        },
        {
          id: 'booked-2',
          date: '2026-03-20',
          startTime: '14:00',
          endTime: '15:30',
          serviceIds: ['service-photo-1'],
          orderId: 'seed-booking-2',
          bufferBeforeMinutes: 15,
          bufferAfterMinutes: 30,
        },
        {
          id: 'booked-3',
          date: '2026-03-22',
          startTime: '13:00',
          endTime: '23:59',
          serviceIds: ['service-boarding-1'],
          orderId: 'seed-booking-3',
        },
        {
          id: 'booked-4',
          date: '2026-03-23',
          startTime: '00:00',
          endTime: '11:00',
          serviceIds: ['service-boarding-1'],
          orderId: 'seed-booking-3',
        },
      ],
      availabilityWindows: [
        {
          id: 'window-1',
          date: '2026-03-20',
          startTime: '09:00',
          endTime: '21:00',
          serviceIds: ['service-walk-1', 'service-photo-1', 'service-visit-1'],
          comment: 'Основное дневное окно',
        },
        {
          id: 'window-2',
          date: '2026-03-21',
          startTime: '10:00',
          endTime: '19:00',
          serviceIds: ['service-walk-1', 'service-photo-1', 'service-visit-1'],
        },
        {
          id: 'window-3',
          date: '2026-03-22',
          startTime: '10:00',
          endTime: '20:00',
          serviceIds: ['service-boarding-1', 'service-consult-1'],
        },
      ],
      bookingSettings: {
        dayStartTime: '09:00',
        dayEndTime: '21:00',
        slotStepMinutes: 30,
        defaultDurationMinutes: 60,
      },
      availabilityRules: [
        {
          id: 'rule-walk-weekdays',
          title: 'Прогулки по будням',
          serviceIds: ['service-walk-1'],
          startDate: '2026-03-01',
          startTime: '09:00',
          endTime: '20:00',
          recurrence: {
            frequency: 'weekly',
            interval: 1,
            weekDays: [1, 2, 3, 4, 5],
          },
          isEnabled: true,
        },
        {
          id: 'rule-photo-weekend',
          title: 'Фотосессии по выходным',
          serviceIds: ['service-photo-1'],
          startDate: '2026-03-01',
          startTime: '11:00',
          endTime: '18:00',
          recurrence: {
            frequency: 'weekly',
            interval: 1,
            weekDays: [0, 6],
          },
          isEnabled: true,
        },
        {
          id: 'rule-boarding-daily',
          title: 'Передержка ежедневно',
          serviceIds: ['service-boarding-1'],
          startDate: '2026-03-01',
          startTime: '09:00',
          endTime: '21:00',
          recurrence: {
            frequency: 'daily',
            interval: 1,
          },
          isEnabled: true,
        },
      ],
      availabilityOverrides: [
        {
          id: 'override-1',
          targetDate: '2026-03-24',
          editScope: 'single',
          sourceRuleId: 'rule-walk-weekdays',
          startTime: '13:00',
          endTime: '19:00',
          serviceIds: ['service-walk-1'],
          comment: 'В этот день прогулки только после обеда',
        },
      ],
    },
    specialistGallery: [
      {
        id: 'specialist-gallery-1',
        imageUrl: '/images/specialists/maria-ivanova.jpg',
        alt: 'Мария Иванова дома с питомцем',
      },
      {
        id: 'specialist-gallery-2',
        imageUrl: '/images/specialists/pets/pet-4.jpg',
        alt: 'Мария Иванова на прогулке с собакой',
      },
    ],
    petGallery: [
      {
        id: 'gallery-1',
        imageUrl: '/images/specialists/pets/pet-1.jpg',
        alt: 'Питомец клиента во время передержки',
      },
      {
        id: 'gallery-2',
        imageUrl: '/images/specialists/pets/pet-2.jpg',
        alt: 'Кот клиента на передержке',
      },
      {
        id: 'gallery-3',
        imageUrl: '/images/specialists/pets/pet-3.jpg',
        alt: 'Кролик клиента во время ухода',
      },
      {
        id: 'gallery-4',
        imageUrl: '/images/specialists/pets/pet-4.jpg',
        alt: 'Собака клиента на прогулке',
      },
    ],
    details: {
      experienceLabel: '5 лет опыта ухода за животными',
      experienceDurationValue: 5,
      experienceDurationUnit: 'years',
      housingType: 'apartment',
      petSizes: ['small', 'medium', 'large'],
      petAges: ['baby', 'young', 'adult', 'senior'],
      hasChildrenUnderTen: 'no',
      petTypes: ['cat', 'dog', 'rodent', 'rabbit'],
      advantages: [
        { id: 'adv-1', title: 'Ежедневные фотоотчёты' },
        { id: 'adv-2', title: 'Опыт с тревожными питомцами' },
        { id: 'adv-3', title: 'Гибкий график записи' },
      ],
      about:
        'Люблю животных, умею находить подход к тревожным питомцам, строго соблюдаю рекомендации владельцев и всегда остаюсь на связи.',
    },
    services: [
      {
        id: 'service-walk-1',
        name: 'Прогулка с собакой',
        locationLabel: 'На улице рядом с домом клиента',
        price: 900,
        priceUnit: 'walk',
        bookingPolicy: {
          mode: 'fixed_slot',
          duration: {
            defaultDurationMinutes: 60,
            minDurationMinutes: 30,
            maxDurationMinutes: 90,
            durationStepMinutes: 30,
          },
          buffer: {
            hasBufferBefore: false,
            bufferBeforeMinutes: 0,
            hasBufferAfter: true,
            bufferAfterMinutes: 15,
          },
          compatibility: {
            canOverlapWithOtherServices: false,
            compatibleServiceIds: [],
          },
          advance: {
            minAdvanceMinutes: 120,
            maxAdvanceDays: 30,
          },
          allowsClientComment: true,
          requiresSpecialistConfirmation: true,
        },
      },
      {
        id: 'service-photo-1',
        name: 'Фотосессия питомца',
        locationLabel: 'На прогулке или дома у клиента',
        price: 2500,
        priceUnit: 'service',
        bookingPolicy: {
          mode: 'time_range',
          duration: {
            defaultDurationMinutes: 90,
            minDurationMinutes: 60,
            maxDurationMinutes: 180,
            durationStepMinutes: 30,
          },
          buffer: {
            hasBufferBefore: true,
            bufferBeforeMinutes: 15,
            hasBufferAfter: true,
            bufferAfterMinutes: 30,
          },
          compatibility: {
            canOverlapWithOtherServices: false,
            compatibleServiceIds: [],
          },
          advance: {
            minAdvanceMinutes: 1440,
            maxAdvanceDays: 45,
          },
          allowsClientComment: true,
          requiresSpecialistConfirmation: true,
        },
      },
      {
        id: 'service-boarding-1',
        name: 'Передержка у специалиста',
        locationLabel: 'У специалиста дома',
        price: 1200,
        priceUnit: 'day',
        bookingPolicy: {
          mode: 'multi_day_stay',
          duration: {
            defaultDurationMinutes: 0,
            minDurationMinutes: 0,
            maxDurationMinutes: 0,
            durationStepMinutes: 0,
          },
          buffer: {
            hasBufferBefore: false,
            bufferBeforeMinutes: 0,
            hasBufferAfter: false,
            bufferAfterMinutes: 0,
          },
          compatibility: {
            canOverlapWithOtherServices: true,
            compatibleServiceIds: ['service-consult-1'],
          },
          advance: {
            minAdvanceMinutes: 1440,
            maxAdvanceDays: 90,
          },
          multiDay: {
            allowsMultiDayBooking: true,
            minStayDays: 1,
            maxStayDays: 30,
            checkInTime: '13:00',
            checkOutTime: '11:00',
          },
          allowsClientComment: true,
          requiresSpecialistConfirmation: true,
        },
      },
      {
        id: 'service-visit-1',
        name: 'Визит на дом',
        locationLabel: 'У клиента',
        price: 1300,
        priceUnit: 'visit',
        bookingPolicy: {
          mode: 'fixed_slot',
          duration: {
            defaultDurationMinutes: 60,
            minDurationMinutes: 30,
            maxDurationMinutes: 120,
            durationStepMinutes: 30,
          },
          buffer: {
            hasBufferBefore: false,
            bufferBeforeMinutes: 0,
            hasBufferAfter: true,
            bufferAfterMinutes: 15,
          },
          compatibility: {
            canOverlapWithOtherServices: false,
            compatibleServiceIds: [],
          },
          advance: {
            minAdvanceMinutes: 180,
            maxAdvanceDays: 21,
          },
          allowsClientComment: true,
          requiresSpecialistConfirmation: true,
        },
      },
      {
        id: 'service-consult-1',
        name: 'Онлайн-консультация',
        locationLabel: 'Онлайн',
        price: 700,
        priceUnit: 'service',
        bookingPolicy: {
          mode: 'open_request',
          duration: {
            defaultDurationMinutes: 30,
            minDurationMinutes: 30,
            maxDurationMinutes: 60,
            durationStepMinutes: 30,
          },
          buffer: {
            hasBufferBefore: false,
            bufferBeforeMinutes: 0,
            hasBufferAfter: false,
            bufferAfterMinutes: 0,
          },
          compatibility: {
            canOverlapWithOtherServices: true,
            compatibleServiceIds: ['service-boarding-1'],
          },
          advance: {
            minAdvanceMinutes: 60,
            maxAdvanceDays: 30,
          },
          allowsClientComment: true,
          requiresSpecialistConfirmation: true,
        },
      },
    ],
    reviews: [
      {
        id: 'review-from-order-service-order-completed-anna-1',
        orderId: 'service-order-completed-anna-1',
        serviceTitle: 'Передержка у специалиста',
        authorName: 'Анна',
        petName: 'Марта',
        rating: 5,
        createdAt: '2026-02-19',
        text: 'Очень тёплый и бережный подход. Кошка быстро привыкла, отчёты были каждый день.',
        specialistReply: {
          text: 'Анна, спасибо большое за доверие. Марта чудесная.',
          createdAt: '2026-02-19',
        },
      },
      {
        id: 'review-from-order-service-order-completed-kirill-1',
        orderId: 'service-order-completed-kirill-1',
        serviceTitle: 'Фотосессия питомца',
        authorName: 'Кирилл',
        petName: 'Пушок',
        rating: 5,
        createdAt: '2026-02-10',
        text: 'Очень понравился подход. Всё чётко по рекомендациям, всегда на связи.',
      },
      {
        id: 'review-from-order-service-order-completed-elena-1',
        orderId: 'service-order-completed-elena-1',
        serviceTitle: 'Передержка у специалиста',
        authorName: 'Елена',
        petName: 'Снежок',
        rating: 5,
        createdAt: '2026-01-27',
        text: 'Передержка прошла идеально. Место чистое, рекомендации соблюдены полностью.',
        specialistReply: {
          text: 'Елена, спасибо. Буду рада помочь снова.',
          createdAt: '2026-01-28',
        },
      },
    ],
};

function buildSyntheticSpecialistProfiles(): SpecialistProfileResponse[] {
  const specs = buildDemoSpecialistSpecs();

  return specs.map((s) => {
    const profile = clone(PRIMARY_SPECIALIST_PROFILE);
    const id = `specialist-${s.index}`;
    const slug = specialistDemoSlug(s);
    const n = s.index.toString().padStart(2, '0');

    profile.id = id;
    profile.slug = slug;
    profile.main = {
      ...profile.main,
      firstName: s.firstName,
      lastName: s.lastName,
      middleName: '',
      city: s.city,
      district: s.city === 'Москва' ? 'Центральный округ' : '',
      phone: `+7 (901) ${200 + s.index}-${30 + s.index}-${40 + s.index}`,
      email: `specialist${n}@tailly.local`,
      avatarUrl:
        s.index % 4 === 0
          ? '/images/specialists/maria-ivanova.jpg'
          : undefined,
    };

    const years = 2 + (s.index % 7);

    profile.stats = {
      experienceYears: years,
      rating: Math.min(5, 4.2 + (s.index % 8) * 0.1),
      reviewsCount: 5 + s.index * 3,
      completedOrdersCount: 12 + s.index * 4,
      repeatOrdersCount: 2 + (s.index % 5),
    };

    profile.details = {
      ...profile.details,
      about: s.about,
      experienceLabel: `${years} ${years === 1 ? 'год' : years < 5 ? 'года' : 'лет'} опыта`,
      experienceDurationValue: years,
    };

    profile.reviews = profile.reviews.slice(
      0,
      Math.min(2, profile.reviews.length),
    );

    return profile;
  });
}

export const MOCK_SPECIALIST_PROFILES: SpecialistProfileResponse[] = [
  PRIMARY_SPECIALIST_PROFILE,
  ...buildSyntheticSpecialistProfiles(),
];

export function delay(ms = 350): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function cloneProfile(
  profile: SpecialistProfileResponse,
): SpecialistProfileResponse {
  return clone(profile);
}

export function normalizeProfileKey(value: string): string {
  return decodeURIComponent(value).trim().toLowerCase();
}

export function findProfileIndexBySlug(slug: string): number {
  const normalizedSlug = normalizeProfileKey(slug);

  const bySlug = MOCK_SPECIALIST_PROFILES.findIndex(
    (item) => normalizeProfileKey(item.slug) === normalizedSlug,
  );

  if (bySlug !== -1) {
    return bySlug;
  }

  const byId = MOCK_SPECIALIST_PROFILES.findIndex(
    (item) => normalizeProfileKey(item.id) === normalizedSlug,
  );

  if (byId !== -1) {
    return byId;
  }

  return -1;
}