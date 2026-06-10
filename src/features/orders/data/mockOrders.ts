// src/features/orders/data/mockOrders.ts

import {
  ensureMockDatabaseLoaded,
  patchMockDatabase,
  unsafeMutableMockDb,
} from '@/shared/mock-db/store';

import type { MockDbSnapshot } from '@/shared/mock-db/types';


import type { ReviewContext } from '@/features/reviews/model/types';

import type {
  CreateServiceOrderPayload,
  ProductOrder,
  ServiceOrder,
  ServiceOrderReview,
  ServiceOrderSchedule,
  ServicePriceUnit,
} from '../model/types';

const DEFAULT_CLIENT_ID = 'client-1';
const DEFAULT_CLIENT_NAME = 'Елена Смирнова';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function calculateStayDays(checkInAt: string, checkOutAt: string): number {
  const checkIn = new Date(checkInAt);
  const checkOut = new Date(checkOutAt);

  const diffMs = checkOut.getTime() - checkIn.getTime();

  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

function buildLegacyReview(rating?: number, comment?: string): ServiceOrderReview | null {
  if (!rating || rating < 1 || rating > 5) {
    return null;
  }

  return {
    rating: rating as 1 | 2 | 3 | 4 | 5,
    comment: comment?.trim() || 'Спасибо за выполненный заказ.',
    photos: [],
    createdAt: new Date().toISOString(),
    specialistReply: null,
  };
}

function buildReviewContextsFromServiceOrders(
  orders: ServiceOrder[],
): Record<string, ReviewContext> {
  const out: Record<string, ReviewContext> = {};

  for (const order of orders) {
    if (order.status !== 'completed' || order.hasReview) {
      continue;
    }

    out[order.id] = {
      orderId: order.id,
      petId: order.petId,
      petName: order.petName,
      ownerFullName: order.clientName,
      sitterId: order.sitterId,
      sitterName: order.sitterName,
      serviceTitle: order.serviceTitle,
    };
  }

  return out;
}

/** Согласовать `reviews.contexts` с текущим списком заказов (единый источник правды). */
function syncReviewContextsIntoDb(db: MockDbSnapshot, orders: ServiceOrder[]): void {
  const next = buildReviewContextsFromServiceOrders(orders);
  const merged: Record<string, ReviewContext> = { ...db.reviews.contexts, ...next };
  const orderIdSet = new Set(orders.map((o) => o.id));

  for (const id of [...Object.keys(merged)]) {
    if (!orderIdSet.has(id)) {
      delete merged[id];
      continue;
    }

    const order = orders.find((o) => o.id === id);

    if (!order || order.status !== 'completed' || order.hasReview) {
      delete merged[id];
    }
  }

  db.reviews.contexts = merged;
}

export function readMockProductOrdersFromDb(): ProductOrder[] {
  ensureMockDatabaseLoaded();
  return clone(unsafeMutableMockDb().orders.product);
}

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

function normalizeReview(raw: LegacyServiceOrder): ServiceOrderReview | null {
  if (raw.review) {
    const review = raw.review as Partial<ServiceOrderReview>;

    if (
      typeof review.rating === 'number' &&
      review.rating >= 1 &&
      review.rating <= 5 &&
      typeof review.comment === 'string'
    ) {
      return {
        rating: review.rating as 1 | 2 | 3 | 4 | 5,
        comment: review.comment,
        photos: Array.isArray(review.photos)
          ? review.photos.filter((item): item is string => typeof item === 'string')
          : [],
        createdAt:
          typeof review.createdAt === 'string'
            ? review.createdAt
            : new Date().toISOString(),
        specialistReply:
          review.specialistReply &&
          typeof review.specialistReply === 'object' &&
          typeof review.specialistReply.comment === 'string' &&
          typeof review.specialistReply.createdAt === 'string'
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
    typeof raw.price !== 'number'
  ) {
    return null;
  }

  const schedule =
    raw.schedule && typeof raw.schedule === 'object'
      ? (raw.schedule as ServiceOrderSchedule)
      : inferLegacySchedule(raw);

  const normalizedReview = normalizeReview(raw);

  const clientId =
    typeof raw.clientId === 'string' && raw.clientId.trim()
      ? raw.clientId.trim()
      : DEFAULT_CLIENT_ID;
  const clientName =
    typeof raw.clientName === 'string' && raw.clientName.trim()
      ? raw.clientName.trim()
      : DEFAULT_CLIENT_NAME;
  const clientSlug =
    typeof raw.clientSlug === 'string' && raw.clientSlug.trim()
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
    currency: raw.currency ?? 'RUB',
    rating: normalizedReview?.rating ?? raw.rating,
    hasReview: Boolean(raw.hasReview || normalizedReview),
    review: normalizedReview,
    lifecycle: Array.isArray(raw.lifecycle) ? raw.lifecycle : [],
  };
}

function normalizeStoredOrders(raw: unknown): ServiceOrder[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item) => migrateLegacyOrder(item as LegacyServiceOrder))
    .filter((item): item is ServiceOrder => item !== null);
}

function readStorage(): ServiceOrder[] {
  if (typeof window === 'undefined') {
    return [];
  }

  ensureMockDatabaseLoaded();

  const list = unsafeMutableMockDb().orders.service;
  const normalized = normalizeStoredOrders(list);

  if (JSON.stringify(normalized) !== JSON.stringify(list)) {
    patchMockDatabase((db) => {
      db.orders.service = normalized;
      syncReviewContextsIntoDb(db, normalized);
    });
  }

  return clone(normalized);
}

function writeStorage(list: ServiceOrder[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  patchMockDatabase((db) => {
    db.orders.service = clone(list);
    syncReviewContextsIntoDb(db, list);
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

export function createMockServiceOrder(payload: CreateServiceOrderPayload): ServiceOrder {
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
    review: null,
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
