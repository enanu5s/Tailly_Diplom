// /src/features/specialists-search/model/types.ts
import type { PetType } from '@/features/pets/model/types';
import type { ServiceId } from '@/shared/config/services';

export type { PetType } from '@/features/pets/model/types';
export type { ServiceId } from '@/shared/config/services';

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

/** Категория веса питомца (фильтр и мок-данные специалиста) */
export type PetSizeCategory = 'under_2' | '2_to_8' | '8_15' | '15_25' | 'over_25';

/** Категория возраста питомца (фильтр и мок-данные специалиста) */
export type PetAgeCategory = 'under_6mo' | '6mo_to_2' | '2_to_5' | 'over_5';

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
  /** Мок: с какими категориями веса питомца работает; не задано — любые */
  petSizeCategories?: PetSizeCategory[];
  /** Мок: с какими возрастными категориями работает; не задано — любые */
  petAgeCategories?: PetAgeCategory[];
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
  /** Доп. фильтры: пустой массив — любой размер */
  petSizes: PetSizeCategory[];
  /** Пустой массив — любой возраст */
  petAges: PetAgeCategory[];
  experienceMinYears: number | null;
  hasReviewsOnly: boolean;
};

export type MapBounds = {
  sw: GeoPoint;
  ne: GeoPoint;
};
