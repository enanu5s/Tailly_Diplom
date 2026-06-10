// src/shared/mock-db/seed/clients.seed.ts

import type { Pet } from '@/features/pets/model/types';
import type { UserProfile } from '@/features/profile/model/types';

import { CLIENT_NAMES } from './accounts.seed';

function clientEmail(index: number): string {
  if (index === 1) {
    return 'client@tailly.local';
  }

  return `client${String(index).padStart(2, '0')}@tailly.local`;
}

function avatarPath(index: number): string | undefined {
  return `/images/clients/avatars/client-${String(index).padStart(2, '0')}.jpg`;
}

export function buildSeedClientProfiles(): Record<string, UserProfile> {
  const profiles: Record<string, UserProfile> = {};

  CLIENT_NAMES.forEach((c, i) => {
    const index = i + 1;
    const id = `client-${index}`;

    profiles[id] = {
      id,
      firstName: c.firstName,
      lastName: c.lastName,
      middleName: c.middleName,
      city: c.city,
      district: c.district,
      phone: `+7 (900) ${100 + index}-${10 + index}-${20 + index}`,
      email: clientEmail(index),
      avatarUrl: avatarPath(index),
    };
  });

  return profiles;
}

const PET_NAMES = ['Марта', 'Пушок', 'Снежок', 'Барсик', 'Рыжик', 'Шарик', 'Мурзик', 'Бобик'];

export function buildSeedClientPets(): Record<string, Pet[]> {
  const petsByUserId: Record<string, Pet[]> = {};

  CLIENT_NAMES.forEach((_, i) => {
    const index = i + 1;
    const id = `client-${index}`;
    const pad = String(index).padStart(2, '0');

    const dog: Pet = {
      id: `${id}-pet-dog`,
      name: PET_NAMES[(index + 1) % PET_NAMES.length]!,
      type: 'dog',
      breedId: 'b-dog-1',
      ageYears: 2 + (index % 8),
      ageMonths: index % 11,
      size: index % 2 === 0 ? '2_5kg' : '5_10kg',
      gender: index % 2 === 0 ? 'male' : 'female',
      toOtherPets: index % 3 === 0 ? 'friendly' : 'neutral',
      toKidsUnder10: index % 4 === 0 ? 'friendly' : 'neutral',
      staysHomeAlone: 'ok',
      vaccinated: 'yes',
      notes: index % 2 === 0 ? 'Любит длительные прогулки.' : '',
      photoUrl: `/images/clients/pets/client-${pad}-pet-1.jpg`,
    };

    if (index % 2 === 0) {
      const cat: Pet = {
        id: `${id}-pet-cat`,
        name: PET_NAMES[index % PET_NAMES.length]!,
        type: 'cat',
        breedId: 'b-cat-1',
        ageYears: 1 + (index % 6),
        ageMonths: 3,
        size: 'up_to_2kg',
        gender: 'female',
        toOtherPets: 'neutral',
        toKidsUnder10: 'friendly',
        staysHomeAlone: index === 4 ? 'not_ok' : 'ok',
        vaccinated: 'yes',
        notes: 'Спокойный кот.',
        photoUrl: `/images/clients/pets/client-${pad}-pet-2.jpg`,
      };

      petsByUserId[id] = [dog, cat];
    } else {
      petsByUserId[id] = [dog];
    }
  });

  return petsByUserId;
}

export const SEED_DEFAULT_CLIENT_ID = 'client-1';
