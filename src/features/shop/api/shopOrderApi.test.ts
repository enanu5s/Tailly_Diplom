import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/config/env', () => ({
  get2GisApiKey: () => '',
  getOptionalApiBaseUrl: () => '',
  getSupportEmailFromEnv: () => undefined,
  isMockApiMode: false,
  resolveApiBaseUrl: () => 'http://api.test',
}));

vi.mock('@/features/auth/model/authStore', () => ({
  authStore: {
    getState: () => ({ user: null }),
    getToken: () => null,
    subscribe: vi.fn(() => vi.fn()),
  },
}));

import { shopOrderApi } from './shopOrderApi';

describe('shopOrderApi.createOrder', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('sends a flat backend payload instead of nested checkout form', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({}),
    });

    vi.stubGlobal('fetch', fetchMock);

    await shopOrderApi.createOrder({
      items: [
        { productId: 'product-1', quantity: 2 },
        { productId: 'product-2', quantity: 1 },
      ],
      form: {
        recipient: {
          firstName: 'Иван',
          lastName: 'Петров',
          phone: '+7 900 000-00-00',
          email: 'ivan@example.com',
        },
        deliveryMethod: 'courier',
        address: {
          city: 'Москва',
          street: 'Ленина',
          house: '1',
          apartment: '2',
          comment: 'Домофон 12',
        },
        pickupPointId: null,
        paymentMethod: 'card',
      },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://api.test/shop/orders',
      expect.objectContaining({
        body: JSON.stringify({
          items: [
            { productId: 'product-1', quantity: 2 },
            { productId: 'product-2', quantity: 1 },
          ],
          recipient: {
            firstName: 'Иван',
            lastName: 'Петров',
            phone: '+7 900 000-00-00',
            email: 'ivan@example.com',
          },
          deliveryMethod: 'courier',
          paymentMethod: 'card',
          address: {
            city: 'Москва',
            street: 'Ленина',
            house: '1',
            apartment: '2',
            comment: 'Домофон 12',
          },
        }),
        method: 'POST',
      }),
    );
  });
});
