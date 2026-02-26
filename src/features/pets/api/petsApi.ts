//src/features/pets/api/petsApi.ts

import type { Breed, Pet, PetType } from '../model/types';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

function deepCopy<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error((await res.text().catch(() => '')) || `HTTP ${res.status}`);
  return (await res.json()) as T;
}

/* MOCK */
let MOCK_PETS: Pet[] = [
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

const MOCK_BREEDS: Breed[] = [
  { id: 'b-dog-1', type: 'dog', title: 'Корги' },
  { id: 'b-dog-2', type: 'dog', title: 'Лабрадор' },
  { id: 'b-cat-1', type: 'cat', title: 'Британская' },
  { id: 'b-cat-2', type: 'cat', title: 'Сфинкс' },
  { id: 'b-other-1', type: 'other', title: 'Попугай' },
];

async function mockGetPets(): Promise<Pet[]> {
  return deepCopy(MOCK_PETS);
}

async function mockGetBreeds(): Promise<Breed[]> {
  return deepCopy(MOCK_BREEDS);
}

async function mockUpsertPet(pet: Pet): Promise<Pet> {
  const next = deepCopy(pet);

  const idx = MOCK_PETS.findIndex((x) => x.id === next.id);
  if (idx >= 0) MOCK_PETS[idx] = next;
  else MOCK_PETS = [next, ...MOCK_PETS];

  return deepCopy(next);
}

async function mockDeletePet(id: string): Promise<{ id: string }> {
  const exists = MOCK_PETS.some((p) => p.id === id);
  if (!exists) throw new Error('Питомец не найден');
  MOCK_PETS = MOCK_PETS.filter((p) => p.id !== id);
  return { id };
}

/* REAL */
async function realGetPets(): Promise<Pet[]> {
  return fetchJson<Pet[]>(`${API_BASE_URL}/me/pets`);
}
async function realGetBreeds(): Promise<Breed[]> {
  return fetchJson<Breed[]>(`${API_BASE_URL}/pets/breeds`);
}
async function realUpsertPet(pet: Pet): Promise<Pet> {
  return fetchJson<Pet>(`${API_BASE_URL}/me/pets/${encodeURIComponent(pet.id)}`, {
    method: 'PUT',
    body: JSON.stringify(pet),
  });
}

async function realDeletePet(id: string): Promise<{ id: string }> {
  return fetchJson<{ id: string }>(`${API_BASE_URL}/me/pets/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export const petsApi = {
  getPets: () => (USE_MOCK ? mockGetPets() : realGetPets()),
  getBreeds: () => (USE_MOCK ? mockGetBreeds() : realGetBreeds()),
  upsertPet: (pet: Pet) => (USE_MOCK ? mockUpsertPet(pet) : realUpsertPet(pet)),
  deletePet: (id: string) => (USE_MOCK ? mockDeletePet(id) : realDeletePet(id)),
};