//src/features/reviews/api/reviewsApi.ts
import type { Review, ReviewContext, ReviewCreatePayload } from '../model/types';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

function deepCopy<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error((await res.text().catch(() => '')) || `HTTP ${res.status}`);
  return (await res.json()) as T;
}

/* MOCK */
const MOCK_CONTEXTS: Record<string, ReviewContext> = {
  'so-1': {
    orderId: 'so-1',
    petId: 'p-1',
    petName: 'Ричи',
    ownerFullName: 'Иван Петров',
    sitterId: 's-1',
    sitterName: 'Анна',
    serviceTitle: 'Выгул собаки',
  },
};

let MOCK_REVIEWS: Review[] = [];

async function mockGetContext(orderId: string): Promise<ReviewContext> {
  const ctx = MOCK_CONTEXTS[orderId];
  if (!ctx) throw new Error('Контекст заказа не найден');
  return deepCopy(ctx);
}

async function mockCreateReview(payload: ReviewCreatePayload): Promise<Review> {
  const ctx = await mockGetContext(payload.orderId);

  const review: Review = {
    id: `r-${Math.random().toString(16).slice(2)}`,
    orderId: payload.orderId,
    rating: payload.rating,
    text: payload.text,
    photoUrls: payload.photoUrls,
    createdAtIso: new Date().toISOString(),
    petName: ctx.petName,
    ownerFullName: ctx.ownerFullName,
    sitterId: ctx.sitterId,
    sitterName: ctx.sitterName,
    serviceTitle: ctx.serviceTitle,
  };

  MOCK_REVIEWS = [review, ...MOCK_REVIEWS];
  return deepCopy(review);
}

/* REAL */
async function realGetContext(orderId: string): Promise<ReviewContext> {
  return fetchJson<ReviewContext>(`${API_BASE_URL}/me/reviews/context/${encodeURIComponent(orderId)}`);
}

async function realCreateReview(payload: ReviewCreatePayload): Promise<Review> {
  return fetchJson<Review>(`${API_BASE_URL}/me/reviews`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export const reviewsApi = {
  getContext: (orderId: string) => (USE_MOCK ? mockGetContext(orderId) : realGetContext(orderId)),
  createReview: (payload: ReviewCreatePayload) => (USE_MOCK ? mockCreateReview(payload) : realCreateReview(payload)),
};