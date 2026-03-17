// src/features/pets/api/petsApi.mock.ts

import type { Breed, Pet } from '../model/types';

import {
  deepCopy,
  MOCK_BREEDS,
  MOCK_PETS,
} from '../data/mockPets';

export async function mockGetPets(): Promise<Pet[]> {
  return deepCopy(MOCK_PETS);
}

export async function mockGetBreeds(): Promise<Breed[]> {
  return deepCopy(MOCK_BREEDS);
}

export async function mockUpsertPet(pet: Pet): Promise<Pet> {
  const next = deepCopy(pet);

  const idx = MOCK_PETS.findIndex((item) => item.id === next.id);

  if (idx >= 0) {
    MOCK_PETS[idx] = next;
  } else {
    MOCK_PETS.unshift(next);
  }

  return deepCopy(next);
}

export async function mockDeletePet(id: string): Promise<{ id: string }> {
  const idx = MOCK_PETS.findIndex((pet) => pet.id === id);

  if (idx === -1) {
    throw new Error('Питомец не найден');
  }

  MOCK_PETS.splice(idx, 1);

  return { id };
}