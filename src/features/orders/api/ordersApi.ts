//src/features/orders/api/ordersApi.ts

import type {
  ProductOrder,
  RepeatResult,
  ReviewResult,
  ServiceOrder,
  ServicesFilter,
} from '../model/types';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error((await res.text().catch(() => '')) || `HTTP ${res.status}`);
  return (await res.json()) as T;
}

/* ---------------- MOCK ---------------- */

let MOCK_SERVICE_ORDERS: ServiceOrder[] = [
  {
    id: 'so-1',
    dateFrom: '2026-02-28T10:00:00.000Z',
    dateTo: '2026-02-28T12:00:00.000Z',
    petId: 'p-1',
    petName: 'Ричи',
    sitterId: 's-1',
    sitterName: 'Анна Соколова',
    status: 'upcoming',
    price: 1600,
    currency: 'RUB',
    rating: undefined,
    hasReview: false,
    serviceTitle: 'Выгул собаки',
  },
  {
    id: 'so-2',
    dateFrom: '2026-02-05T09:00:00.000Z',
    dateTo: '2026-02-05T10:00:00.000Z',
    petId: 'p-1',
    petName: 'Ричи',
    sitterId: 's-2',
    sitterName: 'Илья Кузнецов',
    status: 'completed',
    price: 900,
    currency: 'RUB',
    rating: 5,
    hasReview: true,
    serviceTitle: 'Выгул собаки',
  },
  {
    id: 'so-3',
    dateFrom: '2026-01-20T18:00:00.000Z',
    petId: 'p-1',
    petName: 'Ричи',
    sitterId: 's-3',
    sitterName: 'Марина Белова',
    status: 'canceled',
    price: 1200,
    currency: 'RUB',
    rating: undefined,
    hasReview: false,
    serviceTitle: 'Выгул собаки',
  },
];

let MOCK_PRODUCT_ORDERS: ProductOrder[] = [
  {
    id: 'po-1',
    number: '№ 10239',
    status: 'delivered',
    createdAt: '2026-02-12T12:00:00.000Z',
    price: 2490,
    currency: 'RUB',
    itemsCount: 5,
    productThumbs: ['/images/product-1.png', '/images/product-2.png', '/images/product-3.png', '/images/product-4.png', '/images/product-5.png'],
  },
  {
    id: 'po-2',
    number: '№ 10218',
    status: 'shipped',
    createdAt: '2026-02-08T10:00:00.000Z',
    price: 990,
    currency: 'RUB',
    itemsCount: 2,
    productThumbs: ['/images/product-2.png', '/images/product-6.png'],
  },
];

function filterServices(list: ServiceOrder[], filter: ServicesFilter): ServiceOrder[] {
  if (filter === 'all') return list;
  return list.filter((x) => x.status === filter);
}

async function mockGetServiceOrders(filter: ServicesFilter): Promise<ServiceOrder[]> {
  const sorted = [...MOCK_SERVICE_ORDERS].sort((a, b) => +new Date(b.dateFrom) - +new Date(a.dateFrom));
  return filterServices(sorted, filter);
}

async function mockGetProductOrders(): Promise<ProductOrder[]> {
  return [...MOCK_PRODUCT_ORDERS].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

async function mockRepeatServiceOrder(_orderId: string): Promise<RepeatResult> {
  return { ok: true };
}
async function mockRepeatProductOrder(_orderId: string): Promise<RepeatResult> {
  return { ok: true };
}

async function mockLeaveServiceReview(orderId: string, rating: number): Promise<ReviewResult> {
  const idx = MOCK_SERVICE_ORDERS.findIndex((x) => x.id === orderId);
  if (idx >= 0) {
    MOCK_SERVICE_ORDERS[idx] = { ...MOCK_SERVICE_ORDERS[idx], hasReview: true, rating };
  }
  return { ok: true };
}

/* ---------------- REAL ---------------- */

async function realGetServiceOrders(filter: ServicesFilter): Promise<ServiceOrder[]> {
  const url = new URL(`${API_BASE_URL}/me/orders/services`);
  if (filter !== 'all') url.searchParams.set('status', filter);
  return fetchJson<ServiceOrder[]>(url);
}

async function realGetProductOrders(): Promise<ProductOrder[]> {
  return fetchJson<ProductOrder[]>(`${API_BASE_URL}/me/orders/products`);
}

async function realRepeatServiceOrder(orderId: string): Promise<RepeatResult> {
  return fetchJson<RepeatResult>(`${API_BASE_URL}/me/orders/services/${encodeURIComponent(orderId)}/repeat`, {
    method: 'POST',
  });
}

async function realRepeatProductOrder(orderId: string): Promise<RepeatResult> {
  return fetchJson<RepeatResult>(`${API_BASE_URL}/me/orders/products/${encodeURIComponent(orderId)}/repeat`, {
    method: 'POST',
  });
}

async function realLeaveServiceReview(orderId: string, rating: number): Promise<ReviewResult> {
  return fetchJson<ReviewResult>(`${API_BASE_URL}/me/orders/services/${encodeURIComponent(orderId)}/review`, {
    method: 'POST',
    body: JSON.stringify({ rating }),
  });
}

/* ---------------- EXPORT ---------------- */

export const ordersApi = {
  getServiceOrders: (filter: ServicesFilter) => (USE_MOCK ? mockGetServiceOrders(filter) : realGetServiceOrders(filter)),
  getProductOrders: () => (USE_MOCK ? mockGetProductOrders() : realGetProductOrders()),
  repeatServiceOrder: (orderId: string) => (USE_MOCK ? mockRepeatServiceOrder(orderId) : realRepeatServiceOrder(orderId)),
  repeatProductOrder: (orderId: string) => (USE_MOCK ? mockRepeatProductOrder(orderId) : realRepeatProductOrder(orderId)),
  leaveServiceReview: (orderId: string, rating: number) =>
    (USE_MOCK ? mockLeaveServiceReview(orderId, rating) : realLeaveServiceReview(orderId, rating)),
};