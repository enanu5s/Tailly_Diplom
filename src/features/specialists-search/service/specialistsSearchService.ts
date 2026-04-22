//src/features/specialists-search/service/specialistsSearchService.ts

import { specialistsSearchApi } from '../api/specialistsSearchApi';

import type { SearchFilters, Specialist } from '../model/types';

export const specialistsSearchService = {
  async getSpecialists(filters?: Partial<SearchFilters>): Promise<Specialist[]> {
    return specialistsSearchApi.getSpecialists(filters);
  },
};
