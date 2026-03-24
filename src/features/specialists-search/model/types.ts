// /src/features/specialists-search/model/types.ts
import type { ServiceId } from '@/shared/config/services';

export type { ServiceId } from '@/shared/config/services';

export type PetType = 'dog' | 'cat' | 'other';

export type SortMode = 'rating' | 'price';

export type SpecialistService = {
  serviceId: ServiceId | 'any';
  petTypes: PetType[];
  priceFrom: number;
  priceTo?: number;
  /** Типовая длительность услуги, мин (мок / превью) */
  durationMinutes?: number;
  /** Пояснение для карточки или отладки */
  note?: string;
};

/** Слот в мок-календаре специалиста (свободный или занятый) */
export type SpecialistCalendarSlot = {
  date: string;
  startTime: string;
  endTime: string;
  kind: 'available' | 'booked';
  serviceId?: ServiceId;
  title?: string;
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
  /**
   * Дни недели (0=вс … 6=сб), когда есть хотя бы одно окно для записи по услугам.
   * Если не задано или пусто — при фильтре по датам специалист не отбрасывается (нет данных).
   */
  availabilityWeekdays?: number[];
  /** Мок: окна на ближайшие дни (свободные и занятые) — для превью и отладки */
  calendarSlots?: SpecialistCalendarSlot[];
};

export type DateRange = {
  from: string | null;
  to: string | null;
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
  sw: GeoPoint;
  ne: GeoPoint;
};
