// src/features/specialist-profile/model/types.ts

export type SpecialistHousingType =
    | 'apartment'
    | 'house'
    | 'townhouse'
    | 'other';

export type SpecialistPetSize =
    | 'small'
    | 'medium'
    | 'large'
    | 'giant';

export type SpecialistPetAge =
    | 'baby'
    | 'young'
    | 'adult'
    | 'senior';

export type SpecialistChildrenPolicy =
    | 'yes'
    | 'no'
    | 'sometimes';

export type SpecialistPetType =
    | 'cat'
    | 'dog'
    | 'rodent'
    | 'rabbit'
    | 'bird'
    | 'fish'
    | 'reptile'
    | 'other';

export type SpecialistServicePriceUnit =
    | 'hour'
    | 'day'
    | 'service'
    | 'walk'
    | 'visit';

export type SpecialistExperienceUnit = 'years' | 'months';

export type SpecialistMainInfo = {
    avatarUrl?: string;
    firstName: string;
    lastName: string;
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

export type SpecialistCalendarBookedSlot = {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    serviceIds: string[];
};

export type SpecialistCalendarAvailabilityWindow = {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    serviceIds: string[];
    comment?: string;
};

export type SpecialistCalendar = {
    timezone: string;
    dayOverrides: SpecialistCalendarDayOverride[];
    bookedSlots: SpecialistCalendarBookedSlot[];
    availabilityWindows: SpecialistCalendarAvailabilityWindow[];
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

export type SpecialistService = {
    id: string;
    name: string;
    locationLabel: string;
    price: number;
    priceUnit: SpecialistServicePriceUnit;
};

export type SpecialistReviewReply = {
    text: string;
    createdAt: string;
};

export type SpecialistReview = {
    id: string;
    authorName: string;
    petName?: string;
    rating: 1 | 2 | 3 | 4 | 5;
    createdAt: string;
    text: string;
    specialistReply?: SpecialistReviewReply;
};

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
};