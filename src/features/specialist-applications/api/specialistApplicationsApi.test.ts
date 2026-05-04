import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/config/env', () => ({
  get2GisApiKey: () => '',
  getOptionalApiBaseUrl: () => '',
  getSupportEmailFromEnv: () => undefined,
  isMockApiMode: false,
  resolveApiBaseUrl: () => 'http://api.test',
}));

import { specialistApplicationsApi } from './specialistApplicationsApi';

import type { SpecialistApplication } from '../model/types';

function createApplicationFixture(): SpecialistApplication {
  return {
    id: 'application-1',
    fullName: 'Иван Петров',
    email: 'specialist@example.com',
    phone: '+79990000000',
    city: 'Москва',
    about: 'Опытный специалист',
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
    reviewedBy: 'admin-1',
    createdSpecialistId: 'specialist-1',
    createdSpecialistSlug: 'ivan-petrov',
    specialistAccountCreatedAt: '2026-01-02T00:00:00.000Z',
  };
}

describe('specialistApplicationsApi.attachCreatedSpecialistAccount', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('sends created specialist identifiers to the backend', async () => {
    const application = createApplicationFixture();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        success: true,
        application,
      }),
    });

    vi.stubGlobal('fetch', fetchMock);

    await expect(
      specialistApplicationsApi.attachCreatedSpecialistAccount({
        applicationId: 'application-1',
        specialistId: 'specialist-1',
        specialistSlug: 'ivan-petrov',
        reviewedBy: 'admin-1',
      }),
    ).resolves.toMatchObject({
      createdSpecialistId: 'specialist-1',
      createdSpecialistSlug: 'ivan-petrov',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://api.test/admin/specialist-applications/application-1/attach-specialist-account',
      expect.objectContaining({
        body: JSON.stringify({
          specialistId: 'specialist-1',
          specialistSlug: 'ivan-petrov',
          reviewedBy: 'admin-1',
        }),
        method: 'POST',
      }),
    );
  });
});
