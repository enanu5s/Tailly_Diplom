// src/features/profile/api/profileApi.mock.ts

import { cloneDeep } from '@/shared/mock-db/cloneDeep';
import {
  ensureMockDatabaseLoaded,
  patchMockDatabase,
  unsafeMutableMockDb,
} from '@/shared/mock-db/store';

import type { UserProfile } from '../model/types';

function getDefaultProfileRef(): UserProfile {
  ensureMockDatabaseLoaded();

  const db = unsafeMutableMockDb();

  return db.client.profiles[db.client.defaultUserId];
}

export async function mockGetProfile(): Promise<UserProfile> {
  return cloneDeep(getDefaultProfileRef());
}

export async function mockUpdateContacts(
  payload: Pick<UserProfile, 'city' | 'phone'>,
): Promise<UserProfile> {
  patchMockDatabase((db) => {
    const profile = db.client.profiles[db.client.defaultUserId];
    Object.assign(profile, payload);
  });

  return cloneDeep(getDefaultProfileRef());
}

export async function mockUpdateMain(
  payload: Pick<UserProfile, 'firstName' | 'lastName' | 'middleName' | 'avatarUrl'>,
): Promise<UserProfile> {
  patchMockDatabase((db) => {
    const profile = db.client.profiles[db.client.defaultUserId];
    Object.assign(profile, payload);

    if (!payload.middleName) {
      delete profile.middleName;
    }

    if (!payload.avatarUrl) {
      delete profile.avatarUrl;
    }
  });

  return cloneDeep(getDefaultProfileRef());
}
