// src/features/orders/data/mockOrders.ts

import type {
  CreateServiceOrderPayload,
  ProductOrder,
  ServiceOrder,
  ServiceOrderSchedule,
  ServicePriceUnit,
} from '../model/types';

const SERVICE_ORDERS_STORAGE_KEY = 'tailly_mock_service_orders';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

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

function calculateStayDays(checkInAt: string, checkOutAt: string): number {
  const checkIn = new Date(checkInAt);
  const checkOut = new Date(checkOutAt);

  const diffMs = checkOut.getTime() - checkIn.getTime();

  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

function generateServiceSeed(): ServiceOrder[] {
  const now = new Date();

  const pendingDay = addDays(now, 2);
  const confirmedDay = addDays(now, 4);
  const activeDay = addDays(now, 0);
  const completedDay = addDays(now, -4);
  const canceledDay = addDays(now, -2);

  const pendingStart = atTime(pendingDay, 11, 0);
  const pendingEnd = atTime(pendingDay, 12, 0);

  const confirmedStart = atTime(confirmedDay, 10, 0);
  const confirmedEnd = atTime(confirmedDay, 11, 30);

  const activeCheckIn = atTime(activeDay, 13, 0);
  const activeCheckOut = atTime(addDays(activeDay, 2), 11, 0);

  const completedStart = atTime(completedDay, 13, 0);
  const completedEnd = atTime(completedDay, 14, 30);

  const canceledRequestedDate = addDays(now, 1).toISOString().slice(0, 10);

  return [
    {
      id: 'service-order-pending-1',
      createdAt: atTime(addDays(now, -1), 12, 15),
      dateFrom: pendingStart,
      dateTo: pendingEnd,
      schedule: {
        mode: 'fixed_slot',
        startAt: pendingStart,
        endAt: pendingEnd,
      },
      petId: 'pet-1',
      petName: 'Марта',
      sitterId: 'specialist-1',
      sitterName: 'Мария Иванова',
      specialistSlug: 'maria-ivanova',
      status: 'pending_confirmation',
      serviceId: 'service-walk-1',
      serviceTitle: 'Прогулка с собакой',
      servicePriceUnit: 'walk',
      serviceSnapshot: {
        id: 'service-walk-1',
        title: 'Прогулка с собакой',
        locationLabel: 'На улице рядом с домом клиента',
        price: 900,
        priceUnit: 'walk',
        bookingMode: 'fixed_slot',
      },
      locationLabel: 'На улице рядом с домом клиента',
      comment: 'Пожалуйста, гулять в спокойном темпе и не отпускать с поводка.',
      price: 900,
      currency: 'RUB',
      hasReview: false,
      lifecycle: [
        {
          status: 'pending_confirmation',
          changedAt: atTime(addDays(now, -1), 12, 15),
        },
      ],
    },
    {
      id: 'service-order-confirmed-1',
      createdAt: atTime(addDays(now, -3), 10, 10),
      confirmedAt: atTime(addDays(now, -3), 11, 0),
      dateFrom: confirmedStart,
      dateTo: confirmedEnd,
      schedule: {
        mode: 'time_range',
        startAt: confirmedStart,
        endAt: confirmedEnd,
      },
      petId: 'pet-2',
      petName: 'Пушок',
      sitterId: 'specialist-1',
      sitterName: 'Мария Иванова',
      specialistSlug: 'maria-ivanova',
      status: 'confirmed',
      serviceId: 'service-photo-1',
      serviceTitle: 'Фотосессия питомца',
      servicePriceUnit: 'service',
      serviceSnapshot: {
        id: 'service-photo-1',
        title: 'Фотосессия питомца',
        locationLabel: 'На прогулке или дома у клиента',
        price: 2500,
        priceUnit: 'service',
        bookingMode: 'time_range',
      },
      locationLabel: 'На прогулке или дома у клиента',
      comment: 'Фотосессия нужна на улице, желательно ближе к закату.',
      price: 2500,
      currency: 'RUB',
      hasReview: false,
      lifecycle: [
        {
          status: 'pending_confirmation',
          changedAt: atTime(addDays(now, -3), 10, 10),
        },
        {
          status: 'confirmed',
          changedAt: atTime(addDays(now, -3), 11, 0),
        },
      ],
    },
    {
      id: 'service-order-active-1',
      createdAt: atTime(addDays(now, -1), 14, 20),
      confirmedAt: atTime(addDays(now, -1), 15, 0),
      startedAt: activeCheckIn,
      dateFrom: activeCheckIn,
      dateTo: activeCheckOut,
      schedule: {
        mode: 'multi_day_stay',
        checkInAt: activeCheckIn,
        checkOutAt: activeCheckOut,
        stayDays: calculateStayDays(activeCheckIn, activeCheckOut),
      },
      petId: 'pet-3',
      petName: 'Снежок',
      sitterId: 'specialist-1',
      sitterName: 'Мария Иванова',
      specialistSlug: 'maria-ivanova',
      status: 'active',
      serviceId: 'service-boarding-1',
      serviceTitle: 'Передержка у специалиста',
      servicePriceUnit: 'day',
      serviceSnapshot: {
        id: 'service-boarding-1',
        title: 'Передержка у специалиста',
        locationLabel: 'У специалиста дома',
        price: 1200,
        priceUnit: 'day',
        bookingMode: 'multi_day_stay',
      },
      locationLabel: 'У специалиста дома',
      comment: 'Нужна отдельная тихая зона и привычный корм по расписанию.',
      price: 2400,
      currency: 'RUB',
      hasReview: false,
      lifecycle: [
        {
          status: 'pending_confirmation',
          changedAt: atTime(addDays(now, -1), 14, 20),
        },
        {
          status: 'confirmed',
          changedAt: atTime(addDays(now, -1), 15, 0),
        },
        {
          status: 'active',
          changedAt: activeCheckIn,
        },
      ],
    },
    {
      id: 'service-order-completed-1',
      createdAt: atTime(addDays(now, -7), 10, 0),
      confirmedAt: atTime(addDays(now, -7), 10, 30),
      startedAt: completedStart,
      completedAt: completedEnd,
      dateFrom: completedStart,
      dateTo: completedEnd,
      schedule: {
        mode: 'fixed_slot',
        startAt: completedStart,
        endAt: completedEnd,
      },
      petId: 'pet-4',
      petName: 'Тиша',
      sitterId: 'specialist-1',
      sitterName: 'Мария Иванова',
      specialistSlug: 'maria-ivanova',
      status: 'completed',
      serviceId: 'service-visit-1',
      serviceTitle: 'Визит на дом',
      servicePriceUnit: 'visit',
      serviceSnapshot: {
        id: 'service-visit-1',
        title: 'Визит на дом',
        locationLabel: 'У клиента',
        price: 1300,
        priceUnit: 'visit',
        bookingMode: 'fixed_slot',
      },
      locationLabel: 'У клиента',
      comment: 'Нужно было проверить воду, корм и немного поиграть с питомцем.',
      price: 1300,
      currency: 'RUB',
      rating: 5,
      hasReview: true,
      lifecycle: [
        {
          status: 'pending_confirmation',
          changedAt: atTime(addDays(now, -7), 10, 0),
        },
        {
          status: 'confirmed',
          changedAt: atTime(addDays(now, -7), 10, 30),
        },
        {
          status: 'active',
          changedAt: completedStart,
        },
        {
          status: 'completed',
          changedAt: completedEnd,
        },
      ],
    },
    {
      id: 'service-order-canceled-1',
      createdAt: atTime(addDays(now, -5), 18, 0),
      canceledAt: atTime(canceledDay, 9, 0),
      dateFrom: atTime(addDays(now, 1), 18, 0),
      dateTo: undefined,
      schedule: {
        mode: 'open_request',
        requestedDate: canceledRequestedDate,
        requestedStartTime: '18:00',
        requestedEndTime: '18:30',
      },
      petId: 'pet-5',
      petName: 'Ричи',
      sitterId: 'specialist-1',
      sitterName: 'Мария Иванова',
      specialistSlug: 'maria-ivanova',
      status: 'canceled',
      serviceId: 'service-consult-1',
      serviceTitle: 'Онлайн-консультация',
      servicePriceUnit: 'service',
      serviceSnapshot: {
        id: 'service-consult-1',
        title: 'Онлайн-консультация',
        locationLabel: 'Онлайн',
        price: 700,
        priceUnit: 'service',
        bookingMode: 'open_request',
      },
      locationLabel: 'Онлайн',
      comment:
        'Хотел обсудить адаптацию питомца после переезда, но перенесли из-за изменения графика.',
      price: 700,
      currency: 'RUB',
      hasReview: false,
      lifecycle: [
        {
          status: 'pending_confirmation',
          changedAt: atTime(addDays(now, -5), 18, 0),
        },
        {
          status: 'canceled',
          changedAt: atTime(canceledDay, 9, 0),
          comment: 'Отменено клиентом.',
        },
      ],
    },
  ];
}

export const MOCK_PRODUCT_ORDERS: ProductOrder[] = [
  {
    id: 'product-order-1',
    number: `TL-${pad(new Date().getFullYear())}-001`,
    status: 'delivered',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    price: 2490,
    currency: 'RUB',
    itemsCount: 3,
    productThumbs: [
      '/images/shop/product-1.jpg',
      '/images/shop/product-2.jpg',
      '/images/shop/product-3.jpg',
    ],
  },
  {
    id: 'product-order-2',
    number: `TL-${pad(new Date().getFullYear())}-002`,
    status: 'paid',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    price: 1390,
    currency: 'RUB',
    itemsCount: 2,
    productThumbs: ['/images/shop/product-4.jpg', '/images/shop/product-5.jpg'],
  },
];

type LegacyServiceOrder = Partial<ServiceOrder> & {
  dateFrom?: string;
  dateTo?: string;
  serviceId?: string;
  serviceTitle?: string;
  servicePriceUnit?: ServicePriceUnit;
  locationLabel?: string;
  price?: number;
};

function inferLegacySchedule(order: LegacyServiceOrder): ServiceOrderSchedule {
  const title = (order.serviceTitle ?? '').toLowerCase();

  if (title.includes('передерж')) {
    const checkInAt = order.dateFrom ?? new Date().toISOString();
    const checkOutAt =
      order.dateTo ?? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    return {
      mode: 'multi_day_stay',
      checkInAt,
      checkOutAt,
      stayDays: calculateStayDays(checkInAt, checkOutAt),
    };
  }

  if (title.includes('консульта')) {
    return {
      mode: 'open_request',
      requestedDate: order.dateFrom?.slice(0, 10),
      requestedStartTime: order.dateFrom
        ? new Date(order.dateFrom).toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })
        : undefined,
      requestedEndTime: order.dateTo
        ? new Date(order.dateTo).toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })
        : undefined,
    };
  }

  if (order.dateFrom && order.dateTo) {
    return {
      mode: 'fixed_slot',
      startAt: order.dateFrom,
      endAt: order.dateTo,
    };
  }

  return {
    mode: 'open_request',
    requestedDate: order.dateFrom?.slice(0, 10),
  };
}

function migrateLegacyOrder(raw: LegacyServiceOrder): ServiceOrder | null {
  if (
    !raw.id ||
    !raw.createdAt ||
    !raw.petId ||
    !raw.petName ||
    !raw.sitterId ||
    !raw.sitterName ||
    !raw.specialistSlug ||
    !raw.status ||
    !raw.serviceId ||
    !raw.serviceTitle ||
    !raw.servicePriceUnit ||
    !raw.locationLabel ||
    typeof raw.price !== 'number'
  ) {
    return null;
  }

  const schedule =
    raw.schedule && typeof raw.schedule === 'object'
      ? (raw.schedule as ServiceOrderSchedule)
      : inferLegacySchedule(raw);

  return {
    id: raw.id,
    createdAt: raw.createdAt,
    confirmedAt: raw.confirmedAt,
    startedAt: raw.startedAt,
    completedAt: raw.completedAt,
    canceledAt: raw.canceledAt,
    dateFrom: raw.dateFrom ?? raw.createdAt,
    dateTo: raw.dateTo,
    schedule,
    petId: raw.petId,
    petName: raw.petName,
    sitterId: raw.sitterId,
    sitterName: raw.sitterName,
    specialistSlug: raw.specialistSlug,
    status: raw.status,
    serviceId: raw.serviceId,
    serviceTitle: raw.serviceTitle,
    servicePriceUnit: raw.servicePriceUnit,
    serviceSnapshot: raw.serviceSnapshot ?? {
      id: raw.serviceId,
      title: raw.serviceTitle,
      locationLabel: raw.locationLabel,
      price: raw.price,
      priceUnit: raw.servicePriceUnit,
      bookingMode: schedule.mode,
    },
    locationLabel: raw.locationLabel,
    comment: raw.comment,
    price: raw.price,
    currency: raw.currency ?? 'RUB',
    rating: raw.rating,
    hasReview: Boolean(raw.hasReview),
    lifecycle: Array.isArray(raw.lifecycle) ? raw.lifecycle : [],
  };
}

function normalizeStoredOrders(raw: unknown): ServiceOrder[] {
  if (!Array.isArray(raw)) {
    return generateServiceSeed();
  }

  const migrated = raw
    .map((item) => migrateLegacyOrder(item as LegacyServiceOrder))
    .filter((item): item is ServiceOrder => item !== null);

  return migrated.length > 0 ? migrated : generateServiceSeed();
}

function readStorage(): ServiceOrder[] {
  if (typeof window === 'undefined') {
    return clone(generateServiceSeed());
  }

  const raw = window.localStorage.getItem(SERVICE_ORDERS_STORAGE_KEY);

  if (!raw) {
    const initial = generateServiceSeed();
    window.localStorage.setItem(
      SERVICE_ORDERS_STORAGE_KEY,
      JSON.stringify(initial),
    );
    return clone(initial);
  }

  try {
    const parsed = JSON.parse(raw);
    const normalized = normalizeStoredOrders(parsed);

    window.localStorage.setItem(
      SERVICE_ORDERS_STORAGE_KEY,
      JSON.stringify(normalized),
    );

    return clone(normalized);
  } catch {
    const fallback = generateServiceSeed();
    window.localStorage.setItem(
      SERVICE_ORDERS_STORAGE_KEY,
      JSON.stringify(fallback),
    );
    return clone(fallback);
  }
}

function writeStorage(list: ServiceOrder[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    SERVICE_ORDERS_STORAGE_KEY,
    JSON.stringify(clone(list)),
  );
}

export function readMockServiceOrders(): ServiceOrder[] {
  return readStorage();
}

export function writeMockServiceOrders(list: ServiceOrder[]): void {
  writeStorage(list);
}

export function getMockServiceOrderById(orderId: string): ServiceOrder | null {
  return readStorage().find((item) => item.id === orderId) ?? null;
}

export function createMockServiceOrder(
  payload: CreateServiceOrderPayload,
): ServiceOrder {
  const now = new Date().toISOString();

  const nextOrder: ServiceOrder = {
    id: `service-order-${Date.now()}`,
    createdAt: now,
    dateFrom: payload.dateFrom,
    dateTo: payload.dateTo,
    schedule: clone(payload.schedule),
    petId: payload.petId,
    petName: payload.petName,
    sitterId: payload.sitterId,
    sitterName: payload.sitterName,
    specialistSlug: payload.specialistSlug,
    status: 'pending_confirmation',
    serviceId: payload.serviceId,
    serviceTitle: payload.serviceTitle,
    servicePriceUnit: payload.servicePriceUnit,
    serviceSnapshot: {
      id: payload.serviceId,
      title: payload.serviceTitle,
      locationLabel: payload.locationLabel,
      price: payload.price,
      priceUnit: payload.servicePriceUnit,
      bookingMode: payload.bookingMode,
    },
    locationLabel: payload.locationLabel,
    comment: payload.comment?.trim() || undefined,
    price: payload.price,
    currency: payload.currency,
    hasReview: false,
    lifecycle: [
      {
        status: 'pending_confirmation',
        changedAt: now,
      },
    ],
  };

  const nextList = [nextOrder, ...readStorage()];
  writeStorage(nextList);

  return clone(nextOrder);
}

export function updateMockServiceOrder(
  orderId: string,
  patch: Partial<ServiceOrder>,
): ServiceOrder {
  const current = readStorage();
  const index = current.findIndex((item) => item.id === orderId);

  if (index === -1) {
    throw new Error('Заказ не найден.');
  }

  const updated: ServiceOrder = {
    ...current[index],
    ...clone(patch),
  };

  current[index] = updated;
  writeStorage(current);

  return clone(updated);
}