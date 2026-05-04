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

import { ordersApi } from './ordersApi';

import type { CreateServiceOrderPayload } from '../model/types';

function createPayload(): CreateServiceOrderPayload {
  return {
    dateFrom: '2026-05-05T10:00:00.000Z',
    dateTo: '2026-05-05T11:00:00.000Z',
    schedule: {
      mode: 'fixed_slot',
      startAt: '2026-05-05T10:00:00.000Z',
      endAt: '2026-05-05T11:00:00.000Z',
    },
    petId: 'pet-1',
    petName: 'Бублик',
    clientId: 'client-1',
    clientName: 'Клиент',
    clientSlug: 'client-1',
    sitterId: 'specialist-1',
    sitterName: 'Специалист',
    specialistSlug: 'specialist-one',
    serviceId: 'walking',
    serviceTitle: 'Выгул',
    servicePriceUnit: 'hour',
    bookingMode: 'fixed_slot',
    locationLabel: 'У клиента',
    comment: 'Позвонить заранее',
    price: 500,
    currency: 'RUB',
  };
}

describe('ordersApi.createServiceOrder', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('does not send client-derived or price snapshot fields to the real backend', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({}),
    });

    vi.stubGlobal('fetch', fetchMock);

    await ordersApi.createServiceOrder(createPayload());

    expect(fetchMock).toHaveBeenCalledWith(
      'http://api.test/me/orders/services',
      expect.objectContaining({
        body: JSON.stringify({
          dateFrom: '2026-05-05T10:00:00.000Z',
          dateTo: '2026-05-05T11:00:00.000Z',
          schedule: {
            mode: 'fixed_slot',
            startAt: '2026-05-05T10:00:00.000Z',
            endAt: '2026-05-05T11:00:00.000Z',
          },
          petId: 'pet-1',
          sitterId: 'specialist-1',
          specialistSlug: 'specialist-one',
          serviceId: 'walking',
          locationLabel: 'У клиента',
          comment: 'Позвонить заранее',
        }),
        method: 'POST',
      }),
    );
  });
});
