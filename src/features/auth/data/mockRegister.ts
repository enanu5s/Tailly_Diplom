// src/features/auth/data/mockRegister.ts

import {
  ensureMockDatabaseLoaded,
  patchMockDatabase,
  unsafeMutableMockDb,
} from '@/shared/mock-db/store';

import type { City } from '../api/registerApi';

export function wait(delay = 400): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delay);
  });
}

export function getMockRegisterState(): {
  lastCode: string;
  registrationId: string;
  verificationToken: string;
  email: string;
  cities: City[];
} {
  ensureMockDatabaseLoaded();

  return unsafeMutableMockDb().register;
}

export function cloneCities(): City[] {
  ensureMockDatabaseLoaded();

  return JSON.parse(JSON.stringify(unsafeMutableMockDb().register.cities)) as City[];
}

export function patchMockRegisterState(
  recipe: (slice: {
    lastCode: string;
    registrationId: string;
    verificationToken: string;
    email: string;
    cities: City[];
  }) => void,
): void {
  patchMockDatabase((db) => {
    recipe(db.register);
  });
}
