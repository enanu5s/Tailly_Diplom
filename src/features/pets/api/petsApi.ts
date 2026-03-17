// src/features/pets/api/petsApi.ts

import { request } from '@/shared/api/http';

import {
  mockDeletePet,
  mockGetBreeds,
  mockGetPets,
  mockUpsertPet,
} from './petsApi.mock';

import type { Breed, Pet } from '../model/types';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';

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
  getPets: () => (USE_MOCK ? mockGetPets() : realGetPets()),
  getBreeds: () => (USE_MOCK ? mockGetBreeds() : realGetBreeds()),
  upsertPet: (pet: Pet) => (USE_MOCK ? mockUpsertPet(pet) : realUpsertPet(pet)),
  deletePet: (id: string) => (USE_MOCK ? mockDeletePet(id) : realDeletePet(id)),
};