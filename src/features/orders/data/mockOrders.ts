// src/features/orders/data/mockOrders.ts

import type {
  CreateServiceOrderPayload,
  ProductOrder,
  ServiceOrder,
} from '../model/types';

const SERVICE_ORDERS_STORAGE_KEY = 'tailly_service_orders';

const INITIAL_SERVICE_ORDERS: ServiceOrder[] = [
  {
    id: 'so-1',
    createdAt: '2026-02-20T09:00:00.000Z',
    dateFrom: '2026-02-28T10:00:00.000Z',
    dateTo: '2026-02-28T12:00:00.000Z',
    petId: 'p-1',
    petName: 'Ричи',
    sitterId: 's-1',
    sitterName: 'Анна Соколова',
    specialistSlug: 'anna-sokolova',
    status: 'upcoming',
    serviceId: 'service-walk-1',
    serviceTitle: 'Выгул собаки',
    servicePriceUnit: 'walk',
    locationLabel: 'У клиента',
    comment: 'Ричи лучше гулять в парке рядом с домом.',
    price: 1600,
    currency: 'RUB',
    rating: undefined,
    hasReview: false,
  },
  {
    id: 'so-2',
    createdAt: '2026-01-31T11:30:00.000Z',
    completedAt: '2026-02-05T10:10:00.000Z',
    dateFrom: '2026-02-05T09:00:00.000Z',
    dateTo: '2026-02-05T10:00:00.000Z',
    petId: 'p-1',
    petName: 'Ричи',
    sitterId: 's-2',
    sitterName: 'Илья Кузнецов',
    specialistSlug: 'ilya-kuznetsov',
    status: 'completed',
    serviceId: 'service-walk-2',
    serviceTitle: 'Выгул собаки',
    servicePriceUnit: 'walk',
    locationLabel: 'У клиента',
    comment: 'Нужен спокойный выгул без других собак.',
    price: 900,
    currency: 'RUB',
    rating: 5,
    hasReview: true,
  },
  {
    id: 'so-3',
    createdAt: '2026-01-18T14:00:00.000Z',
    dateFrom: '2026-01-20T18:00:00.000Z',
    petId: 'p-1',
    petName: 'Ричи',
    sitterId: 's-3',
    sitterName: 'Марина Белова',
    specialistSlug: 'marina-belova',
    status: 'canceled',
    serviceId: 'service-walk-3',
    serviceTitle: 'Выгул собаки',
    servicePriceUnit: 'walk',
    locationLabel: 'У клиента',
    comment: 'Заказ был отменён из-за смены планов.',
    price: 1200,
    currency: 'RUB',
    rating: undefined,
    hasReview: false,
  },
];

export const MOCK_PRODUCT_ORDERS: ProductOrder[] = [
  {
    id: 'po-1',
    number: '№ 10239',
    status: 'delivered',
    createdAt: '2026-02-12T12:00:00.000Z',
    price: 2490,
    currency: 'RUB',
    itemsCount: 5,
    productThumbs: [
      '/images/product-1.png',
      '/images/product-2.png',
      '/images/product-3.png',
      '/images/product-4.png',
      '/images/product-5.png',
    ],
  },
  {
    id: 'po-2',
    number: '№ 10240',
    status: 'paid',
    createdAt: '2026-02-14T09:15:00.000Z',
    price: 1340,
    currency: 'RUB',
    itemsCount: 2,
    productThumbs: ['/images/product-2.png', '/images/product-4.png'],
  },
];

function canUseStorage(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.localStorage !== 'undefined'
  );
}

function cloneServiceOrders(list: ServiceOrder[]): ServiceOrder[] {
  return JSON.parse(JSON.stringify(list)) as ServiceOrder[];
}

export function readMockServiceOrders(): ServiceOrder[] {
  if (!canUseStorage()) {
    return cloneServiceOrders(INITIAL_SERVICE_ORDERS);
  }

  const raw = window.localStorage.getItem(SERVICE_ORDERS_STORAGE_KEY);

  if (!raw) {
    const fallback = cloneServiceOrders(INITIAL_SERVICE_ORDERS);
    window.localStorage.setItem(
      SERVICE_ORDERS_STORAGE_KEY,
      JSON.stringify(fallback),
    );
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as ServiceOrder[];

    if (!Array.isArray(parsed)) {
      throw new Error('Invalid service orders payload');
    }

    return cloneServiceOrders(parsed);
  } catch {
    const fallback = cloneServiceOrders(INITIAL_SERVICE_ORDERS);
    window.localStorage.setItem(
      SERVICE_ORDERS_STORAGE_KEY,
      JSON.stringify(fallback),
    );
    return fallback;
  }
}

export function writeMockServiceOrders(list: ServiceOrder[]): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(
    SERVICE_ORDERS_STORAGE_KEY,
    JSON.stringify(cloneServiceOrders(list)),
  );
}

export function getMockServiceOrderById(orderId: string): ServiceOrder | null {
  return readMockServiceOrders().find((item) => item.id === orderId) ?? null;
}

export function buildMockServiceOrderId(): string {
  return `so-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export function createMockServiceOrder(
  payload: CreateServiceOrderPayload,
): ServiceOrder {
  const list = readMockServiceOrders();

  const order: ServiceOrder = {
    id: buildMockServiceOrderId(),
    createdAt: new Date().toISOString(),
    dateFrom: payload.dateFrom,
    dateTo: payload.dateTo,
    petId: payload.petId,
    petName: payload.petName,
    sitterId: payload.sitterId,
    sitterName: payload.sitterName,
    specialistSlug: payload.specialistSlug,
    status: 'upcoming',
    serviceId: payload.serviceId,
    serviceTitle: payload.serviceTitle,
    servicePriceUnit: payload.servicePriceUnit,
    locationLabel: payload.locationLabel,
    comment: payload.comment?.trim() || undefined,
    price: payload.price,
    currency: payload.currency,
    rating: undefined,
    hasReview: false,
  };

  writeMockServiceOrders([order, ...list]);

  return order;
}

export function updateMockServiceOrder(
  orderId: string,
  patch: Partial<ServiceOrder>,
): ServiceOrder | null {
  const list = readMockServiceOrders();
  const index = list.findIndex((item) => item.id === orderId);

  if (index === -1) {
    return null;
  }

  const updated: ServiceOrder = {
    ...list[index],
    ...patch,
  };

  list[index] = updated;
  writeMockServiceOrders(list);

  return updated;
}