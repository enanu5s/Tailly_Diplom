//src/features/specialists-search/service/specialistsSearchService.ts

import { specialistsSearchApi } from '../api/specialistsSearchApi';

import type { Specialist } from '../model/types';

export const specialistsSearchService = {
  async getSpecialists(): Promise<Specialist[]> {
    return specialistsSearchApi.getSpecialists();
  },
};