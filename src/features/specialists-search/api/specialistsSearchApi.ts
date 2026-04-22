// src/features/specialists-search/api/specialistsSearchApi.ts

import { HttpError, request } from '@/shared/api/http';
import { isMockApiMode } from '@/shared/config/env';
import { mockDataSourceStore } from '@/shared/lib/mock/mockDataSourceStore';

import { mockGetSpecialists } from './specialistsSearchApi.mock';

import type { Specialist } from '../model/types';

/* REAL */
async function realGetSpecialists(): Promise<Specialist[]> {
  return request<Specialist[]>('/specialists');
}

function shouldFallbackToMock(error: unknown): boolean {
  return error instanceof HttpError && (error.status === 401 || error.status === 404);
}

export const specialistsSearchApi = {
  async getSpecialists(): Promise<Specialist[]> {
    if (isMockApiMode) {
      mockDataSourceStore.setSource('specialists/list', true);
      return mockGetSpecialists();
    }

    try {
      const data = await realGetSpecialists();
      mockDataSourceStore.setSource('specialists/list', false);
      return data;
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        mockDataSourceStore.setSource('specialists/list', true);
        return mockGetSpecialists();
      }

      throw error;
    }
  },
};
