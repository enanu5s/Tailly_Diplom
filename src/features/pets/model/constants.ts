// src/features/pets/model/constants.ts

import type { PetSize, PetType } from './types';

/** Порядок в селектах профиля специалиста и фильтрах. */
export const PET_TYPES: readonly PetType[] = [
  'dog',
  'cat',
  'bird',
  'rodent',
  'rabbit',
  'reptile',
  'fish',
  'amphibian',
] as const;

export const PET_TYPE_LABELS: Record<PetType, string> = {
  dog: 'Собаки',
  cat: 'Кошки',
  bird: 'Птицы',
  rodent: 'Грызуны',
  rabbit: 'Кролики',
  reptile: 'Рептилии',
  fish: 'Рыбы',
  amphibian: 'Амфибии',
};

/** Единственное число — для фильтров поиска и формы «тип питомца». */
export const PET_TYPE_SHORT_LABELS: Record<PetType, string> = {
  dog: 'Собака',
  cat: 'Кошка',
  bird: 'Птица',
  rodent: 'Грызун',
  rabbit: 'Кролик',
  reptile: 'Рептилия',
  fish: 'Рыба',
  amphibian: 'Амфибия',
};

/** Диапазоны массы (кг), от лёгких к тяжёлым. */
export const PET_WEIGHT_SIZES: readonly PetSize[] = [
  'up_to_2kg',
  '2_5kg',
  '5_10kg',
  '10_20kg',
  'over_20kg',
] as const;

export const PET_SIZE_LABELS: Record<PetSize, string> = {
  up_to_2kg: 'до 2 кг',
  '2_5kg': '2–5 кг',
  '5_10kg': '5–10 кг',
  '10_20kg': '10–20 кг',
  over_20kg: 'свыше 20 кг',
};
