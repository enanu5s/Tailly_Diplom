//src/features/pets/service/petsService.ts
import { petsApi } from '../api/petsApi';

import type { Pet } from '../model/types';

export const petsService = {
  getPets: () => petsApi.getPets(),
  getBreeds: () => petsApi.getBreeds(),
  createPet: (pet: Omit<Pet, 'id'>) => petsApi.createPet(pet),
  updatePet: (id: string, pet: Pet) => petsApi.updatePet(id, pet),
  deletePet: (id: string) => petsApi.deletePet(id),
};