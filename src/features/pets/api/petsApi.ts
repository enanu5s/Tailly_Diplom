// src/features/pets/api/petsApi.ts

import { request } from '@/shared/api/http';
import { isMockApiMode } from '@/shared/config/env';

import { mockDeletePet, mockGetBreeds, mockGetPets, mockUpsertPet } from './petsApi.mock';

import type { Breed, Pet } from '../model/types';

/* REAL */
async function realGetPets(): Promise<Pet[]> {
  return request<Pet[]>('/me/pets');
}

async function realGetBreeds(): Promise<Breed[]> {
  return request<Breed[]>('/pets/breeds');
}

async function realUpsertPet(pet: Pet): Promise<Pet> {
  return request<Pet>(`/me/pets/${encodeURIComponent(pet.id)}`, {
    method: 'PUT',
    body: pet,
  });
}

async function realDeletePet(id: string): Promise<{ id: string }> {
  return request<{ id: string }>(`/me/pets/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export const petsApi = {
  getPets: () => (isMockApiMode ? mockGetPets() : realGetPets()),
  getBreeds: () => (isMockApiMode ? mockGetBreeds() : realGetBreeds()),
  upsertPet: (pet: Pet) => (isMockApiMode ? mockUpsertPet(pet) : realUpsertPet(pet)),
  deletePet: (id: string) => (isMockApiMode ? mockDeletePet(id) : realDeletePet(id)),
};
