// src/shared/mock-db/seed/orders.seed.ts

import { CLIENT_NAMES, SPECIALIST_ACCOUNT_META } from './accounts.seed';

import type { ServiceOrder, ServiceOrderSchedule } from '@/features/orders/model/types';

function addDays(base: Date, days: number): Date {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

function atTime(base: Date, hours: number, minutes = 0): string {
  const next = new Date(base);
  next.setHours(hours, minutes, 0, 0);
  return next.toISOString();
}

const SERVICE_DEFS = [
  { id: 'walking', title: 'Выгул', unit: 'walk' as const, price: 900, locationLabel: 'На улице', bookingMode: 'fixed_slot' as const },
  { id: 'boarding', title: 'Передержка', unit: 'day' as const, price: 1200, locationLabel: 'У специалиста', bookingMode: 'multi_day_stay' as const },
  { id: 'grooming', title: 'Груминг', unit: 'service' as const, price: 1800, locationLabel: 'У клиента', bookingMode: 'fixed_slot' as const },
  { id: 'training', title: 'Тренировка', unit: 'service' as const, price: 800, locationLabel: 'У клиента', bookingMode: 'open_request' as const },
  { id: 'photoshoot', title: 'Фотосессия', unit: 'service' as const, price: 2500, locationLabel: 'На улице', bookingMode: 'time_range' as const },
];

function clientName(clientNum: number): string {
  const c = CLIENT_NAMES[clientNum - 1];
  return c ? `${c.firstName} ${c.lastName}` : `Клиент ${clientNum}`;
}

function buildSchedule(now: Date, offsetDays: number, svc: (typeof SERVICE_DEFS)[number]) {
  const day = addDays(now, offsetDays);
  const start = atTime(day, 10, 0);
  const end = atTime(day, 12, 0);

  if (svc.bookingMode === 'multi_day_stay') {
    const checkIn = atTime(addDays(now, offsetDays), 14, 0);
    const checkOut = atTime(addDays(now, offsetDays + 2), 11, 0);
    return {
      dateFrom: checkIn,
      dateTo: checkOut,
      schedule: {
        mode: 'multi_day_stay' as const,
        checkInAt: checkIn,
        checkOutAt: checkOut,
        stayDays: 2,
      },
    };
  }

  return {
    dateFrom: start,
    dateTo: end,
    schedule: {
      mode: 'fixed_slot' as const,
      startAt: start,
      endAt: end,
    } satisfies ServiceOrderSchedule,
  };
}

function buildCoreClient1Orders(now: Date): ServiceOrder[] {
  const pendingDay = addDays(now, 2);
  const pendingStart = atTime(pendingDay, 11, 0);
  const pendingEnd = atTime(pendingDay, 12, 0);

  return [
    {
      id: 'service-order-pending-1',
      createdAt: atTime(addDays(now, -1), 12, 15),
      dateFrom: pendingStart,
      dateTo: pendingEnd,
      schedule: { mode: 'fixed_slot', startAt: pendingStart, endAt: pendingEnd },
      petId: 'client-1-pet-dog',
      petName: 'Марта',
      clientId: 'client-1',
      clientName: clientName(1),
      clientSlug: 'client-1',
      sitterId: 'specialist-1',
      sitterName: 'Мария Иванова',
      specialistSlug: 'maria-ivanova',
      status: 'pending_confirmation',
      serviceId: 'walking',
      serviceTitle: 'Выгул',
      servicePriceUnit: 'walk',
      serviceSnapshot: {
        id: 'walking',
        title: 'Выгул',
        locationLabel: 'На улице',
        price: 900,
        priceUnit: 'walk',
        bookingMode: 'fixed_slot',
      },
      locationLabel: 'На улице',
      comment: 'Спокойный темп прогулки.',
      price: 900,
      currency: 'RUB',
      hasReview: false,
      review: null,
      lifecycle: [{ status: 'pending_confirmation', changedAt: atTime(addDays(now, -1), 12, 15) }],
    },
    {
      id: 'service-order-completed-1',
      createdAt: atTime(addDays(now, -7), 10, 0),
      confirmedAt: atTime(addDays(now, -7), 10, 30),
      completedAt: atTime(addDays(now, -4), 14, 30),
      dateFrom: atTime(addDays(now, -4), 13, 0),
      dateTo: atTime(addDays(now, -4), 14, 30),
      schedule: {
        mode: 'fixed_slot',
        startAt: atTime(addDays(now, -4), 13, 0),
        endAt: atTime(addDays(now, -4), 14, 30),
      },
      petId: 'client-1-pet-dog',
      petName: 'Марта',
      clientId: 'client-1',
      clientName: clientName(1),
      clientSlug: 'client-1',
      sitterId: 'specialist-1',
      sitterName: 'Мария Иванова',
      specialistSlug: 'maria-ivanova',
      status: 'completed',
      serviceId: 'grooming',
      serviceTitle: 'Груминг',
      servicePriceUnit: 'service',
      serviceSnapshot: {
        id: 'grooming',
        title: 'Груминг',
        locationLabel: 'У клиента',
        price: 1800,
        priceUnit: 'service',
        bookingMode: 'fixed_slot',
      },
      locationLabel: 'У клиента',
      comment: 'Стрижка и купание.',
      price: 1800,
      currency: 'RUB',
      rating: 5,
      hasReview: true,
      review: {
        rating: 5,
        comment:
          'Всё прошло отлично: специалист приехала вовремя, аккуратно выполнила груминг и прислала фото до и после процедуры. Питомец остался спокойным, результат нас полностью устроил. Обязательно обратимся снова и рекомендуем знакомым владельцам.',
        photos: ['/images/home-reviews/hr-01.jpg'],
        createdAt: atTime(addDays(now, -4), 14, 30),
        specialistReply: {
          comment: 'Спасибо за отзыв!',
          createdAt: atTime(addDays(now, -3), 18, 10),
        },
      },
      lifecycle: [
        { status: 'pending_confirmation', changedAt: atTime(addDays(now, -7), 10, 0) },
        { status: 'confirmed', changedAt: atTime(addDays(now, -7), 10, 30) },
        { status: 'completed', changedAt: atTime(addDays(now, -4), 14, 30) },
      ],
    },
  ];
}

function buildBulkOrders(now: Date): ServiceOrder[] {
  const statuses: ServiceOrder['status'][] = [
    'completed',
    'confirmed',
    'pending_confirmation',
    'canceled',
    'active',
  ];
  const out: ServiceOrder[] = [];

  for (let i = 0; i < 36; i += 1) {
    const clientNum = (i % 6) + 1;
    const clientId = `client-${clientNum}`;
    const sitter = SPECIALIST_ACCOUNT_META[i % SPECIALIST_ACCOUNT_META.length]!;
    const svc = SERVICE_DEFS[i % SERVICE_DEFS.length]!;
    const status = statuses[i % statuses.length]!;
    const offsetDays = -25 + (i % 30);
    const { dateFrom, dateTo, schedule } = buildSchedule(now, offsetDays, svc);
    const createdAt = atTime(addDays(now, offsetDays - 1), 9, 0);
    const hasReview = status === 'completed' && i % 2 === 0;

    out.push({
      id: `bulk-service-order-${i + 1}`,
      createdAt,
      dateFrom,
      dateTo,
      schedule,
      petId: `${clientId}-pet-dog`,
      petName: 'Барсик',
      clientId,
      clientName: clientName(clientNum),
      clientSlug: clientId,
      sitterId: sitter.id,
      sitterName: `${sitter.firstName} ${sitter.lastName}`,
      specialistSlug: sitter.slug,
      status,
      serviceId: svc.id,
      serviceTitle: svc.title,
      servicePriceUnit: svc.unit,
      serviceSnapshot: {
        id: svc.id,
        title: svc.title,
        locationLabel: svc.locationLabel,
        price: svc.price,
        priceUnit: svc.unit,
        bookingMode: svc.bookingMode,
      },
      locationLabel: svc.locationLabel,
      comment: `Заказ ${svc.title}`,
      price: svc.price,
      currency: 'RUB',
      hasReview,
      rating: hasReview ? 5 : undefined,
      review: hasReview
        ? {
            rating: 5,
            comment:
              'Услуга выполнена на высоком уровне: специалист заранее уточнил детали, придерживался согласованного времени и прислал фотоотчёт. Питомец чувствовал себя спокойно, мы остались довольны и планируем повторную запись в ближайшие недели.',
            photos: [
              `/images/home-reviews/hr-${String((i % 8) + 1).padStart(2, '0')}.jpg`,
            ],
            createdAt: atTime(addDays(now, offsetDays), 20, 0),
            specialistReply:
              i % 4 === 0
                ? { comment: 'Спасибо за тёплый отзыв!', createdAt: atTime(addDays(now, offsetDays), 21, 0) }
                : null,
          }
        : null,
      lifecycle: [{ status: 'pending_confirmation', changedAt: createdAt }],
    });
  }

  return out;
}

function buildClient8SingleOrder(now: Date): ServiceOrder[] {
  const sitter = SPECIALIST_ACCOUNT_META[2]!;
  const start = atTime(addDays(now, 3), 10, 0);
  const end = atTime(addDays(now, 3), 11, 0);

  return [
    {
      id: 'service-order-client8-1',
      createdAt: atTime(addDays(now, -2), 14, 0),
      dateFrom: start,
      dateTo: end,
      schedule: { mode: 'fixed_slot', startAt: start, endAt: end },
      petId: 'client-8-pet-dog',
      petName: 'Бобик',
      clientId: 'client-8',
      clientName: clientName(8),
      clientSlug: 'client-8',
      sitterId: sitter.id,
      sitterName: `${sitter.firstName} ${sitter.lastName}`,
      specialistSlug: sitter.slug,
      status: 'confirmed',
      serviceId: 'walking',
      serviceTitle: 'Выгул',
      servicePriceUnit: 'walk',
      serviceSnapshot: {
        id: 'walking',
        title: 'Выгул',
        locationLabel: 'На улице',
        price: 900,
        priceUnit: 'walk',
        bookingMode: 'fixed_slot',
      },
      locationLabel: 'На улице',
      comment: 'Единственный заказ клиента.',
      price: 900,
      currency: 'RUB',
      hasReview: false,
      review: null,
      lifecycle: [
        { status: 'pending_confirmation', changedAt: atTime(addDays(now, -2), 14, 0) },
        { status: 'confirmed', changedAt: atTime(addDays(now, -1), 10, 0) },
      ],
      confirmedAt: atTime(addDays(now, -1), 10, 0),
    },
  ];
}

export function buildSeedServiceOrders(): ServiceOrder[] {
  const now = new Date();
  return [
    ...buildCoreClient1Orders(now),
    ...buildBulkOrders(now),
    ...buildClient8SingleOrder(now),
  ];
}
