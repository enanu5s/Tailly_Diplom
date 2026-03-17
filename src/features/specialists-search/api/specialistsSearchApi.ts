// src/features/specialists-search/api/specialistsSearchApi.ts

import { request } from '@/shared/api/http';

import { mockGetSpecialists } from './specialistsSearchApi.mock';

import type { Specialist } from '../model/types';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';

/* REAL */
async function realGetSpecialists(): Promise<Specialist[]> {
  return request<Specialist[]>('/specialists');
}

export const specialistsSearchApi = {
  getSpecialists(): Promise<Specialist[]> {
    return USE_MOCK ? mockGetSpecialists() : realGetSpecialists();
  },
};