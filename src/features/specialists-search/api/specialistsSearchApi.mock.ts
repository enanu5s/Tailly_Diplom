// src/features/specialists-search/api/specialistsSearchApi.mock.ts

import { cloneSpecialists } from '../data/mockSpecialists';

import type { Specialist } from '../model/types';


export async function mockGetSpecialists(): Promise<Specialist[]> {
  return cloneSpecialists();
}