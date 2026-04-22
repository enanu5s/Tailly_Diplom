// src/features/pets/api/petsApi.ts
import { HttpError, request } from '@/shared/api/http';
import { isMockApiMode } from '@/shared/config/env';
import { authStore } from '@/features/auth/model/authStore';
import { hasUsableAccessToken } from '@/shared/lib/auth/hasUsableAccessToken';
import { mockDataSourceStore } from '@/shared/lib/mock/mockDataSourceStore';

import {
  mockGetPets,
  mockGetBreeds,
  mockCreatePet,
  mockUpdatePet,
  mockDeletePet,
} from './petsApi.mock';

import type { Breed, Pet } from '../model/types';

/* ==================== REAL API ==================== */

async function realGetPets(): Promise<Pet[]> {
  return request<Pet[]>('/me/pets');
}

async function realGetBreeds(): Promise<Breed[]> {
  return request<Breed[]>('/pets/breeds');
}

async function realCreatePet(pet: Omit<Pet, 'id'>): Promise<Pet> {
  return request<Pet>('/me/pets', {
    method: 'POST',
    body: pet,
  });
}

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

function shouldFallbackToMock(error: unknown): boolean {
  return error instanceof HttpError && (error.status === 401 || error.status === 404);
}

/* ==================== PUBLIC API ==================== */

export const petsApi = {
  async getPets(): Promise<Pet[]> {
    if (isMockApiMode || !hasUsableAccessToken(authStore.getToken())) {
      mockDataSourceStore.setSource('profile/pets', true);
      return mockGetPets();
    }

    try {
      const data = await realGetPets();
      mockDataSourceStore.setSource('profile/pets', false);
      return data;
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        console.warn('[petsApi.getPets] falling back to mock:', error);
        mockDataSourceStore.setSource('profile/pets', true);
        return mockGetPets();
      }

      throw error;
    }
  },

  async getBreeds(): Promise<Breed[]> {
    if (isMockApiMode) {
      return mockGetBreeds();
    }

    try {
      return await realGetBreeds();
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        console.warn('[petsApi.getBreeds] falling back to mock:', error);
        return mockGetBreeds();
      }

      throw error;
    }
  },

  async createPet(pet: Omit<Pet, 'id'>): Promise<Pet> {
    if (isMockApiMode || !hasUsableAccessToken(authStore.getToken())) {
      return mockCreatePet(pet);
    }

    try {
      return await realCreatePet(pet);
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        console.warn('[petsApi.createPet] falling back to mock:', error);
        return mockCreatePet(pet);
      }

      throw error;
    }
  },

  async updatePet(id: string, pet: Pet): Promise<Pet> {
    if (isMockApiMode || !hasUsableAccessToken(authStore.getToken())) {
      return mockUpdatePet(id, pet);
    }

    try {
      return await realUpdatePet(id, pet);
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        console.warn('[petsApi.updatePet] falling back to mock:', error);
        return mockUpdatePet(id, pet);
      }

      throw error;
    }
  },

  async deletePet(id: string): Promise<{ id: string }> {
    if (isMockApiMode || !hasUsableAccessToken(authStore.getToken())) {
      return mockDeletePet(id);
    }

    try {
      return await realDeletePet(id);
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        console.warn('[petsApi.deletePet] falling back to mock:', error);
        return mockDeletePet(id);
      }

      throw error;
    }
  },
};