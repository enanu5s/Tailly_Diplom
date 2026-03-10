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

export type SpecialistCalendar = {
    bookedDates: string[];
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
    petGallery: SpecialistGalleryItem[];
    details: SpecialistDetails;
    services: SpecialistService[];
    reviews: SpecialistReview[];
};

export type SpecialistProfileResponse = SpecialistProfile;