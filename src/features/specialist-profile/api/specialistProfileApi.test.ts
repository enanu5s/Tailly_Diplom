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
});
