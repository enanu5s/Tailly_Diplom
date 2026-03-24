// src/features/specialists-search/api/specialistsSearchApi.ts

import { request } from '@/shared/api/http';
import { isMockApiMode } from '@/shared/config/env';

import { mockGetSpecialists } from './specialistsSearchApi.mock';

import type { Specialist } from '../model/types';

/* REAL */
async function realGetSpecialists(): Promise<Specialist[]> {
  return request<Specialist[]>('/specialists');
}

export const specialistsSearchApi = {
  getSpecialists(): Promise<Specialist[]> {
    return isMockApiMode ? mockGetSpecialists() : realGetSpecialists();
  },
};
