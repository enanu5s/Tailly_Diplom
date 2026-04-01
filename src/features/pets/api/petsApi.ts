// src/features/pets/api/petsApi.ts
import { request } from '@/shared/api/http';
import { isMockApiMode } from '@/shared/config/env';

import { 
  mockGetPets, 
  mockGetBreeds, 
  mockCreatePet, 
  mockUpdatePet, 
  mockDeletePet 
} from './petsApi.mock';

import type { Breed, Pet } from '../model/types';

/* ==================== REAL API ==================== */

async function realGetPets(): Promise<Pet[]> {
  return request<Pet[]>('/me/pets');
}

async function realGetBreeds(): Promise<Breed[]> {
  return request<Breed[]>('/pets/breeds');
}

/** Создание нового питомца (бек сам генерирует id) */
async function realCreatePet(pet: Omit<Pet, 'id'>): Promise<Pet> {
  return request<Pet>('/me/pets', {
    method: 'POST',
    body: pet,
  });
}

/** Обновление существующего питомца */
async function realUpdatePet(id: string, pet: Pet): Promise<Pet> {
  return request<Pet>(`/me/pets/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: pet,
  });
}

async function realDeletePet(id: string): Promise<{ id: string }> {
  return request<{ id: string }>(`/me/pets/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

/* ==================== PUBLIC API ==================== */

export const petsApi = {
  getPets: () => (isMockApiMode ? mockGetPets() : realGetPets()),
  getBreeds: () => (isMockApiMode ? mockGetBreeds() : realGetBreeds()),

  /** Создать нового питомца */
  createPet: (pet: Omit<Pet, 'id'>) => 
    isMockApiMode ? mockCreatePet(pet) : realCreatePet(pet),

  /** Обновить питомца */
  updatePet: (id: string, pet: Pet) => 
    isMockApiMode ? mockUpdatePet(id, pet) : realUpdatePet(id, pet),

  deletePet: (id: string) => 
    isMockApiMode ? mockDeletePet(id) : realDeletePet(id),
};