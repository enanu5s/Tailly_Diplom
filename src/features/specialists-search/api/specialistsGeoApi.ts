// src/features/specialists-search/api/specialistsGeoApi.ts

import { get2GisApiKey, isMockApiMode } from '@/shared/config/env';

import { specialistsGeoMockApi } from './specialistsGeoApi.mock';

import type { GeoPoint, GeoSuggestItem } from '../data/mockSpecialistsGeo';

const MAPS_API_KEY = get2GisApiKey();

async function realSuggestCities(query: string): Promise<GeoSuggestItem[]> {
  return specialistsGeoMockApi.suggestCities(query);
}

async function realSuggestLocalities(query: string): Promise<GeoSuggestItem[]> {
  return specialistsGeoMockApi.suggestLocalities(query);
}

async function realGeocodeLocation(query: string): Promise<GeoPoint | null> {
  return specialistsGeoMockApi.geocodeLocation(query);
}

async function realSuggestDistricts(
  districtQuery: string,
  cityQuery?: string,
): Promise<GeoSuggestItem[]> {
  return specialistsGeoMockApi.suggestDistricts(districtQuery, cityQuery);
}

async function realGeocodeCity(query: string): Promise<GeoPoint | null> {
  return specialistsGeoMockApi.geocodeCity(query);
}

export const specialistsGeoApi = {
  async suggestCities(query: string): Promise<GeoSuggestItem[]> {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length < 2) {
      return [];
    }

    if (!MAPS_API_KEY) {
      throw new Error('VITE_2GIS_API_KEY is not set');
    }

    if (isMockApiMode) {
      return specialistsGeoMockApi.suggestCities(normalizedQuery);
    }

    return realSuggestCities(normalizedQuery);
  },

  async suggestLocalities(query: string): Promise<GeoSuggestItem[]> {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length < 2) {
      return [];
    }

    if (!MAPS_API_KEY) {
      throw new Error('VITE_2GIS_API_KEY is not set');
    }

    if (isMockApiMode) {
      return specialistsGeoMockApi.suggestLocalities(normalizedQuery);
    }

    return realSuggestLocalities(normalizedQuery);
  },

  async geocodeLocation(query: string): Promise<GeoPoint | null> {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      return null;
    }

    if (!MAPS_API_KEY) {
      throw new Error('VITE_2GIS_API_KEY is not set');
    }

    if (isMockApiMode) {
      return specialistsGeoMockApi.geocodeLocation(normalizedQuery);
    }

    return realGeocodeLocation(normalizedQuery);
  },

  async suggestDistricts(
    districtQuery: string,
    cityQuery?: string,
  ): Promise<GeoSuggestItem[]> {
    const normalizedDistrictQuery = districtQuery.trim();

    if (normalizedDistrictQuery.length < 2) {
      return [];
    }

    if (!MAPS_API_KEY) {
      throw new Error('VITE_2GIS_API_KEY is not set');
    }

    if (isMockApiMode) {
      return specialistsGeoMockApi.suggestDistricts(normalizedDistrictQuery, cityQuery);
    }

    return realSuggestDistricts(normalizedDistrictQuery, cityQuery);
  },

  async geocodeCity(query: string): Promise<GeoPoint | null> {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      return null;
    }

    if (!MAPS_API_KEY) {
      throw new Error('VITE_2GIS_API_KEY is not set');
    }

    if (isMockApiMode) {
      return specialistsGeoMockApi.geocodeCity(normalizedQuery);
    }

    return realGeocodeCity(normalizedQuery);
  },
};

export type { GeoPoint, GeoSuggestItem };
