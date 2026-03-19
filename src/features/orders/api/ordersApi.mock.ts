// src/features/orders/api/ordersApi.mock.ts

import {
  createMockServiceOrder,
  getMockServiceOrderById,
  readMockServiceOrders,
  updateMockServiceOrder,
  MOCK_PRODUCT_ORDERS,
} from '../data/mockOrders';
import type {
  CompleteOrderResult,
  CreateServiceOrderPayload,
  ProductOrder,
  RepeatResult,
  ReviewResult,
  ServiceOrder,
  ServicesFilter,
} from '../model/types';

import {
  MOCK_SPECIALIST_PROFILES,
  findProfileIndexBySlug,
} from '@/features/specialist-profile/data/mockSpecialistProfiles';

function wait(delay = 300): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delay);
  });
}

function filterServices(
  list: ServiceOrder[],
  filter: ServicesFilter,
): ServiceOrder[] {
  if (filter === 'all') {
    return list;
  }

  return list.filter((item) => item.status === filter);
}

function toTimeValue(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
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
    slotStartMinutes >= windowStartMinutes && slotEndMinutes <= windowEndMinutes
  );
}

function syncBookedSlotForOrder(order: ServiceOrder): void {
  const profileIndex = findProfileIndexBySlug(order.specialistSlug);

  if (profileIndex === -1) {
    return;
  }

  const profile = MOCK_SPECIALIST_PROFILES[profileIndex];
  const orderDate = order.dateFrom.slice(0, 10);
  const startTime = toTimeValue(order.dateFrom);
  const endTime = order.dateTo ? toTimeValue(order.dateTo) : startTime;

  const nextBookedSlots = profile.calendar.bookedSlots.filter((slot) => {
    if (slot.date !== orderDate) {
      return true;
    }

    return !(
      slot.startTime === startTime &&
      slot.endTime === endTime &&
      slot.serviceIds.includes(order.serviceId)
    );
  });

  nextBookedSlots.push({
    id: `booked-order-${order.id}`,
    date: orderDate,
    startTime,
    endTime,
    serviceIds: [order.serviceId],
  });

  profile.calendar.bookedSlots = nextBookedSlots.sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }

    if (a.startTime !== b.startTime) {
      return a.startTime.localeCompare(b.startTime);
    }

    return a.endTime.localeCompare(b.endTime);
  });
}

function validateServiceOrderSlot(payload: CreateServiceOrderPayload): void {
  const profileIndex = findProfileIndexBySlug(payload.specialistSlug);

  if (profileIndex === -1) {
    throw new Error('Специалист не найден.');
  }

  const profile = MOCK_SPECIALIST_PROFILES[profileIndex];
  const orderDate = payload.dateFrom.slice(0, 10);
  const startTime = toTimeValue(payload.dateFrom);
  const endTime = payload.dateTo ? toTimeValue(payload.dateTo) : startTime;

  const dayOverride = profile.calendar.dayOverrides.find(
    (item) => item.date === orderDate,
  );

  if (dayOverride?.status === 'day_off') {
    throw new Error('На выбранную дату специалист недоступен.');
  }

  if (dayOverride?.status === 'fully_booked') {
    throw new Error('На выбранную дату у специалиста больше нет свободных слотов.');
  }

  const bookedOverlap = profile.calendar.bookedSlots.some((slot) => {
    if (slot.date !== orderDate) {
      return false;
    }

    return hasTimeOverlap(startTime, endTime, slot.startTime, slot.endTime);
  });

  if (bookedOverlap) {
    throw new Error('Этот слот уже занят. Выберите другое время.');
  }

  const availabilityWindows = profile.calendar.availabilityWindows.filter(
    (item) => item.date === orderDate,
  );

  if (availabilityWindows.length > 0) {
    const matchingWindow = availabilityWindows.some((windowItem) => {
      const serviceAllowed =
        windowItem.serviceIds.length === 0 ||
        windowItem.serviceIds.includes(payload.serviceId);

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
        'Выбранный слот больше недоступен для этой услуги. Обновите страницу бронирования.',
      );
    }
  }
}

export async function mockGetServiceOrders(
  filter: ServicesFilter,
): Promise<ServiceOrder[]> {
  await wait();

  const sorted = [...readMockServiceOrders()].sort(
    (a, b) => +new Date(b.dateFrom) - +new Date(a.dateFrom),
  );

  return filterServices(sorted, filter);
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

  validateServiceOrderSlot(payload);

  const order = createMockServiceOrder(payload);
  syncBookedSlotForOrder(order);

  return order;
}

export async function mockCompleteServiceOrder(
  orderId: string,
): Promise<CompleteOrderResult> {
  await wait();

  const existing = getMockServiceOrderById(orderId);

  if (!existing) {
    throw new Error('Заказ не найден.');
  }

  if (existing.status === 'canceled') {
    throw new Error('Нельзя завершить отменённый заказ.');
  }

  if (existing.status === 'completed') {
    return { ok: true };
  }

  updateMockServiceOrder(orderId, {
    status: 'completed',
    completedAt: new Date().toISOString(),
  });

  return { ok: true };
}

export async function mockGetProductOrders(): Promise<ProductOrder[]> {
  await wait();

  return [...MOCK_PRODUCT_ORDERS].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  );
}

export async function mockRepeatServiceOrder(): Promise<RepeatResult> {
  await wait();

  return { ok: true };
}

export async function mockRepeatProductOrder(): Promise<RepeatResult> {
  await wait();

  return { ok: true };
}

export async function mockLeaveServiceReview(
  orderId: string,
  rating: number,
): Promise<ReviewResult> {
  await wait();

  const existing = getMockServiceOrderById(orderId);

  if (!existing) {
    throw new Error('Заказ не найден.');
  }

  if (existing.status !== 'completed') {
    throw new Error('Оставить отзыв можно только по завершённому заказу.');
  }

  updateMockServiceOrder(orderId, {
    hasReview: true,
    rating,
  });

  return { ok: true };
}