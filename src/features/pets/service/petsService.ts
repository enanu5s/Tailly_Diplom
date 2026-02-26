//src/features/pets/service/petsService.ts
import { petsApi } from '../api/petsApi';
import type { Pet } from '../model/types';

export const petsService = {
  getPets: () => petsApi.getPets(),
  getBreeds: () => petsApi.getBreeds(),
  upsertPet: (pet: Pet) => petsApi.upsertPet(pet),
  deletePet: (id: string) => petsApi.deletePet(id),
};