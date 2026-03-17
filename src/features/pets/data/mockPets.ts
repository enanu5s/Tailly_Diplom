// src/features/pets/data/mockPets.ts

import type { Breed, Pet } from '../model/types';

export function deepCopy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export let MOCK_PETS: Pet[] = [
  {
    id: 'p-1',
    name: 'Ричи',
    type: 'dog',
    breedId: 'b-dog-1',
    ageYears: 3,
    ageMonths: 2,
    size: 'm',
    gender: 'male',
    toOtherPets: 'friendly',
    toKidsUnder10: 'neutral',
    staysHomeAlone: 'ok',
    vaccinated: 'yes',
    notes: 'Любит прогулки, осторожен с громкими звуками.',
    photoUrl: '/images/pet-dog.png',
  },
];

export const MOCK_BREEDS: Breed[] = [
  { id: 'b-dog-1', type: 'dog', title: 'Корги' },
  { id: 'b-dog-2', type: 'dog', title: 'Лабрадор' },
  { id: 'b-cat-1', type: 'cat', title: 'Британская' },
  { id: 'b-cat-2', type: 'cat', title: 'Сфинкс' },
  { id: 'b-other-1', type: 'other', title: 'Попугай' },
];