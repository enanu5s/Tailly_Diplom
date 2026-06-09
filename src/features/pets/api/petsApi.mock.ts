// src/features/pets/api/petsApi.mock.ts

import { cloneDeep } from '@/shared/mock-db/cloneDeep';
import { requireMockSessionUserId } from '@/shared/mock-db/resolveCurrentClientProfile';
import {
  ensureMockDatabaseLoaded,
  patchMockDatabase,
  unsafeMutableMockDb,
} from '@/shared/mock-db/store';

import type { Breed, Pet } from '../model/types';

function currentUserPets(): Pet[] {
  ensureMockDatabaseLoaded();
  const db = unsafeMutableMockDb();
  const uid = requireMockSessionUserId();
  return db.client.petsByUserId[uid] ?? [];
}

/** Генерация ID для моков (имитирует поведение реального бека) */
function generateMockPetId(): string {
  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function mockGetPets(): Promise<Pet[]> {
  return cloneDeep(currentUserPets());
}

export async function mockGetBreeds(): Promise<Breed[]> {
  ensureMockDatabaseLoaded();
  return cloneDeep(unsafeMutableMockDb().client.breeds);
}

/** Создание нового питомца в моках */
export async function mockCreatePet(petData: Omit<Pet, 'id'>): Promise<Pet> {
  const newPet: Pet = {
    ...petData,
    id: generateMockPetId(),        // ← генерируем ID здесь, как будет делать бек
  };

  patchMockDatabase((db) => {
    const uid = requireMockSessionUserId();
    const list = [...(db.client.petsByUserId[uid] ?? [])];
    list.unshift(newPet);                    // новый питомец в начало списка
    db.client.petsByUserId[uid] = list;
  });

  return cloneDeep(newPet);
}

/** Обновление питомца в моках */
export async function mockUpdatePet(id: string, petData: Pet): Promise<Pet> {
  const updatedPet: Pet = {
    ...petData,
    id,                                 // гарантируем, что id остаётся тем же
  };

  patchMockDatabase((db) => {
    const uid = requireMockSessionUserId();
    const list = [...(db.client.petsByUserId[uid] ?? [])];
    const idx = list.findIndex((item) => item.id === id);

    if (idx >= 0) {
      list[idx] = updatedPet;
    } else {
      list.unshift(updatedPet);
    }

    db.client.petsByUserId[uid] = list;
  });

  return cloneDeep(updatedPet);
}

export async function mockDeletePet(id: string): Promise<{ id: string }> {
  ensureMockDatabaseLoaded();

  const uid = requireMockSessionUserId();
  const db = unsafeMutableMockDb();
  const list = db.client.petsByUserId[uid] ?? [];

  if (!list.some((p) => p.id === id)) {
    throw new Error('Питомец не найден');
  }

  patchMockDatabase((nextDb) => {
    nextDb.client.petsByUserId[uid] = (nextDb.client.petsByUserId[uid] ?? []).filter(
      (p) => p.id !== id,
    );
  });

  return { id };
}