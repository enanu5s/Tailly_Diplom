// src/features/specialists-search/api/specialistsSearchApi.mock.ts

import type { Specialist } from '../model/types';

import { cloneSpecialists } from '../data/mockSpecialists';

export async function mockGetSpecialists(): Promise<Specialist[]> {
  return cloneSpecialists();
}