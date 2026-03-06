//src/features/specialists-search/service/specialistsGeoService.ts
import {
    specialistsGeoApi,
    type GeoPoint,
    type GeoSuggestItem,
} from '../api/specialistsGeoApi';

export const specialistsGeoService = {
    async suggestCities(query: string): Promise<GeoSuggestItem[]> {
        return specialistsGeoApi.suggestCities(query);
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