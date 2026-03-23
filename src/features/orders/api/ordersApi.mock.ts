// src/features/orders/api/ordersApi.mock.ts

import {
  createMockServiceOrder,
  getMockServiceOrderById,
  readMockServiceOrders,
  updateMockServiceOrder,
} from '../data/mockOrders';
import { readProductOrdersFromShop } from '../data/mockProductOrdersAdapter';

import type {
  CancelOrderResult,
  CompleteOrderResult,
  ConfirmOrderResult,
  CreateServiceOrderPayload,
  LeaveServiceReviewPayload,
  ProductOrder,
  RepeatResult,
  ReviewResult,
  ServiceOrder,
  ServiceOrderReview,
  ServicesFilter,
  StartOrderResult,
} from '../model/types';
import type { ProductOrderRepeatCheckoutDraft } from '../model/productOrderRepeatCheckout';

import {
  MOCK_SPECIALIST_PROFILES,
  findProfileIndexBySlug,
} from '@/features/specialist-profile/data/mockSpecialistProfiles';
import { readStoredOrders, writeStoredOrders } from '@/features/shop/data/mockShopOrders';

import type {
  SpecialistCalendarBookedSlot,
  SpecialistReview,
  SpecialistService,
} from '@/features/specialist-profile/model/types';

function wait(delay = 300): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delay);
  });
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function toTimeValue(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function toDateValue(iso: string): string {
  return iso.slice(0, 10);
}

function hasTimeOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  const aStart = timeToMinutes(startA);
  const aEnd = timeToMinutes(endA);
  const bStart = timeToMinutes(startB);
  const bEnd = timeToMinutes(endB);

  return aStart < bEnd && bStart < aEnd;
}

function isSlotInsideWindow(
  slotStart: string,
  slotEnd: string,
  windowStart: string,
  windowEnd: string,
): boolean {
  const slotStartMinutes = timeToMinutes(slotStart);
  const slotEndMinutes = timeToMinutes(slotEnd);
  const windowStartMinutes = timeToMinutes(windowStart);
  const windowEndMinutes = timeToMinutes(windowEnd);

  return (
    slotStartMinutes >= windowStartMinutes &&
    slotEndMinutes <= windowEndMinutes
  );
}

function normalizeUpcomingFilter(
  list: ServiceOrder[],
  filter: ServicesFilter,
): ServiceOrder[] {
  if (filter === 'all') {
    return list;
  }

  if (filter === 'upcoming') {
    return list.filter(
      (item) =>
        item.status === 'pending_confirmation' || item.status === 'confirmed',
    );
  }

  return list.filter((item) => item.status === filter);
}

function getSpecialistProfileOrThrow(slug: string) {
  const profileIndex = findProfileIndexBySlug(slug);

  if (profileIndex === -1) {
    throw new Error('Специалист не найден.');
  }

  return {
    profileIndex,
    profile: MOCK_SPECIALIST_PROFILES[profileIndex],
  };
}

function getServiceOrThrow(
  specialistSlug: string,
  serviceId: string,
): SpecialistService {
  const { profile } = getSpecialistProfileOrThrow(specialistSlug);
  const service = profile.services.find((item) => item.id === serviceId);

  if (!service) {
    throw new Error('Выбранная услуга больше недоступна у специалиста.');
  }

  return service;
}

function getServiceBuffer(service: SpecialistService): {
  before: number;
  after: number;
} {
  const buffer = service.bookingPolicy?.buffer;

  if (!buffer) {
    return { before: 0, after: 0 };
  }

  return {
    before: buffer.hasBufferBefore
      ? Math.max(0, buffer.bufferBeforeMinutes)
      : 0,
    after: buffer.hasBufferAfter ? Math.max(0, buffer.bufferAfterMinutes) : 0,
  };
}

function getAdjustedRange(
  startTime: string,
  endTime: string,
  beforeMinutes: number,
  afterMinutes: number,
): {
  adjustedStart: string;
  adjustedEnd: string;
} {
  const start = Math.max(0, timeToMinutes(startTime) - beforeMinutes);
  const end = Math.min(24 * 60, timeToMinutes(endTime) + afterMinutes);

  const adjustedStart = `${String(Math.floor(start / 60)).padStart(
    2,
    '0',
  )}:${String(start % 60).padStart(2, '0')}`;
  const adjustedEnd = `${String(Math.floor(end / 60)).padStart(
    2,
    '0',
  )}:${String(end % 60).padStart(2, '0')}`;

  return { adjustedStart, adjustedEnd };
}

function validateServiceSnapshot(
  payload: CreateServiceOrderPayload,
  service: SpecialistService,
): void {
  if (service.name !== payload.serviceTitle) {
    throw new Error('Данные выбранной услуги устарели. Обновите страницу.');
  }

  if (service.locationLabel !== payload.locationLabel) {
    throw new Error('Локация услуги изменилась. Обновите страницу.');
  }

  if (service.price !== payload.price) {
    throw new Error('Стоимость услуги изменилась. Обновите страницу.');
  }

  if (service.priceUnit !== payload.servicePriceUnit) {
    throw new Error('Формат тарифа услуги изменился. Обновите страницу.');
  }

  if ((service.bookingPolicy?.mode ?? 'fixed_slot') !== payload.bookingMode) {
    throw new Error('Режим бронирования услуги изменился. Обновите страницу.');
  }
}

function validateAdvanceRules(
  payload: CreateServiceOrderPayload,
  service: SpecialistService,
): void {
  const policy = service.bookingPolicy;

  if (!policy?.advance) {
    return;
  }

  const relevantStart =
    payload.schedule.mode === 'multi_day_stay'
      ? new Date(payload.schedule.checkInAt)
      : payload.schedule.mode === 'open_request'
        ? payload.schedule.requestedDate
          ? new Date(
              `${payload.schedule.requestedDate}T${
                payload.schedule.requestedStartTime ?? '09:00'
              }:00`,
            )
          : new Date(payload.dateFrom)
        : new Date(payload.dateFrom);

  if (Number.isNaN(relevantStart.getTime())) {
    return;
  }

  const diffMinutes = Math.floor(
    (relevantStart.getTime() - Date.now()) / (1000 * 60),
  );

  if (
    typeof policy.advance.minAdvanceMinutes === 'number' &&
    diffMinutes < policy.advance.minAdvanceMinutes
  ) {
    throw new Error('Для этой услуги нужно бронирование заранее.');
  }

  if (
    typeof policy.advance.maxAdvanceDays === 'number' &&
    diffMinutes > policy.advance.maxAdvanceDays * 24 * 60
  ) {
    throw new Error('Эту услугу нельзя бронировать настолько заранее.');
  }
}

function validateWindowsForSingleDate(
  specialistSlug: string,
  serviceId: string,
  date: string,
  startTime: string,
  endTime: string,
): void {
  const { profile } = getSpecialistProfileOrThrow(specialistSlug);

  const dayOverride = profile.calendar.dayOverrides.find(
    (item) => item.date === date,
  );

  if (dayOverride?.status === 'day_off') {
    throw new Error('На выбранную дату специалист недоступен.');
  }

  if (dayOverride?.status === 'fully_booked') {
    throw new Error('На выбранную дату больше нет свободных слотов.');
  }

  const availabilityWindows = profile.calendar.availabilityWindows.filter(
    (item) => item.date === date,
  );

  if (availabilityWindows.length === 0) {
    return;
  }

  const matchingWindow = availabilityWindows.some((windowItem) => {
    const serviceAllowed =
      windowItem.serviceIds.length === 0 ||
      windowItem.serviceIds.includes(serviceId);

    if (!serviceAllowed) {
      return false;
    }

    return isSlotInsideWindow(
      startTime,
      endTime,
      windowItem.startTime,
      windowItem.endTime,
    );
  });

  if (!matchingWindow) {
    throw new Error(
      'Выбранное время больше недоступно для этой услуги. Обновите страницу бронирования.',
    );
  }
}

function validateConflictWithBookedSlots(
  specialistSlug: string,
  serviceId: string,
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string,
): void {
  const { profile } = getSpecialistProfileOrThrow(specialistSlug);
  const service = getServiceOrThrow(specialistSlug, serviceId);
  const compatibility = service.bookingPolicy?.compatibility;
  const buffer = getServiceBuffer(service);

  const candidateDays = buildDailyRanges(
    startDate,
    startTime,
    endDate,
    endTime,
  );

  const hasConflict = candidateDays.some((candidateRange) => {
    return profile.calendar.bookedSlots.some((slot) => {
      if (slot.date !== candidateRange.date) {
        return false;
      }

      const bookedServiceId = slot.serviceIds[0];
      const sameService = bookedServiceId === serviceId;

      if (!compatibility?.canOverlapWithOtherServices) {
        const adjustedCandidate = getAdjustedRange(
          candidateRange.startTime,
          candidateRange.endTime,
          buffer.before,
          buffer.after,
        );

        const adjustedBooked = getAdjustedRange(
          slot.startTime,
          slot.endTime,
          slot.bufferBeforeMinutes ?? 0,
          slot.bufferAfterMinutes ?? 0,
        );

        return hasTimeOverlap(
          adjustedCandidate.adjustedStart,
          adjustedCandidate.adjustedEnd,
          adjustedBooked.adjustedStart,
          adjustedBooked.adjustedEnd,
        );
      }

      if (sameService) {
        return hasTimeOverlap(
          candidateRange.startTime,
          candidateRange.endTime,
          slot.startTime,
          slot.endTime,
        );
      }

      const compatibleServiceIds = compatibility.compatibleServiceIds ?? [];
      const overlapAllowed =
        bookedServiceId && compatibleServiceIds.includes(bookedServiceId);

      if (overlapAllowed) {
        return false;
      }

      return hasTimeOverlap(
        candidateRange.startTime,
        candidateRange.endTime,
        slot.startTime,
        slot.endTime,
      );
    });
  });

  if (hasConflict) {
    throw new Error('Это время уже занято или конфликтует с буферами услуги.');
  }
}

function buildDailyRanges(
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string,
): Array<{ date: string; startTime: string; endTime: string }> {
  if (startDate === endDate) {
    return [{ date: startDate, startTime, endTime }];
  }

  const result: Array<{ date: string; startTime: string; endTime: string }> =
    [];
  const cursor = new Date(`${startDate}T00:00:00`);
  const endCursor = new Date(`${endDate}T00:00:00`);

  while (cursor <= endCursor) {
    const date = cursor.toISOString().slice(0, 10);

    if (date === startDate) {
      result.push({
        date,
        startTime,
        endTime: '23:59',
      });
    } else if (date === endDate) {
      result.push({
        date,
        startTime: '00:00',
        endTime,
      });
    } else {
      result.push({
        date,
        startTime: '00:00',
        endTime: '23:59',
      });
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
}

function validateScheduleShape(payload: CreateServiceOrderPayload): void {
  const { schedule } = payload;

  if (schedule.mode === 'fixed_slot' || schedule.mode === 'time_range') {
    const start = new Date(schedule.startAt);
    const end = new Date(schedule.endAt);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new Error('Некорректное время бронирования.');
    }

    if (end <= start) {
      throw new Error('Время окончания должно быть позже времени начала.');
    }

    return;
  }

  if (schedule.mode === 'multi_day_stay') {
    const checkIn = new Date(schedule.checkInAt);
    const checkOut = new Date(schedule.checkOutAt);

    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
      throw new Error('Некорректные даты передержки.');
    }

    if (checkOut <= checkIn) {
      throw new Error('Дата выезда должна быть позже даты заезда.');
    }

    if (schedule.stayDays < 1) {
      throw new Error('Передержка должна быть минимум на 1 день.');
    }

    return;
  }

  if (schedule.mode === 'open_request') {
    if (!payload.comment?.trim()) {
      throw new Error(
        'Для свободного запроса нужно описать детали в комментарии.',
      );
    }
  }
}

function validateByMode(payload: CreateServiceOrderPayload): void {
  const service = getServiceOrThrow(payload.specialistSlug, payload.serviceId);
  const mode = service.bookingPolicy?.mode ?? 'fixed_slot';

  validateServiceSnapshot(payload, service);
  validateAdvanceRules(payload, service);
  validateScheduleShape(payload);

  if (!payload.petId.trim() || !payload.petName.trim()) {
    throw new Error('Нужно выбрать питомца для оформления заказа.');
  }

  if (
    payload.schedule.mode === 'fixed_slot' ||
    payload.schedule.mode === 'time_range'
  ) {
    if (mode !== payload.schedule.mode) {
      throw new Error('Некорректный формат бронирования для выбранной услуги.');
    }

    const start = new Date(payload.schedule.startAt);
    const end = new Date(payload.schedule.endAt);

    if (start.getTime() <= Date.now()) {
      throw new Error('Нельзя оформить заказ на прошедшее время.');
    }

    const date = toDateValue(start.toISOString());
    const startTime = toTimeValue(start.toISOString());
    const endTime = toTimeValue(end.toISOString());

    const durationMinutes = Math.floor(
      (end.getTime() - start.getTime()) / (1000 * 60),
    );

    const durationPolicy = service.bookingPolicy?.duration;

    if (
      typeof durationPolicy?.minDurationMinutes === 'number' &&
      durationMinutes < durationPolicy.minDurationMinutes
    ) {
      throw new Error('Слишком короткая длительность для этой услуги.');
    }

    if (
      typeof durationPolicy?.maxDurationMinutes === 'number' &&
      durationMinutes > durationPolicy.maxDurationMinutes
    ) {
      throw new Error('Слишком большая длительность для этой услуги.');
    }

    validateWindowsForSingleDate(
      payload.specialistSlug,
      payload.serviceId,
      date,
      startTime,
      endTime,
    );

    validateConflictWithBookedSlots(
      payload.specialistSlug,
      payload.serviceId,
      date,
      startTime,
      date,
      endTime,
    );

    return;
  }

  if (payload.schedule.mode === 'multi_day_stay') {
    if (mode !== 'multi_day_stay') {
      throw new Error('Некорректный формат бронирования для выбранной услуги.');
    }

    const checkIn = new Date(payload.schedule.checkInAt);

    if (checkIn.getTime() <= Date.now()) {
      throw new Error('Нельзя оформить передержку на прошедшее время.');
    }

    const multiDayPolicy = service.bookingPolicy?.multiDay;

    if (
      typeof multiDayPolicy?.minStayDays === 'number' &&
      payload.schedule.stayDays < multiDayPolicy.minStayDays
    ) {
      throw new Error('Слишком короткая передержка для этой услуги.');
    }

    if (
      typeof multiDayPolicy?.maxStayDays === 'number' &&
      payload.schedule.stayDays > multiDayPolicy.maxStayDays
    ) {
      throw new Error('Слишком длинная передержка для этой услуги.');
    }

    const startDate = toDateValue(payload.schedule.checkInAt);
    const startTime = toTimeValue(payload.schedule.checkInAt);
    const endDate = toDateValue(payload.schedule.checkOutAt);
    const endTime = toTimeValue(payload.schedule.checkOutAt);

    const dailyRanges = buildDailyRanges(
      startDate,
      startTime,
      endDate,
      endTime,
    );

    dailyRanges.forEach((range) => {
      validateWindowsForSingleDate(
        payload.specialistSlug,
        payload.serviceId,
        range.date,
        range.startTime,
        range.endTime,
      );
    });

    validateConflictWithBookedSlots(
      payload.specialistSlug,
      payload.serviceId,
      startDate,
      startTime,
      endDate,
      endTime,
    );

    return;
  }

  if (payload.schedule.mode === 'open_request') {
    if (mode !== 'open_request') {
      throw new Error('Некорректный формат бронирования для выбранной услуги.');
    }

    if (!payload.comment?.trim()) {
      throw new Error('Опиши детали запроса в комментарии.');
    }

    return;
  }

  throw new Error('Некорректный формат бронирования для выбранной услуги.');
}

function makeBookedSlotsFromOrder(
  order: ServiceOrder,
): SpecialistCalendarBookedSlot[] {
  const service = getServiceOrThrow(order.specialistSlug, order.serviceId);
  const buffer = getServiceBuffer(service);

  if (
    order.schedule.mode === 'fixed_slot' ||
    order.schedule.mode === 'time_range'
  ) {
    const date = toDateValue(order.dateFrom);
    const startTime = toTimeValue(order.dateFrom);
    const endTime = order.dateTo ? toTimeValue(order.dateTo) : startTime;

    return [
      {
        id: `booked-order-${order.id}-${date}`,
        date,
        startTime,
        endTime,
        serviceIds: [order.serviceId],
        orderId: order.id,
        bufferBeforeMinutes: buffer.before || undefined,
        bufferAfterMinutes: buffer.after || undefined,
      },
    ];
  }

  if (order.schedule.mode === 'multi_day_stay') {
    const startDate = toDateValue(order.schedule.checkInAt);
    const startTime = toTimeValue(order.schedule.checkInAt);
    const endDate = toDateValue(order.schedule.checkOutAt);
    const endTime = toTimeValue(order.schedule.checkOutAt);

    return buildDailyRanges(startDate, startTime, endDate, endTime).map(
      (range) => ({
        id: `booked-order-${order.id}-${range.date}`,
        date: range.date,
        startTime: range.startTime,
        endTime: range.endTime,
        serviceIds: [order.serviceId],
        orderId: order.id,
      }),
    );
  }

  return [];
}

function syncBookedSlotsForOrder(order: ServiceOrder): void {
  const { profileIndex, profile } = getSpecialistProfileOrThrow(
    order.specialistSlug,
  );

  const nextSlots = profile.calendar.bookedSlots.filter(
    (slot) => slot.orderId !== order.id,
  );

  nextSlots.push(...makeBookedSlotsFromOrder(order));

  nextSlots.sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }

    if (a.startTime !== b.startTime) {
      return a.startTime.localeCompare(b.startTime);
    }

    return a.endTime.localeCompare(b.endTime);
  });

  MOCK_SPECIALIST_PROFILES[profileIndex].calendar.bookedSlots =
    clone(nextSlots);
}

function removeBookedSlotsForOrder(order: ServiceOrder): void {
  const { profileIndex, profile } = getSpecialistProfileOrThrow(
    order.specialistSlug,
  );

  MOCK_SPECIALIST_PROFILES[profileIndex].calendar.bookedSlots =
    profile.calendar.bookedSlots.filter((slot) => slot.orderId !== order.id);
}

function appendLifecycleStatus(
  order: ServiceOrder,
  nextStatus: ServiceOrder['status'],
  comment?: string,
): ServiceOrder['lifecycle'] {
  return [
    ...order.lifecycle,
    {
      status: nextStatus,
      changedAt: new Date().toISOString(),
      comment,
    },
  ];
}

function ensureAllowedTransition(
  order: ServiceOrder,
  targetStatus: ServiceOrder['status'],
): void {
  const current = order.status;

  const allowedMap: Record<ServiceOrder['status'], ServiceOrder['status'][]> = {
    pending_confirmation: ['confirmed', 'canceled'],
    confirmed: ['active', 'canceled'],
    active: ['completed'],
    completed: [],
    canceled: [],
  };

  if (!allowedMap[current].includes(targetStatus)) {
    throw new Error(
      `Нельзя перевести заказ из статуса "${current}" в статус "${targetStatus}".`,
    );
  }
}

function addReviewToSpecialist(
  order: ServiceOrder,
  review: ServiceOrderReview,
): void {
  const { profileIndex, profile } = getSpecialistProfileOrThrow(
    order.specialistSlug,
  );

  const nextReview: SpecialistReview = {
    id: `review-from-order-${order.id}`,
    authorName: 'Вы',
    petName: order.petName,
    rating: review.rating,
    createdAt: review.createdAt.slice(0, 10),
    text: review.comment.trim() || 'Спасибо за выполненный заказ.',
  };

  const nextReviews = [nextReview, ...profile.reviews];
  const nextReviewsCount = nextReviews.length;

  const ratingSum = nextReviews.reduce((sum, item) => sum + item.rating, 0);
  const nextRating = Number((ratingSum / nextReviewsCount).toFixed(1));

  MOCK_SPECIALIST_PROFILES[profileIndex] = {
    ...profile,
    reviews: clone(nextReviews),
    stats: {
      ...profile.stats,
      reviewsCount: nextReviewsCount,
      rating: nextRating,
      completedOrdersCount: Math.max(profile.stats.completedOrdersCount, 0),
    },
  };
}

/* ---------------- SERVICE ORDERS ---------------- */

export async function mockGetServiceOrders(
  filter: ServicesFilter,
): Promise<ServiceOrder[]> {
  await wait();

  const sorted = [...readMockServiceOrders()].sort(
    (a, b) => +new Date(b.dateFrom) - +new Date(a.dateFrom),
  );

  return normalizeUpcomingFilter(sorted, filter);
}

export async function mockGetServiceOrderById(
  orderId: string,
): Promise<ServiceOrder> {
  await wait();

  const order = getMockServiceOrderById(orderId);

  if (!order) {
    throw new Error('Заказ не найден.');
  }

  return order;
}

export async function mockCreateServiceOrder(
  payload: CreateServiceOrderPayload,
): Promise<ServiceOrder> {
  await wait();

  validateByMode(payload);

  const created = createMockServiceOrder(payload);
  syncBookedSlotsForOrder(created);

  return created;
}

export async function mockConfirmServiceOrder(
  orderId: string,
): Promise<ConfirmOrderResult> {
  await wait();

  const existing = getMockServiceOrderById(orderId);

  if (!existing) {
    throw new Error('Заказ не найден.');
  }

  ensureAllowedTransition(existing, 'confirmed');

  updateMockServiceOrder(orderId, {
    status: 'confirmed',
    confirmedAt: new Date().toISOString(),
    lifecycle: appendLifecycleStatus(existing, 'confirmed'),
  });

  return { ok: true };
}

export async function mockStartServiceOrder(
  orderId: string,
): Promise<StartOrderResult> {
  await wait();

  const existing = getMockServiceOrderById(orderId);

  if (!existing) {
    throw new Error('Заказ не найден.');
  }

  ensureAllowedTransition(existing, 'active');

  updateMockServiceOrder(orderId, {
    status: 'active',
    startedAt: new Date().toISOString(),
    lifecycle: appendLifecycleStatus(existing, 'active'),
  });

  return { ok: true };
}

export async function mockCompleteServiceOrder(
  orderId: string,
): Promise<CompleteOrderResult> {
  await wait();

  const existing = getMockServiceOrderById(orderId);

  if (!existing) {
    throw new Error('Заказ не найден.');
  }

  ensureAllowedTransition(existing, 'completed');

  updateMockServiceOrder(orderId, {
    status: 'completed',
    completedAt: new Date().toISOString(),
    lifecycle: appendLifecycleStatus(existing, 'completed'),
  });

  return { ok: true };
}

export async function mockCancelServiceOrder(
  orderId: string,
): Promise<CancelOrderResult> {
  await wait();

  const existing = getMockServiceOrderById(orderId);

  if (!existing) {
    throw new Error('Заказ не найден.');
  }

  ensureAllowedTransition(existing, 'canceled');

  updateMockServiceOrder(orderId, {
    status: 'canceled',
    canceledAt: new Date().toISOString(),
    lifecycle: appendLifecycleStatus(existing, 'canceled'),
  });

  removeBookedSlotsForOrder(existing);

  return { ok: true };
}

/* ---------------- PRODUCT ORDERS ---------------- */

export async function mockGetProductOrders(): Promise<ProductOrder[]> {
  await wait();

  return readProductOrdersFromShop().sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  );
}

export async function mockGetProductOrderById(
  orderId: string,
): Promise<ProductOrder> {
  await wait();

  const order = readProductOrdersFromShop().find((item) => item.id === orderId);

  if (!order) {
    throw new Error('Заказ не найден.');
  }

  return order;
}

export async function mockCancelProductOrder(
  orderId: string,
): Promise<CancelOrderResult> {
  await wait();

  const orders = readStoredOrders();
  const index = orders.findIndex((item) => item.id === orderId);

  if (index === -1) {
    throw new Error('Заказ не найден.');
  }

  const current = orders[index];

  if (current.status !== 'created' && current.status !== 'paid') {
    throw new Error('Этот заказ уже нельзя отменить.');
  }

  orders[index] = {
    ...current,
    status: 'cancelled',
    canBeCancelled: false,
  };

  writeStoredOrders(orders);

  return { ok: true };
}

export async function mockRepeatServiceOrder(
  orderId: string,
): Promise<RepeatResult> {
  await wait();

  const existing = getMockServiceOrderById(orderId);

  if (!existing) {
    throw new Error('Заказ не найден.');
  }

  return {
    ok: true,
    draftPayload: {
      petId: existing.petId,
      petName: existing.petName,
      sitterId: existing.sitterId,
      sitterName: existing.sitterName,
      specialistSlug: existing.specialistSlug,
      serviceId: existing.serviceId,
      serviceTitle: existing.serviceTitle,
      servicePriceUnit: existing.servicePriceUnit,
      bookingMode: existing.serviceSnapshot.bookingMode,
      locationLabel: existing.locationLabel,
      comment: existing.comment,
      price: existing.price,
      currency: existing.currency,
    },
  };
}

export async function mockRepeatProductOrder(
  orderId: string,
): Promise<ProductOrderRepeatCheckoutDraft> {
  await wait();

  const existing = readProductOrdersFromShop().find((item) => item.id === orderId);

  if (!existing) {
    throw new Error('Заказ не найден.');
  }

  return {
    source: 'repeat_product_order',
    orderId: existing.id,
    createdAt: new Date().toISOString(),
    items: existing.items.map((item) => ({
      productId: item.productId,
      title: item.title,
      quantity: item.quantity,
      price: item.price,
      imageUrl: item.imageUrl,
      variantId: item.variantId,
      variantLabel: item.variantLabel,
    })),
  };
}

export async function mockLeaveServiceReview(
  orderId: string,
  payload: LeaveServiceReviewPayload,
): Promise<ReviewResult> {
  await wait();

  if (![1, 2, 3, 4, 5].includes(payload.rating)) {
    throw new Error('Оценка должна быть от 1 до 5.');
  }

  if (!payload.comment.trim()) {
    throw new Error('Добавьте комментарий к отзыву.');
  }

  const existing = getMockServiceOrderById(orderId);

  if (!existing) {
    throw new Error('Заказ не найден.');
  }

  if (existing.status !== 'completed') {
    throw new Error('Оставить отзыв можно только по завершённому заказу.');
  }

  if (existing.hasReview && existing.review) {
    return { ok: true, review: existing.review };
  }

  const review: ServiceOrderReview = {
    rating: payload.rating,
    comment: payload.comment.trim(),
    photos: payload.photos.filter((item) => item.trim().length > 0),
    createdAt: new Date().toISOString(),
    specialistReply: null,
  };

  updateMockServiceOrder(orderId, {
    hasReview: true,
    rating: payload.rating,
    review,
  });

  addReviewToSpecialist(existing, review);

  return { ok: true, review };
}