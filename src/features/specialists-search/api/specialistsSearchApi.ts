// src/features/specialists-search/api/specialistsSearchApi.ts

import { HttpError, request } from '@/shared/api/http';
import { isMockApiMode } from '@/shared/config/env';
import { mockDataSourceStore } from '@/shared/lib/mock/mockDataSourceStore';

import { mockGetSpecialists } from './specialistsSearchApi.mock';

import type { SearchFilters, Specialist } from '../model/types';

/* REAL */
async function realGetSpecialists(filters?: Partial<SearchFilters>): Promise<Specialist[]> {
  return request<Specialist[]>('/specialists', {
    query: {
      cityQuery: filters?.cityQuery?.trim() || undefined,
      districtQuery: filters?.districtQuery?.trim() || undefined,
      serviceId:
        filters?.serviceId && filters.serviceId !== 'any' ? filters.serviceId : undefined,
      priceMin: filters?.priceMin ?? undefined,
      priceMax: filters?.priceMax ?? undefined,
      experienceMinYears: filters?.experienceMinYears ?? undefined,
      hasReviewsOnly: filters?.hasReviewsOnly || undefined,
    },
  });
}

function shouldFallbackToMock(error: unknown): boolean {
  return error instanceof HttpError && (error.status === 401 || error.status === 404);
}

export const specialistsSearchApi = {
  async getSpecialists(filters?: Partial<SearchFilters>): Promise<Specialist[]> {
    if (isMockApiMode) {
      mockDataSourceStore.setSource('specialists/list', true);
      return mockGetSpecialists(filters);
    }

    try {
      const data = await realGetSpecialists(filters);
      mockDataSourceStore.setSource('specialists/list', false);
      return data;
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        mockDataSourceStore.setSource('specialists/list', true);
        return mockGetSpecialists(filters);
      }

      throw error;
    }
  },
};
