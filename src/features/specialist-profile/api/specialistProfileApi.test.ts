import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/config/env', () => ({
  get2GisApiKey: () => '',
  getOptionalApiBaseUrl: () => '',
  getSupportEmailFromEnv: () => undefined,
  isMockApiMode: false,
  resolveApiBaseUrl: () => 'http://api.test',
}));

import { specialistProfileApi } from './specialistProfileApi';

import type { SpecialistProfileResponse } from '../model/types';

function createProfileFixture(): SpecialistProfileResponse {
  return {
    id: 'specialist-1',
    slug: 'ivan-petrov',
    main: {
      firstName: 'Иван',
      lastName: 'Петров',
      city: 'Москва',
      district: 'Центр',
      phone: '+79990000000',
      email: 'specialist@example.com',
    },
    stats: {
      experienceYears: 3,
      rating: 5,
      reviewsCount: 1,
      completedOrdersCount: 10,
      repeatOrdersCount: 2,
    },
    calendar: {
      timezone: 'Europe/Moscow',
      dayOverrides: [],
      bookedSlots: [],
      availabilityWindows: [],
    },
    petGallery: [],
    details: {
      experienceLabel: '3 года',
      housingType: 'apartment',
      petSizes: [],
      petAges: [],
      hasChildrenUnderTen: 'no',
      petTypes: [],
      advantages: [],
      about: 'Опытный специалист',
    },
    services: [],
    reviews: [],
  };
}

describe('specialistProfileApi', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('uses an explicit by-id endpoint for profile lookup by specialist id', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => createProfileFixture(),
    });

    vi.stubGlobal('fetch', fetchMock);

    await specialistProfileApi.getById('specialist-1');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://api.test/specialists/by-id/specialist-1',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('updates profile details without sending services', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => createProfileFixture(),
      });

    vi.stubGlobal('fetch', fetchMock);

    await specialistProfileApi.updateDetails('ivan-petrov', {
      experienceLabel: '3 года',
      experienceDurationValue: 3,
      experienceDurationUnit: 'years',
      housingType: 'apartment',
      petSizes: [],
      petAges: [],
      hasChildrenUnderTen: 'no',
      petTypes: [],
      advantages: [],
      about: 'Опытный специалист',
      specialistGallery: [],
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'http://api.test/specialists/ivan-petrov/details',
      expect.objectContaining({
        body: expect.not.stringContaining('services'),
        method: 'PATCH',
      }),
    );
  });

  it('creates and updates services through dedicated endpoints', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => createProfileFixture(),
      });

    vi.stubGlobal('fetch', fetchMock);

    const servicePayload = {
      name: 'Выгул',
      locationLabel: 'У клиента',
      description: 'Прогулка',
      price: 700,
      priceUnit: 'hour' as const,
    };

    await specialistProfileApi.createService('ivan-petrov', servicePayload);
    await specialistProfileApi.updateService('ivan-petrov', 'walking', servicePayload);

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'http://api.test/specialists/ivan-petrov/services',
      expect.objectContaining({
        body: JSON.stringify(servicePayload),
        method: 'POST',
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      'http://api.test/specialists/ivan-petrov/services/walking',
      expect.objectContaining({
        body: JSON.stringify(servicePayload),
        method: 'PATCH',
      }),
    );
  });
});
