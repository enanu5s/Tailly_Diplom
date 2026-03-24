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

export async function mockGetPets(): Promise<Pet[]> {
  return cloneDeep(currentUserPets());
}

export async function mockGetBreeds(): Promise<Breed[]> {
  ensureMockDatabaseLoaded();

  return cloneDeep(unsafeMutableMockDb().client.breeds);
}

export async function mockUpsertPet(pet: Pet): Promise<Pet> {
  const next = cloneDeep(pet);

  patchMockDatabase((db) => {
    const uid = requireMockSessionUserId();
    const list = [...(db.client.petsByUserId[uid] ?? [])];
    const idx = list.findIndex((item) => item.id === next.id);

    if (idx >= 0) {
      list[idx] = next;
    } else {
      list.unshift(next);
    }

    db.client.petsByUserId[uid] = list;
  });

  return cloneDeep(next);
}

export async function mockDeletePet(id: string): Promise<{ id: string }> {
  ensureMockDatabaseLoaded();

  const uid = requireMockSessionUserId();
  const db = unsafeMutableMockDb();
  const list = db.client.petsByUserId[uid] ?? [];

  if (!list.some((p) => p.id === id)) {
    throw new Error('Питомец не найден');
  }

  patchMockDatabase((next) => {
    next.client.petsByUserId[uid] = (next.client.petsByUserId[uid] ?? []).filter(
      (p) => p.id !== id,
    );
  });

  return { id };
}
