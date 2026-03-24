//src/features/specialists-search/model/specialistsSearchStore.ts
import { makeAutoObservable, runInAction } from 'mobx';

import type { ServiceId } from '@/shared/config/services';

import { servicesSearchPersist } from './persist';
import { specialistsSearchService } from '../service/specialistsSearchService';

import type {
  Specialist,
  SearchFilters,
  ViewMode,
  MapBounds,
  SortMode,
  PetType,
} from './types';

function defaultFilters(): SearchFilters {
  return {
    cityQuery: '',
    districtQuery: '',
    dateRange: { from: null, to: null },
    petType: 'any',
    serviceId: 'any',
    priceMin: null,
    priceMax: null,
    experienceMinYears: null,
    hasReviewsOnly: false,
  };
}

function clampNumber(n: number, min: number, max: number) {
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

function getServicePriceFor(
  sp: Specialist,
  serviceId: ServiceId | 'any',
  petType: PetType | 'any',
): number | null {
  const services = sp.services.filter((s) => {
    if (serviceId !== 'any' && s.serviceId !== serviceId) return false;
    if (petType !== 'any' && !s.petTypes.includes(petType)) return false;
    return true;
  });

  if (services.length === 0) return null;
  return Math.min(...services.map((s) => s.priceFrom));
}

function inBounds(bounds: MapBounds, p: { lat: number; lon: number }) {
  return (
    p.lat >= bounds.sw.lat &&
    p.lat <= bounds.ne.lat &&
    p.lon >= bounds.sw.lon &&
    p.lon <= bounds.ne.lon
  );
}

export class SpecialistsSearchStore {
  all: Specialist[] = [];
  loading = false;
  error: string | null = null;

  filters: SearchFilters = defaultFilters();
  viewMode: ViewMode = 'list';

  originMode: 'filter' | 'geo' = 'filter';

  sortMode: SortMode = 'rating';

  mapBounds: MapBounds | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  get filtered(): Specialist[] {
    const f = this.filters;

    let items = this.all.slice();

    // city/district filtering (простое contains, позже можно улучшить)
    if (f.cityQuery.trim()) {
      const q = f.cityQuery.trim().toLowerCase();
      items = items.filter((sp) => sp.city.toLowerCase().includes(q));
    }
    if (f.districtQuery.trim()) {
      const q = f.districtQuery.trim().toLowerCase();
      items = items.filter((sp) => sp.district.toLowerCase().includes(q));
    }

    // experience
    if (f.experienceMinYears != null) {
      items = items.filter((sp) => sp.experienceYears >= f.experienceMinYears!);
    }

    // reviews
    if (f.hasReviewsOnly) {
      items = items.filter((sp) => sp.reviewsCount > 0);
    }

    // service + petType + price
    items = items.filter((sp) => {
      const price = getServicePriceFor(sp, f.serviceId, f.petType);
      if (price == null) return false;

      if (f.priceMin != null && price < f.priceMin) return false;
      if (f.priceMax != null && price > f.priceMax) return false;

      return true;
    });

    // map bounds (только в режиме карты)
    if (this.viewMode === 'map' && this.mapBounds) {
      items = items.filter((sp) => inBounds(this.mapBounds!, sp.location));
    }

    // sorting
    items.sort((a, b) => {
      if (this.sortMode === 'rating') {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return b.reviewsCount - a.reviewsCount;
      }

      // price
      const pa =
        getServicePriceFor(a, f.serviceId, f.petType) ?? Number.POSITIVE_INFINITY;
      const pb =
        getServicePriceFor(b, f.serviceId, f.petType) ?? Number.POSITIVE_INFINITY;
      return pa - pb;
    });

    return items;
  }

  get foundCount() {
    return this.filtered.length;
  }
  async load(params?: { initialServiceId?: ServiceId | null }) {
    this.loading = true;
    this.error = null;

    // 1️⃣ сначала загружаем persisted
    const persisted = servicesSearchPersist.load();

    if (persisted) {
      runInAction(() => {
        this.filters = persisted.filters;
        this.viewMode = persisted.viewMode;
        this.mapBounds = persisted.mapBounds;

        this.sortMode = persisted.sortMode;
      });
    }

    // 2️⃣ если пришли с выбранной услугой — приоритетно ставим её
    if (params?.initialServiceId) {
      runInAction(() => {
        this.filters = {
          ...this.filters,
          serviceId: params.initialServiceId!,
        };
      });
    }

    try {
      const list = await specialistsSearchService.getSpecialists();
      runInAction(() => {
        this.all = list;
        this.loading = false;
      });
    } catch (e) {
      runInAction(() => {
        this.loading = false;
        this.error = e instanceof Error ? e.message : 'Ошибка загрузки специалистов';
      });
    }
  }

  setViewMode(mode: ViewMode) {
    this.viewMode = mode;
    // в режиме карты сортировку не показываем, но значение оставляем
    this.persist(0);
  }

  setSortMode(mode: SortMode) {
    this.sortMode = mode;
    this.persist(0);
  }

  updateFilters(patch: Partial<SearchFilters>) {
    // price min/max адекватно
    const next: SearchFilters = { ...this.filters, ...patch };

    if (next.priceMin != null) next.priceMin = clampNumber(next.priceMin, 0, 100000);
    if (next.priceMax != null) next.priceMax = clampNumber(next.priceMax, 0, 100000);

    this.filters = next;
    this.persist(0);
  }

  setMapBounds(bounds: MapBounds | null) {
    this.mapBounds = bounds;
    this.persist(0);
  }

  persist(scrollY: number) {
    servicesSearchPersist.save({
      filters: this.filters,
      viewMode: this.viewMode,
      scrollY,
      mapBounds: this.mapBounds,
      sortMode: this.sortMode,
    });
  }

  restoreScrollIfAny() {
    const persisted = servicesSearchPersist.load();
    if (!persisted) return;

    const y = persisted.scrollY ?? 0;
    // откладываем до отрисовки
    requestAnimationFrame(() => {
      window.scrollTo({ top: y, behavior: 'auto' });
    });
  }
}
