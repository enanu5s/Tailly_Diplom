//src/features/specialists-search/model/types.ts

import type { ServiceId } from '@/shared/config/services';

export type PetType = 'dog' | 'cat' | 'other';

export type SortMode = 'rating' | 'price';

export type SpecialistService = {
  serviceId: ServiceId | 'any';
  petTypes: PetType[];
  priceFrom: number;
  priceTo?: number;
};

export type GeoPoint = { lat: number; lon: number };

export type Specialist = {
  id: string;
  name: string;
  avatarUrl: string | null;
  city: string;
  district: string;
  description: string;
  rating: number;
  reviewsCount: number;
  experienceYears: number;
  location: GeoPoint;
  services: SpecialistService[];
};

export type DateRange = {
  from: string | null; // ISO yyyy-mm-dd
  to: string | null;   // ISO yyyy-mm-dd
};

export type ViewMode = 'list' | 'map';

export type SearchFilters = {
  cityQuery: string;
  districtQuery: string;

  dateRange: DateRange;

  petType: PetType | 'any';
  serviceId: ServiceId | 'any';

  priceMin: number | null;
  priceMax: number | null;

  experienceMinYears: number | null;
  hasReviewsOnly: boolean;
};

export type MapBounds = {
  // lat/lon bounds: SW & NE
  sw: GeoPoint;
  ne: GeoPoint;
};