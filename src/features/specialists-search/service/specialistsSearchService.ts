//src/features/specialists-search/service/specialistsSearchService.ts

import type { Specialist } from '../model/types';
import { specialistsSearchApi } from '../api/specialistsSearchApi';

export const specialistsSearchService = {
  async getSpecialists(): Promise<Specialist[]> {
    return specialistsSearchApi.getSpecialists();
  },
};