import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/config/env', () => ({
  get2GisApiKey: () => '',
  getOptionalApiBaseUrl: () => '',
  getSupportEmailFromEnv: () => undefined,
  isMockApiMode: false,
  resolveApiBaseUrl: () => 'http://api.test',
}));

import { adminSpecialistsManagementApi } from './adminSpecialistsManagementApi';

describe('adminSpecialistsManagementApi.createSpecialistAccount', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('creates and attaches a specialist account through one atomic application endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        account: {
          id: 'specialist-1',
          email: 'specialist@example.com',
          role: 'specialist',
          firstName: 'Иван',
          lastName: 'Петров',
          city: 'Москва',
          about: 'Опытный специалист',
          specialistId: 'specialist-1',
          specialistSlug: 'ivan-petrov',
          applicationId: 'application-1',
          createdAt: '2026-01-01T00:00:00.000Z',
          createdBy: 'admin-1',
          isBlocked: false,
        },
        temporaryPassword: 'temp-pass',
      }),
    });

    vi.stubGlobal('fetch', fetchMock);

    await adminSpecialistsManagementApi.createSpecialistAccount({
      applicationId: 'application-1',
      email: 'specialist@example.com',
      firstName: 'Иван',
      lastName: 'Петров',
      city: 'Москва',
      about: 'Опытный специалист',
      profileSeed: {
        experienceYears: 5,
        animalTypes: ['Собаки'],
        serviceFormats: ['Выгул'],
        canGiveMedication: true,
        canHandleDifficultBehavior: true,
        canTakeOvernightOrders: false,
        hasOwnPets: true,
        hasPetFirstAidBasics: true,
        housingType: 'Квартира',
        districtPreferences: 'Центр',
        schedulePreferences: 'Будни',
        portfolioUrl: '',
        motivation: 'Люблю животных',
        additionalInfo: '',
      },
      reviewedBy: 'admin-1',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://api.test/admin/specialist-applications/application-1/create-specialist-account',
      expect.objectContaining({
        body: JSON.stringify({
          applicationId: 'application-1',
          email: 'specialist@example.com',
          firstName: 'Иван',
          lastName: 'Петров',
          city: 'Москва',
          about: 'Опытный специалист',
          profileSeed: {
            experienceYears: 5,
            animalTypes: ['Собаки'],
            serviceFormats: ['Выгул'],
            canGiveMedication: true,
            canHandleDifficultBehavior: true,
            canTakeOvernightOrders: false,
            hasOwnPets: true,
            hasPetFirstAidBasics: true,
            housingType: 'Квартира',
            districtPreferences: 'Центр',
            schedulePreferences: 'Будни',
            portfolioUrl: '',
            motivation: 'Люблю животных',
            additionalInfo: '',
          },
          reviewedBy: 'admin-1',
        }),
        method: 'POST',
      }),
    );
  });
});
