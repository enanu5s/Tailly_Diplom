// src/features/orders/data/mockOrdersBulkSeed.ts

import {
  buildDemoSpecialistSpecs,
  specialistDemoSlug,
} from '@/shared/mock-db/seed/demoDataset.seed';

import type { ServiceOrder, ServiceOrderSchedule } from '../model/types';

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
  {
    id: 'service-walk-1',
    title: 'Прогулка с собакой',
    unit: 'walk' as const,
    price: 900,
    locationLabel: 'На улице рядом с домом клиента',
    bookingMode: 'fixed_slot' as const,
  },
  {
    id: 'service-photo-1',
    title: 'Фотосессия питомца',
    unit: 'service' as const,
    price: 2500,
    locationLabel: 'На прогулке или дома у клиента',
    bookingMode: 'time_range' as const,
  },
  {
    id: 'service-boarding-1',
    title: 'Передержка у специалиста',
    unit: 'day' as const,
    price: 1200,
    locationLabel: 'У специалиста дома',
    bookingMode: 'multi_day_stay' as const,
  },
  {
    id: 'service-visit-1',
    title: 'Визит на дом',
    unit: 'visit' as const,
    price: 1300,
    locationLabel: 'У клиента',
    bookingMode: 'fixed_slot' as const,
  },
  {
    id: 'service-consult-1',
    title: 'Онлайн-консультация',
    unit: 'service' as const,
    price: 700,
    locationLabel: 'Онлайн',
    bookingMode: 'open_request' as const,
  },
];

const FIRST = [
  'Елена',
  'Алексей',
  'Ольга',
  'Дмитрий',
  'Светлана',
  'Игорь',
  'Наталья',
  'Павел',
  'Татьяна',
  'Сергей',
  'Юлия',
  'Андрей',
  'Екатерина',
  'Виктор',
  'Алина',
  'Роман',
  'Марина',
  'Константин',
  'Вера',
  'Полина',
];

const LAST = [
  'Смирнова',
  'Козлов',
  'Новикова',
  'Соколов',
  'Волкова',
  'Лебедев',
  'Морозова',
  'Орлов',
  'Павлова',
  'Семёнов',
  'Егорова',
  'Николаев',
  'Зайцева',
  'Белов',
  'Комарова',
  'Фёдоров',
  'Андреева',
  'Громова',
  'Дьякова',
  'Соловьёва',
];

type SpecialistRow = {
  id: string;
  sitterName: string;
  specialistSlug: string;
};

function specialistRows(): SpecialistRow[] {
  const rows: SpecialistRow[] = [
    {
      id: 'specialist-1',
      sitterName: 'Мария Иванова',
      specialistSlug: 'maria-ivanova',
    },
  ];

  for (const spec of buildDemoSpecialistSpecs()) {
    rows.push({
      id: `specialist-${spec.index}`,
      sitterName: `${spec.firstName} ${spec.lastName}`,
      specialistSlug: specialistDemoSlug(spec),
    });
  }

  return rows;
}

function buildSchedule(
  now: Date,
  offsetDays: number,
  svc: (typeof SERVICE_DEFS)[number],
): { dateFrom: string; dateTo?: string; schedule: ServiceOrderSchedule } {
  const day = addDays(now, offsetDays);
  const start = atTime(day, 10 + (offsetDays % 5), (offsetDays * 7) % 60);
  const end = atTime(day, 12 + (offsetDays % 4), 30);

  if (svc.bookingMode === 'multi_day_stay') {
    const checkIn = atTime(addDays(now, offsetDays - 2), 14, 0);
    const checkOut = atTime(addDays(now, offsetDays + 1), 11, 0);
    const stayMs = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const stayDays = Math.max(1, Math.ceil(stayMs / (1000 * 60 * 60 * 24)));

    return {
      dateFrom: checkIn,
      dateTo: checkOut,
      schedule: {
        mode: 'multi_day_stay',
        checkInAt: checkIn,
        checkOutAt: checkOut,
        stayDays,
      },
    };
  }

  if (svc.bookingMode === 'open_request') {
    return {
      dateFrom: start,
      schedule: {
        mode: 'open_request',
        requestedDate: day.toISOString().slice(0, 10),
        requestedStartTime: '18:00',
        requestedEndTime: '18:30',
      },
    };
  }

  if (svc.bookingMode === 'time_range') {
    return {
      dateFrom: start,
      dateTo: end,
      schedule: {
        mode: 'time_range',
        startAt: start,
        endAt: end,
      },
    };
  }

  return {
    dateFrom: start,
    dateTo: end,
    schedule: {
      mode: 'fixed_slot',
      startAt: start,
      endAt: end,
    },
  };
}

/** ~70 дополнительных заказов между клиентами client-1…20 и специалистами specialist-1…14 */
export function buildBulkSyntheticServiceOrders(now: Date): ServiceOrder[] {
  const sitters = specialistRows();
  const statuses: ServiceOrder['status'][] = [
    'completed',
    'confirmed',
    'pending_confirmation',
    'canceled',
    'active',
  ];

  const out: ServiceOrder[] = [];

  for (let i = 0; i < 70; i += 1) {
    const clientNum = (i % 20) + 1;
    const clientId = `client-${clientNum}`;
    const clientName = `${FIRST[(clientNum - 1) % FIRST.length]} ${
      LAST[(clientNum - 1) % LAST.length]
    }`;
    const sitter = sitters[i % sitters.length];
    const svc = SERVICE_DEFS[i % SERVICE_DEFS.length];
    const status = statuses[i % statuses.length];
    const offsetDays = -30 + (i % 45);
    const { dateFrom, dateTo, schedule } = buildSchedule(now, offsetDays, svc);

    const petId = `pet-client-${clientNum}-${(i % 3) + 1}`;
    const petName = ['Барсик', 'Шарик', 'Мурка'][(i + clientNum) % 3];
    const createdAt = atTime(addDays(now, offsetDays - 1), 9 + (i % 8), 0);

    const orderId = `bulk-service-order-${i + 1}`;
    const price = svc.price * (svc.unit === 'day' ? 2 : 1);

    const lifecycle: ServiceOrder['lifecycle'] = [
      {
        status: 'pending_confirmation',
        changedAt: createdAt,
      },
    ];

    if (status === 'confirmed' || status === 'active' || status === 'completed') {
      lifecycle.push({
        status: 'confirmed',
        changedAt: atTime(addDays(new Date(createdAt), 0), 15, 0),
      });
    }

    if (status === 'active' || status === 'completed') {
      lifecycle.push({
        status: 'active',
        changedAt: dateFrom,
      });
    }

    if (status === 'completed') {
      lifecycle.push({
        status: 'completed',
        changedAt: dateTo ?? atTime(addDays(new Date(dateFrom), 0), 18, 0),
      });
    }

    if (status === 'canceled') {
      lifecycle.push({
        status: 'canceled',
        changedAt: atTime(addDays(new Date(createdAt), 1), 11, 0),
        comment: 'Отмена по демо-сценарию.',
      });
    }

    const hasDemoReview = status === 'completed' && i % 4 === 0;
    const reviewRating = (3 + (i % 3)) as 3 | 4 | 5;

    const base: ServiceOrder = {
      id: orderId,
      createdAt,
      dateFrom,
      dateTo,
      schedule,
      petId,
      petName,
      clientId,
      clientName,
      clientSlug: clientId,
      sitterId: sitter.id,
      sitterName: sitter.sitterName,
      specialistSlug: sitter.specialistSlug,
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
      comment: `Демо-заказ #${i + 1}: ${svc.title.toLowerCase()}.`,
      price,
      currency: 'RUB',
      hasReview: hasDemoReview,
      rating: hasDemoReview ? reviewRating : undefined,
      review: hasDemoReview
        ? {
            rating: reviewRating,
            comment: 'Всё отлично, демо-отзыв.',
            photos: [],
            createdAt: atTime(addDays(now, offsetDays), 20, 0),
            specialistReply:
              i % 8 === 0
                ? {
                    comment: 'Спасибо за отзыв!',
                    createdAt: atTime(addDays(now, offsetDays), 21, 0),
                  }
                : null,
          }
        : null,
      lifecycle,
    };

    if (status === 'confirmed' || status === 'active' || status === 'completed') {
      base.confirmedAt = atTime(addDays(new Date(createdAt), 0), 15, 0);
    }

    if (status === 'active' || status === 'completed') {
      base.startedAt = dateFrom;
    }

    if (status === 'completed') {
      base.completedAt = dateTo ?? atTime(addDays(new Date(dateFrom), 0), 18, 0);
    }

    if (status === 'canceled') {
      base.canceledAt = atTime(addDays(new Date(createdAt), 1), 11, 0);
    }

    out.push(base);
  }

  return out;
}
