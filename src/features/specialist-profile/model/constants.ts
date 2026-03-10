// src/features/specialist-profile/model/constants.ts

import type {
    SpecialistChildrenPolicy,
    SpecialistExperienceUnit,
    SpecialistHousingType,
    SpecialistPetAge,
    SpecialistPetSize,
    SpecialistPetType,
    SpecialistServicePriceUnit,
} from './types';

export const SPECIALIST_HOUSING_TYPE_LABELS: Record<SpecialistHousingType, string> = {
    apartment: 'Квартира',
    house: 'Частный дом',
    townhouse: 'Таунхаус',
    other: 'Другое',
};

export const SPECIALIST_PET_SIZE_LABELS: Record<SpecialistPetSize, string> = {
    small: 'Маленькие',
    medium: 'Средние',
    large: 'Крупные',
    giant: 'Очень крупные',
};

export const SPECIALIST_PET_AGE_LABELS: Record<SpecialistPetAge, string> = {
    baby: 'Малыши',
    young: 'Молодые',
    adult: 'Взрослые',
    senior: 'Пожилые',
};

export const SPECIALIST_CHILDREN_POLICY_LABELS: Record<SpecialistChildrenPolicy, string> = {
    yes: 'Да',
    no: 'Нет',
    sometimes: 'Иногда',
};

export const SPECIALIST_PET_TYPE_LABELS: Record<SpecialistPetType, string> = {
    cat: 'Кошки',
    dog: 'Собаки',
    rodent: 'Грызуны',
    rabbit: 'Кролики',
    bird: 'Птицы',
    fish: 'Рыбы',
    reptile: 'Рептилии',
    other: 'Другие',
};

export const SPECIALIST_SERVICE_PRICE_UNIT_LABELS: Record<SpecialistServicePriceUnit, string> = {
    hour: 'за час',
    day: 'за сутки',
    service: 'за услугу',
    walk: 'за прогулку',
    visit: 'за визит',
};

export const SPECIALIST_EXPERIENCE_UNIT_LABELS: Record<SpecialistExperienceUnit, string> = {
    years: 'лет',
    months: 'месяцев',
};

export const SPECIALIST_ADVANTAGE_OPTIONS = [
    'Беру только одного клиента одновременно',
    'Ежедневный фото- и видеоотчёт',
    'Опыт с тревожными питомцами',
    'Опыт с пожилыми питомцами',
    'Умею давать лекарства',
    'Есть базовые знания по уходу после операций',
    'Готова к длительным прогулкам',
    'Работаю с кошками и собаками',
    'Есть опыт передержки на дому',
    'Спокойная домашняя обстановка',
] as const;

export type SpecialistAdvantageOption = (typeof SPECIALIST_ADVANTAGE_OPTIONS)[number];