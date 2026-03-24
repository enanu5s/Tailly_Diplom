// src/features/specialists-search/api/specialistsGeoApi.mock.ts

import {
  buildDirect2GisUrl,
  type GeocodeResponse,
  dedupeSuggestItems,
  type GeoPoint,
  type GeoSuggestItem,
  isLocalitySuggestItem,
  normalizeSuggestItems,
  type SuggestResponse,
} from '../data/mockSpecialistsGeo';

const MAPS_API_KEY = import.meta.env.VITE_2GIS_API_KEY ?? '';

async function requestJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(errorText || `HTTP ${response.status}`);
  }

  return (await response.json()) as T;
}

const SUGGEST_FIELDS =
  'items.point,items.name,items.full_name,items.type,items.subtype,items.id';

async function requestSuggest(query: string): Promise<SuggestResponse> {
  const params = new URLSearchParams({
    q: query.trim(),
    suggest_type: 'address',
    fields: SUGGEST_FIELDS,
    key: MAPS_API_KEY,
    locale: 'ru_RU',
  });

  const url = buildDirect2GisUrl('/3.0/suggests', params);

  return requestJson<SuggestResponse>(url);
}

async function requestSuggestLocalities(query: string): Promise<SuggestResponse> {
  const params = new URLSearchParams({
    q: query.trim(),
    suggest_type: 'address',
    fields: SUGGEST_FIELDS,
    key: MAPS_API_KEY,
    locale: 'ru_RU',
    type: 'adm_div.city,adm_div.settlement,adm_div.place',
  });

  const url = buildDirect2GisUrl('/3.0/suggests', params);

  return requestJson<SuggestResponse>(url);
}

async function requestGeocode(query: string): Promise<GeocodeResponse> {
  const params = new URLSearchParams({
    q: query.trim(),
    fields: 'items.point',
    key: MAPS_API_KEY,
    locale: 'ru_RU',
    type: 'adm_div.city,adm_div.settlement,adm_div.place,adm_div.district',
  });

  const url = buildDirect2GisUrl('/3.0/items/geocode', params);

  return requestJson<GeocodeResponse>(url);
}

export const specialistsGeoMockApi = {
  async suggestCities(query: string): Promise<GeoSuggestItem[]> {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length < 2) {
      return [];
    }

    if (!MAPS_API_KEY) {
      throw new Error('VITE_2GIS_API_KEY is not set');
    }

    const data = await requestSuggest(normalizedQuery);

    if (data?.meta?.code !== 200 || !Array.isArray(data?.result?.items)) {
      return [];
    }

    const normalized = normalizeSuggestItems(data.result.items);

    return dedupeSuggestItems(normalized).slice(0, 8);
  },

  async suggestLocalities(query: string): Promise<GeoSuggestItem[]> {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length < 2) {
      return [];
    }

    if (!MAPS_API_KEY) {
      throw new Error('VITE_2GIS_API_KEY is not set');
    }

    let data: SuggestResponse;

    try {
      data = await requestSuggestLocalities(normalizedQuery);
    } catch {
      data = await requestSuggest(normalizedQuery);
    }

    if (data?.meta?.code !== 200 || !Array.isArray(data?.result?.items)) {
      return [];
    }

    const normalized = normalizeSuggestItems(data.result.items);
    const localities = normalized.filter(isLocalitySuggestItem);

    return dedupeSuggestItems(localities).slice(0, 12);
  },

  async geocodeLocation(query: string): Promise<GeoPoint | null> {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      return null;
    }

    if (!MAPS_API_KEY) {
      throw new Error('VITE_2GIS_API_KEY is not set');
    }

    const data = await requestGeocode(normalizedQuery);
    const point = data?.result?.items?.[0]?.point;

    if (typeof point?.lon === 'number' && typeof point?.lat === 'number') {
      return {
        lon: point.lon,
        lat: point.lat,
      };
    }

    return null;
  },

  async suggestDistricts(
    districtQuery: string,
    cityQuery?: string,
  ): Promise<GeoSuggestItem[]> {
    const normalizedDistrictQuery = districtQuery.trim();
    const normalizedCityQuery = cityQuery?.trim() ?? '';

    if (normalizedDistrictQuery.length < 2) {
      return [];
    }

    if (!MAPS_API_KEY) {
      throw new Error('VITE_2GIS_API_KEY is not set');
    }

    const compositeQuery = normalizedCityQuery
      ? `${normalizedCityQuery}, ${normalizedDistrictQuery}`
      : normalizedDistrictQuery;

    const data = await requestSuggest(compositeQuery);

    if (data?.meta?.code !== 200 || !Array.isArray(data?.result?.items)) {
      return [];
    }

    const normalized = normalizeSuggestItems(data.result.items);

    return dedupeSuggestItems(normalized).slice(0, 8);
  },

  async geocodeCity(query: string): Promise<GeoPoint | null> {
    return this.geocodeLocation(query);
  },
};