//src/features/specialists-search/model/persist.ts

import type { MapBounds, SearchFilters, SortMode, ViewMode } from './types';

export type PersistedServicesSearchState = {
  filters: SearchFilters;
  viewMode: ViewMode;
  scrollY: number;
  mapBounds: MapBounds | null;
  sortMode: SortMode;
};

const KEY = 'tailly:servicesSearchState:v1';

export const servicesSearchPersist = {
  load(): PersistedServicesSearchState | null {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (!raw) return null;
      return JSON.parse(raw) as PersistedServicesSearchState;
    } catch {
      return null;
    }
  },

  save(state: PersistedServicesSearchState) {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  },

  clear() {
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      // ignore
    }
  },
};
