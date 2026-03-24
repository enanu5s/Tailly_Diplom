//src/features/specialists-search/service/specialistsGeoService.ts
import {
  specialistsGeoApi,
  type GeoPoint,
  type GeoSuggestItem,
} from '../api/specialistsGeoApi';
import { buildLocalityFallbackId } from '../data/mockSpecialistsGeo';

export const specialistsGeoService = {
  async suggestCities(query: string): Promise<GeoSuggestItem[]> {
    return specialistsGeoApi.suggestCities(query);
  },

  async suggestLocalities(query: string): Promise<GeoSuggestItem[]> {
    return specialistsGeoApi.suggestLocalities(query);
  },

  localityToCityId(item: GeoSuggestItem): string {
    return buildLocalityFallbackId(item);
  },

  async suggestDistricts(
    districtQuery: string,
    cityQuery?: string,
  ): Promise<GeoSuggestItem[]> {
    return specialistsGeoApi.suggestDistricts(districtQuery, cityQuery);
  },

  async geocodeCity(query: string): Promise<GeoPoint | null> {
    return specialistsGeoApi.geocodeCity(query);
  },
  async geocodeLocation(query: string): Promise<GeoPoint | null> {
    return specialistsGeoApi.geocodeLocation(query);
  },
};
