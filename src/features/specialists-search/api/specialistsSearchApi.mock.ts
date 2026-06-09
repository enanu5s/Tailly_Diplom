// src/features/specialists-search/api/specialistsSearchApi.mock.ts

import { cloneSpecialistListing } from '@/shared/mock-db/accessors';

import type { SearchFilters, Specialist } from '../model/types';

function includesQuery(source: string, query?: string): boolean {
  const normalizedQuery = (query ?? '').trim().toLowerCase();
  if (!normalizedQuery) {
    return true;
  }

  return source.toLowerCase().includes(normalizedQuery);
}

function matchesService(
  specialist: Specialist,
  serviceId: SearchFilters['serviceId'] | undefined,
): boolean {
  if (!serviceId || serviceId === 'any') {
    return true;
  }

  return specialist.services.some((service) => service.serviceId === serviceId);
}

function matchesPetSize(
  specialist: Specialist,
  selected: SearchFilters['petSizes'] | undefined,
): boolean {
  if (!selected || selected.length === 0) {
    return true;
  }

  const cats = specialist.petSizeCategories;
  if (!cats || cats.length === 0) {
    return true;
  }

  return selected.some((s) => cats.includes(s));
}

function matchesPetAge(
  specialist: Specialist,
  selected: SearchFilters['petAges'] | undefined,
): boolean {
  if (!selected || selected.length === 0) {
    return true;
  }

  const cats = specialist.petAgeCategories;
  if (!cats || cats.length === 0) {
    return true;
  }

  return selected.some((s) => cats.includes(s));
}

function matchesPrice(
  specialist: Specialist,
  minPrice: number | null | undefined,
  maxPrice: number | null | undefined,
): boolean {
  const relevantServices = specialist.services;
  if (relevantServices.length === 0) {
    return false;
  }

  const min = typeof minPrice === 'number' ? minPrice : null;
  const max = typeof maxPrice === 'number' ? maxPrice : null;

  return relevantServices.some((service) => {
    const serviceMin = service.priceFrom;
    const serviceMax = service.priceTo ?? service.priceFrom;

    if (min !== null && serviceMax < min) {
      return false;
    }

    if (max !== null && serviceMin > max) {
      return false;
    }

    return true;
  });
}

export async function mockGetSpecialists(
  filters?: Partial<SearchFilters>,
): Promise<Specialist[]> {
  const specialists = cloneSpecialistListing();

  return specialists.filter((specialist) => {
    if (!includesQuery(specialist.city, filters?.cityQuery)) {
      return false;
    }

    if (!includesQuery(specialist.district, filters?.districtQuery)) {
      return false;
    }

    if (!matchesService(specialist, filters?.serviceId)) {
      return false;
    }

    if (!matchesPrice(specialist, filters?.priceMin, filters?.priceMax)) {
      return false;
    }

    if (
      typeof filters?.experienceMinYears === 'number' &&
      specialist.experienceYears < filters.experienceMinYears
    ) {
      return false;
    }

    if (!matchesPetSize(specialist, filters?.petSizes)) {
      return false;
    }

    if (!matchesPetAge(specialist, filters?.petAges)) {
      return false;
    }

    if (filters?.hasReviewsOnly && specialist.reviewsCount <= 0) {
      return false;
    }

    return true;
  });
}
