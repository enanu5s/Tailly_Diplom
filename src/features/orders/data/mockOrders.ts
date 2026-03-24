// src/features/orders/data/mockOrders.ts

import {
  ensureMockDatabaseLoaded,
  patchMockDatabase,
  unsafeMutableMockDb,
} from "@/shared/mock-db/store";

import { buildBulkSyntheticServiceOrders } from "./mockOrdersBulkSeed";
import { MOCK_PRODUCT_ORDERS_SEED } from "./mockProductOrdersSeed";

import type {
  CreateServiceOrderPayload,
  ProductOrder,
  ServiceOrder,
  ServiceOrderReview,
  ServiceOrderSchedule,
  ServicePriceUnit,
} from "../model/types";


const DEFAULT_CLIENT_ID = "client-1";
const DEFAULT_CLIENT_NAME = "Елена Смирнова";
const DEFAULT_CLIENT_SLUG = "client-1";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
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

function buildLegacyReview(
  rating?: number,
  comment?: string,
): ServiceOrderReview | null {
  if (!rating || rating < 1 || rating > 5) {
    return null;
  }

  return {
    rating: rating as 1 | 2 | 3 | 4 | 5,
    comment: comment?.trim() || "Спасибо за выполненный заказ.",
    photos: [],
    createdAt: new Date().toISOString(),
    specialistReply: null,
  };
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
      id: "service-order-pending-1",
      createdAt: atTime(addDays(now, -1), 12, 15),
      dateFrom: pendingStart,
      dateTo: pendingEnd,
      schedule: {
        mode: "fixed_slot",
        startAt: pendingStart,
        endAt: pendingEnd,
      },
      petId: "pet-1",
      petName: "Марта",
      clientId: DEFAULT_CLIENT_ID,
      clientName: DEFAULT_CLIENT_NAME,
      clientSlug: DEFAULT_CLIENT_SLUG,
      sitterId: "specialist-1",
      sitterName: "Мария Иванова",
      specialistSlug: "maria-ivanova",
      status: "pending_confirmation",
      serviceId: "service-walk-1",
      serviceTitle: "Прогулка с собакой",
      servicePriceUnit: "walk",
      serviceSnapshot: {
        id: "service-walk-1",
        title: "Прогулка с собакой",
        locationLabel: "На улице рядом с домом клиента",
        price: 900,
        priceUnit: "walk",
        bookingMode: "fixed_slot",
      },
      locationLabel: "На улице рядом с домом клиента",
      comment: "Пожалуйста, гулять в спокойном темпе и не отпускать с поводка.",
      price: 900,
      currency: "RUB",
      hasReview: false,
      review: null,
      lifecycle: [
        {
          status: "pending_confirmation",
          changedAt: atTime(addDays(now, -1), 12, 15),
        },
      ],
    },
    {
      id: "service-order-confirmed-1",
      createdAt: atTime(addDays(now, -3), 10, 10),
      confirmedAt: atTime(addDays(now, -3), 11, 0),
      dateFrom: confirmedStart,
      dateTo: confirmedEnd,
      schedule: {
        mode: "time_range",
        startAt: confirmedStart,
        endAt: confirmedEnd,
      },
      petId: "pet-2",
      petName: "Пушок",
      clientId: DEFAULT_CLIENT_ID,
      clientName: DEFAULT_CLIENT_NAME,
      clientSlug: DEFAULT_CLIENT_SLUG,
      sitterId: "specialist-1",
      sitterName: "Мария Иванова",
      specialistSlug: "maria-ivanova",
      status: "confirmed",
      serviceId: "service-photo-1",
      serviceTitle: "Фотосессия питомца",
      servicePriceUnit: "service",
      serviceSnapshot: {
        id: "service-photo-1",
        title: "Фотосессия питомца",
        locationLabel: "На прогулке или дома у клиента",
        price: 2500,
        priceUnit: "service",
        bookingMode: "time_range",
      },
      locationLabel: "На прогулке или дома у клиента",
      comment: "Фотосессия нужна на улице, желательно ближе к закату.",
      price: 2500,
      currency: "RUB",
      hasReview: false,
      review: null,
      lifecycle: [
        {
          status: "pending_confirmation",
          changedAt: atTime(addDays(now, -3), 10, 10),
        },
        {
          status: "confirmed",
          changedAt: atTime(addDays(now, -3), 11, 0),
        },
      ],
    },
    {
      id: "service-order-active-1",
      createdAt: atTime(addDays(now, -1), 14, 20),
      confirmedAt: atTime(addDays(now, -1), 15, 0),
      startedAt: activeCheckIn,
      dateFrom: activeCheckIn,
      dateTo: activeCheckOut,
      schedule: {
        mode: "multi_day_stay",
        checkInAt: activeCheckIn,
        checkOutAt: activeCheckOut,
        stayDays: calculateStayDays(activeCheckIn, activeCheckOut),
      },
      petId: "pet-3",
      petName: "Снежок",
      clientId: DEFAULT_CLIENT_ID,
      clientName: DEFAULT_CLIENT_NAME,
      clientSlug: DEFAULT_CLIENT_SLUG,
      sitterId: "specialist-1",
      sitterName: "Мария Иванова",
      specialistSlug: "maria-ivanova",
      status: "active",
      serviceId: "service-boarding-1",
      serviceTitle: "Передержка у специалиста",
      servicePriceUnit: "day",
      serviceSnapshot: {
        id: "service-boarding-1",
        title: "Передержка у специалиста",
        locationLabel: "У специалиста дома",
        price: 1200,
        priceUnit: "day",
        bookingMode: "multi_day_stay",
      },
      locationLabel: "У специалиста дома",
      comment: "Нужна отдельная тихая зона и привычный корм по расписанию.",
      price: 2400,
      currency: "RUB",
      hasReview: false,
      review: null,
      lifecycle: [
        {
          status: "pending_confirmation",
          changedAt: atTime(addDays(now, -1), 14, 20),
        },
        {
          status: "confirmed",
          changedAt: atTime(addDays(now, -1), 15, 0),
        },
        {
          status: "active",
          changedAt: activeCheckIn,
        },
      ],
    },
    {
      id: "service-order-completed-1",
      createdAt: atTime(addDays(now, -7), 10, 0),
      confirmedAt: atTime(addDays(now, -7), 10, 30),
      startedAt: completedStart,
      completedAt: completedEnd,
      dateFrom: completedStart,
      dateTo: completedEnd,
      schedule: {
        mode: "fixed_slot",
        startAt: completedStart,
        endAt: completedEnd,
      },
      petId: "pet-4",
      petName: "Тиша",
      clientId: DEFAULT_CLIENT_ID,
      clientName: DEFAULT_CLIENT_NAME,
      clientSlug: DEFAULT_CLIENT_SLUG,
      sitterId: "specialist-1",
      sitterName: "Мария Иванова",
      specialistSlug: "maria-ivanova",
      status: "completed",
      serviceId: "service-visit-1",
      serviceTitle: "Визит на дом",
      servicePriceUnit: "visit",
      serviceSnapshot: {
        id: "service-visit-1",
        title: "Визит на дом",
        locationLabel: "У клиента",
        price: 1300,
        priceUnit: "visit",
        bookingMode: "fixed_slot",
      },
      locationLabel: "У клиента",
      comment: "Нужно было проверить воду, корм и немного поиграть с питомцем.",
      price: 1300,
      currency: "RUB",
      rating: 5,
      hasReview: true,
      review: {
        rating: 5,
        comment:
          "Всё прошло отлично. Специалист приехала вовремя, прислала фото и очень бережно отнеслась к питомцу.",
        photos: [],
        createdAt: completedEnd,
        specialistReply: {
          comment:
            "Спасибо большое за отзыв. Тиша был очень спокойным и чудесно пошёл на контакт.",
          createdAt: atTime(addDays(now, -3), 18, 10),
        },
      },
      lifecycle: [
        {
          status: "pending_confirmation",
          changedAt: atTime(addDays(now, -7), 10, 0),
        },
        {
          status: "confirmed",
          changedAt: atTime(addDays(now, -7), 10, 30),
        },
        {
          status: "active",
          changedAt: completedStart,
        },
        {
          status: "completed",
          changedAt: completedEnd,
        },
      ],
    },
    {
      id: "service-order-completed-anna-1",
      createdAt: atTime(addDays(now, -19), 11, 0),
      confirmedAt: atTime(addDays(now, -19), 11, 20),
      startedAt: atTime(addDays(now, -18), 14, 0),
      completedAt: atTime(addDays(now, -18), 16, 0),
      dateFrom: atTime(addDays(now, -18), 14, 0),
      dateTo: atTime(addDays(now, -18), 16, 0),
      schedule: {
        mode: "fixed_slot",
        startAt: atTime(addDays(now, -18), 14, 0),
        endAt: atTime(addDays(now, -18), 16, 0),
      },
      petId: "pet-profile-anna",
      petName: "Марта",
      clientId: "client-anna-1",
      clientName: "Анна Волкова",
      clientSlug: "client-anna-1",
      sitterId: "specialist-1",
      sitterName: "Мария Иванова",
      specialistSlug: "maria-ivanova",
      status: "completed",
      serviceId: "service-boarding-1",
      serviceTitle: "Передержка у специалиста",
      servicePriceUnit: "day",
      serviceSnapshot: {
        id: "service-boarding-1",
        title: "Передержка у специалиста",
        locationLabel: "У специалиста дома",
        price: 1200,
        priceUnit: "day",
        bookingMode: "fixed_slot",
      },
      locationLabel: "У специалиста дома",
      comment: "Короткая передержка на выходные.",
      price: 2400,
      currency: "RUB",
      rating: 5,
      hasReview: true,
      review: {
        rating: 5,
        comment:
          "Очень тёплый и бережный подход. Кошка быстро привыкла, отчёты были каждый день.",
        photos: [],
        createdAt: "2026-02-19T12:00:00.000Z",
        specialistReply: {
          comment: "Анна, спасибо большое за доверие. Марта чудесная.",
          createdAt: "2026-02-19T15:00:00.000Z",
        },
      },
      lifecycle: [
        {
          status: "pending_confirmation",
          changedAt: atTime(addDays(now, -19), 11, 0),
        },
        {
          status: "confirmed",
          changedAt: atTime(addDays(now, -19), 11, 20),
        },
        {
          status: "active",
          changedAt: atTime(addDays(now, -18), 14, 0),
        },
        {
          status: "completed",
          changedAt: atTime(addDays(now, -18), 16, 0),
        },
      ],
    },
    {
      id: "service-order-completed-kirill-1",
      createdAt: atTime(addDays(now, -12), 9, 30),
      confirmedAt: atTime(addDays(now, -12), 10, 0),
      startedAt: atTime(addDays(now, -11), 15, 0),
      completedAt: atTime(addDays(now, -11), 16, 30),
      dateFrom: atTime(addDays(now, -11), 15, 0),
      dateTo: atTime(addDays(now, -11), 16, 30),
      schedule: {
        mode: "time_range",
        startAt: atTime(addDays(now, -11), 15, 0),
        endAt: atTime(addDays(now, -11), 16, 30),
      },
      petId: "pet-profile-kirill",
      petName: "Пушок",
      clientId: "client-kirill-1",
      clientName: "Кирилл Лебедев",
      clientSlug: "client-kirill-1",
      sitterId: "specialist-1",
      sitterName: "Мария Иванова",
      specialistSlug: "maria-ivanova",
      status: "completed",
      serviceId: "service-photo-1",
      serviceTitle: "Фотосессия питомца",
      servicePriceUnit: "service",
      serviceSnapshot: {
        id: "service-photo-1",
        title: "Фотосессия питомца",
        locationLabel: "На прогулке или дома у клиента",
        price: 2500,
        priceUnit: "service",
        bookingMode: "time_range",
      },
      locationLabel: "На прогулке или дома у клиента",
      comment: "Съёмка в парке.",
      price: 2500,
      currency: "RUB",
      rating: 5,
      hasReview: true,
      review: {
        rating: 5,
        comment:
          "Очень понравился подход. Всё чётко по рекомендациям, всегда на связи.",
        photos: [],
        createdAt: "2026-02-10T11:00:00.000Z",
        specialistReply: null,
      },
      lifecycle: [
        {
          status: "pending_confirmation",
          changedAt: atTime(addDays(now, -12), 9, 30),
        },
        {
          status: "confirmed",
          changedAt: atTime(addDays(now, -12), 10, 0),
        },
        {
          status: "active",
          changedAt: atTime(addDays(now, -11), 15, 0),
        },
        {
          status: "completed",
          changedAt: atTime(addDays(now, -11), 16, 30),
        },
      ],
    },
    {
      id: "service-order-completed-elena-1",
      createdAt: atTime(addDays(now, -30), 8, 0),
      confirmedAt: atTime(addDays(now, -30), 8, 40),
      startedAt: atTime(addDays(now, -28), 12, 0),
      completedAt: atTime(addDays(now, -26), 11, 0),
      dateFrom: atTime(addDays(now, -28), 12, 0),
      dateTo: atTime(addDays(now, -26), 11, 0),
      schedule: {
        mode: "multi_day_stay",
        checkInAt: atTime(addDays(now, -28), 12, 0),
        checkOutAt: atTime(addDays(now, -26), 11, 0),
        stayDays: calculateStayDays(
          atTime(addDays(now, -28), 12, 0),
          atTime(addDays(now, -26), 11, 0),
        ),
      },
      petId: "pet-profile-elena",
      petName: "Снежок",
      clientId: DEFAULT_CLIENT_ID,
      clientName: DEFAULT_CLIENT_NAME,
      clientSlug: DEFAULT_CLIENT_SLUG,
      sitterId: "specialist-1",
      sitterName: "Мария Иванова",
      specialistSlug: "maria-ivanova",
      status: "completed",
      serviceId: "service-boarding-1",
      serviceTitle: "Передержка у специалиста",
      servicePriceUnit: "day",
      serviceSnapshot: {
        id: "service-boarding-1",
        title: "Передержка у специалиста",
        locationLabel: "У специалиста дома",
        price: 1200,
        priceUnit: "day",
        bookingMode: "multi_day_stay",
      },
      locationLabel: "У специалиста дома",
      comment: "Длительная передержка.",
      price: 3600,
      currency: "RUB",
      rating: 5,
      hasReview: true,
      review: {
        rating: 5,
        comment:
          "Передержка прошла идеально. Место чистое, рекомендации соблюдены полностью.",
        photos: [],
        createdAt: "2026-01-27T10:00:00.000Z",
        specialistReply: {
          comment: "Елена, спасибо. Буду рада помочь снова.",
          createdAt: "2026-01-28T09:00:00.000Z",
        },
      },
      lifecycle: [
        {
          status: "pending_confirmation",
          changedAt: atTime(addDays(now, -30), 8, 0),
        },
        {
          status: "confirmed",
          changedAt: atTime(addDays(now, -30), 8, 40),
        },
        {
          status: "active",
          changedAt: atTime(addDays(now, -28), 12, 0),
        },
        {
          status: "completed",
          changedAt: atTime(addDays(now, -26), 11, 0),
        },
      ],
    },
    {
      id: "service-order-canceled-1",
      createdAt: atTime(addDays(now, -5), 18, 0),
      canceledAt: atTime(canceledDay, 9, 0),
      dateFrom: atTime(addDays(now, 1), 18, 0),
      dateTo: undefined,
      schedule: {
        mode: "open_request",
        requestedDate: canceledRequestedDate,
        requestedStartTime: "18:00",
        requestedEndTime: "18:30",
      },
      petId: "pet-5",
      petName: "Ричи",
      clientId: DEFAULT_CLIENT_ID,
      clientName: DEFAULT_CLIENT_NAME,
      clientSlug: DEFAULT_CLIENT_SLUG,
      sitterId: "specialist-1",
      sitterName: "Мария Иванова",
      specialistSlug: "maria-ivanova",
      status: "canceled",
      serviceId: "service-consult-1",
      serviceTitle: "Онлайн-консультация",
      servicePriceUnit: "service",
      serviceSnapshot: {
        id: "service-consult-1",
        title: "Онлайн-консультация",
        locationLabel: "Онлайн",
        price: 700,
        priceUnit: "service",
        bookingMode: "open_request",
      },
      locationLabel: "Онлайн",
      comment:
        "Хотел обсудить адаптацию питомца после переезда, но перенесли из-за изменения графика.",
      price: 700,
      currency: "RUB",
      hasReview: false,
      review: null,
      lifecycle: [
        {
          status: "pending_confirmation",
          changedAt: atTime(addDays(now, -5), 18, 0),
        },
        {
          status: "canceled",
          changedAt: atTime(canceledDay, 9, 0),
          comment: "Отменено клиентом.",
        },
      ],
    },
    ...buildBulkSyntheticServiceOrders(now),
  ];
}

export const MOCK_PRODUCT_ORDERS: ProductOrder[] = MOCK_PRODUCT_ORDERS_SEED;

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
  const title = (order.serviceTitle ?? "").toLowerCase();

  if (title.includes("передерж")) {
    const checkInAt = order.dateFrom ?? new Date().toISOString();
    const checkOutAt =
      order.dateTo ?? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    return {
      mode: "multi_day_stay",
      checkInAt,
      checkOutAt,
      stayDays: calculateStayDays(checkInAt, checkOutAt),
    };
  }

  if (title.includes("консульта")) {
    return {
      mode: "open_request",
      requestedDate: order.dateFrom?.slice(0, 10),
      requestedStartTime: order.dateFrom
        ? new Date(order.dateFrom).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        : undefined,
      requestedEndTime: order.dateTo
        ? new Date(order.dateTo).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        : undefined,
    };
  }

  if (order.dateFrom && order.dateTo) {
    return {
      mode: "fixed_slot",
      startAt: order.dateFrom,
      endAt: order.dateTo,
    };
  }

  return {
    mode: "open_request",
    requestedDate: order.dateFrom?.slice(0, 10),
  };
}

function normalizeReview(raw: LegacyServiceOrder): ServiceOrderReview | null {
  if (raw.review) {
    const review = raw.review as Partial<ServiceOrderReview>;

    if (
      typeof review.rating === "number" &&
      review.rating >= 1 &&
      review.rating <= 5 &&
      typeof review.comment === "string"
    ) {
      return {
        rating: review.rating as 1 | 2 | 3 | 4 | 5,
        comment: review.comment,
        photos: Array.isArray(review.photos)
          ? review.photos.filter(
              (item): item is string => typeof item === "string",
            )
          : [],
        createdAt:
          typeof review.createdAt === "string"
            ? review.createdAt
            : new Date().toISOString(),
        specialistReply:
          review.specialistReply &&
          typeof review.specialistReply === "object" &&
          typeof review.specialistReply.comment === "string" &&
          typeof review.specialistReply.createdAt === "string"
            ? {
                comment: review.specialistReply.comment,
                createdAt: review.specialistReply.createdAt,
              }
            : null,
      };
    }
  }

  if (raw.hasReview) {
    return buildLegacyReview(raw.rating, raw.comment);
  }

  return null;
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
    typeof raw.price !== "number"
  ) {
    return null;
  }

  const schedule =
    raw.schedule && typeof raw.schedule === "object"
      ? (raw.schedule as ServiceOrderSchedule)
      : inferLegacySchedule(raw);

  const normalizedReview = normalizeReview(raw);

  const clientId =
    typeof raw.clientId === "string" && raw.clientId.trim()
      ? raw.clientId.trim()
      : DEFAULT_CLIENT_ID;
  const clientName =
    typeof raw.clientName === "string" && raw.clientName.trim()
      ? raw.clientName.trim()
      : DEFAULT_CLIENT_NAME;
  const clientSlug =
    typeof raw.clientSlug === "string" && raw.clientSlug.trim()
      ? raw.clientSlug.trim()
      : clientId;

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
    clientId,
    clientName,
    clientSlug,
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
    currency: raw.currency ?? "RUB",
    rating: normalizedReview?.rating ?? raw.rating,
    hasReview: Boolean(raw.hasReview || normalizedReview),
    review: normalizedReview,
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

function ensureServiceOrdersInitialized(): void {
  ensureMockDatabaseLoaded();

  const db = unsafeMutableMockDb();

  if (db.orders.service.length > 0) {
    return;
  }

  const initial = generateServiceSeed();
  patchMockDatabase((next) => {
    next.orders.service = initial;
  });
}

function readStorage(): ServiceOrder[] {
  if (typeof window === "undefined") {
    return clone(generateServiceSeed());
  }

  ensureServiceOrdersInitialized();

  const list = unsafeMutableMockDb().orders.service;
  const normalized = normalizeStoredOrders(list);

  if (JSON.stringify(normalized) !== JSON.stringify(list)) {
    patchMockDatabase((db) => {
      db.orders.service = normalized;
    });
  }

  return clone(normalized);
}

function writeStorage(list: ServiceOrder[]): void {
  if (typeof window === "undefined") {
    return;
  }

  patchMockDatabase((db) => {
    db.orders.service = clone(list);
  });
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
    clientId: payload.clientId.trim(),
    clientName: payload.clientName.trim(),
    clientSlug: payload.clientSlug.trim() || payload.clientId.trim(),
    sitterId: payload.sitterId,
    sitterName: payload.sitterName,
    specialistSlug: payload.specialistSlug,
    status: "pending_confirmation",
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
    review: null,
    lifecycle: [
      {
        status: "pending_confirmation",
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
    throw new Error("Заказ не найден.");
  }

  const updated: ServiceOrder = {
    ...current[index],
    ...clone(patch),
  };

  current[index] = updated;
  writeStorage(current);

  return clone(updated);
}
