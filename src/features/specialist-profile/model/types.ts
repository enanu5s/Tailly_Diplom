//src/features/specialist-profile/model/types.ts

import type { PetSize, PetType } from '@/features/pets/model/types';

export type SpecialistHousingType = 'apartment' | 'house' | 'townhouse' | 'other';

/** Масса питомца, кг (те же диапазоны, что в карточке питомца клиента). */
export type SpecialistPetSize = PetSize;

export type SpecialistPetAge = 'baby' | 'young' | 'adult' | 'senior';

export type SpecialistChildrenPolicy = 'yes' | 'no' | 'sometimes';

export type SpecialistPetType = PetType;

export type SpecialistServicePriceUnit = 'hour' | 'day' | 'service' | 'walk' | 'visit';

export type SpecialistExperienceUnit = 'years' | 'months';

export type SpecialistBookingMode =
  | 'fixed_slot'
  | 'time_range'
  | 'multi_day_stay'
  | 'open_request';

export type SpecialistRecurrenceFrequency =
  | 'daily'
  | 'weekly'
  | 'every_n_days'
  | 'every_n_weeks';

export type SpecialistOccurrenceEditScope = 'single' | 'this_and_future';

export type SpecialistMainInfo = {
  avatarUrl?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  city: string;
  district: string;
  phone: string;
  email: string;
};

export type SpecialistStats = {
  experienceYears: number;
  rating: number;
  reviewsCount: number;
  completedOrdersCount: number;
  repeatOrdersCount: number;
};

export type SpecialistCalendarDayStatus =
  | 'available'
  | 'partially_booked'
  | 'fully_booked'
  | 'day_off';

export type SpecialistCalendarDayOverride = {
  date: string;
  status: Exclude<SpecialistCalendarDayStatus, 'partially_booked'>;
};

export type SpecialistServiceDurationPolicy = {
  defaultDurationMinutes?: number;
  minDurationMinutes?: number;
  maxDurationMinutes?: number;
  durationStepMinutes?: number;
};

export type SpecialistServiceBufferPolicy = {
  hasBufferBefore: boolean;
  bufferBeforeMinutes: number;
  hasBufferAfter: boolean;
  bufferAfterMinutes: number;
};

export type SpecialistServiceCompatibilityPolicy = {
  canOverlapWithOtherServices: boolean;
  compatibleServiceIds: string[];
};

export type SpecialistServiceAdvancePolicy = {
  minAdvanceMinutes?: number;
  maxAdvanceDays?: number;
};

export type SpecialistServiceMultiDayPolicy = {
  allowsMultiDayBooking: boolean;
  minStayDays?: number;
  maxStayDays?: number;
  checkInTime?: string;
  checkOutTime?: string;
};

export type SpecialistServiceBookingPolicy = {
  mode: SpecialistBookingMode;
  duration: SpecialistServiceDurationPolicy;
  buffer: SpecialistServiceBufferPolicy;
  compatibility: SpecialistServiceCompatibilityPolicy;
  advance: SpecialistServiceAdvancePolicy;
  multiDay?: SpecialistServiceMultiDayPolicy;
  allowsClientComment: boolean;
  requiresSpecialistConfirmation: boolean;
};

export type SpecialistService = {
  id: string;
  name: string;
  locationLabel: string;
  price: number;
  priceUnit: SpecialistServicePriceUnit;
  bookingPolicy?: SpecialistServiceBookingPolicy;
};

export type SpecialistCalendarBookedSlot = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  serviceIds: string[];
  orderId?: string;
  bufferBeforeMinutes?: number;
  bufferAfterMinutes?: number;
};

export type SpecialistCalendarAvailabilityWindow = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  serviceIds: string[];
  comment?: string;
};

export type SpecialistCalendarBookingSettings = {
  dayStartTime: string;
  dayEndTime: string;
  slotStepMinutes: number;
  defaultDurationMinutes: number;
};

export type SpecialistAvailabilityRecurrenceRule = {
  frequency: SpecialistRecurrenceFrequency;
  interval: number;
  weekDays?: number[];
  occurrencesCount?: number;
  untilDate?: string;
};

export type SpecialistCalendarAvailabilityRule = {
  id: string;
  title: string;
  serviceIds: string[];
  startDate: string;
  endDate?: string;
  startTime: string;
  endTime: string;
  recurrence?: SpecialistAvailabilityRecurrenceRule;
  isEnabled: boolean;
  comment?: string;
};

export type SpecialistCalendarAvailabilityOverride = {
  id: string;
  targetDate: string;
  editScope: SpecialistOccurrenceEditScope;
  sourceRuleId?: string;
  serviceIds?: string[];
  startTime?: string;
  endTime?: string;
  removeAvailability?: boolean;
  comment?: string;
};

export type SpecialistCalendar = {
  timezone: string;
  dayOverrides: SpecialistCalendarDayOverride[];
  bookedSlots: SpecialistCalendarBookedSlot[];
  availabilityWindows: SpecialistCalendarAvailabilityWindow[];
  bookingSettings?: SpecialistCalendarBookingSettings;
  availabilityRules?: SpecialistCalendarAvailabilityRule[];
  availabilityOverrides?: SpecialistCalendarAvailabilityOverride[];
};

export type SpecialistGalleryItem = {
  id: string;
  imageUrl: string;
  alt: string;
};

export type SpecialistAdvantage = {
  id: string;
  title: string;
};

export type SpecialistReviewReply = {
  text: string;
  createdAt: string;
};

export type SpecialistReview = {
  id: string;
  /** Заказ, к которому привязан отзыв (для перехода из кабинета специалиста). */
  orderId?: string;
  /** Подпись услуги без запроса к API заказов. */
  serviceTitle?: string;
  authorName: string;
  petName?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  createdAt: string;
  text: string;
  specialistReply?: SpecialistReviewReply;
};

/** Фильтр по оценке в списке отзывов (профиль / управление ответами). */
export type SpecialistReviewsRatingFilter = 'all' | 1 | 2 | 3 | 4 | 5;

/** Фильтр по наличию ответа специалиста. */
export type SpecialistReviewsReplyFilter = 'all' | 'with_reply' | 'without_reply';

export type SpecialistDetails = {
  experienceLabel: string;
  experienceDurationValue?: number;
  experienceDurationUnit?: SpecialistExperienceUnit;
  housingType: SpecialistHousingType;
  petSizes: SpecialistPetSize[];
  petAges: SpecialistPetAge[];
  hasChildrenUnderTen: SpecialistChildrenPolicy;
  petTypes: SpecialistPetType[];
  advantages: SpecialistAdvantage[];
  about: string;
};

export type SpecialistProfile = {
  id: string;
  slug: string;
  isOwner: boolean;
  main: SpecialistMainInfo;
  stats: SpecialistStats;
  calendar: SpecialistCalendar;
  specialistGallery?: SpecialistGalleryItem[];
  petGallery: SpecialistGalleryItem[];
  details: SpecialistDetails;
  services: SpecialistService[];
  reviews: SpecialistReview[];
};

export type SpecialistProfileResponse = Omit<SpecialistProfile, 'isOwner'>;

export type SpecialistMainInfoUpdatePayload = {
  avatarUrl?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  city: string;
  district: string;
  phone: string;
};

export type SpecialistServiceUpdateItem = {
  id: string;
  name: string;
  locationLabel: string;
  price: number;
  priceUnit: SpecialistServicePriceUnit;
  bookingPolicy?: SpecialistServiceBookingPolicy;
};

export type SpecialistDetailsUpdatePayload = {
  experienceLabel: string;
  experienceDurationValue?: number;
  experienceDurationUnit?: SpecialistExperienceUnit;
  housingType: SpecialistHousingType;
  petSizes: SpecialistPetSize[];
  petAges: SpecialistPetAge[];
  hasChildrenUnderTen: SpecialistChildrenPolicy;
  petTypes: SpecialistPetType[];
  advantages: string[];
  about: string;
  services: SpecialistServiceUpdateItem[];
  specialistGallery?: SpecialistGalleryItem[];
};

export type SpecialistCalendarUpdatePayload = {
  timezone: string;
  dayOverrides: SpecialistCalendarDayOverride[];
  availabilityWindows: SpecialistCalendarAvailabilityWindow[];
  bookingSettings: SpecialistCalendarBookingSettings;
  availabilityRules?: SpecialistCalendarAvailabilityRule[];
  availabilityOverrides?: SpecialistCalendarAvailabilityOverride[];
};

export type SpecialistReviewReplyUpsertPayload = {
  reviewId: string;
  text: string;
};
