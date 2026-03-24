// src/features/profile/api/profileApi.mock.ts

import { cloneDeep } from '@/shared/mock-db/cloneDeep';
import { resolveMutableClientProfile } from '@/shared/mock-db/resolveCurrentClientProfile';
import { patchMockDatabase } from '@/shared/mock-db/store';

import type { UserProfile } from '../model/types';

export async function mockGetProfile(): Promise<UserProfile> {
  let profile: UserProfile | null = null;

  patchMockDatabase((db) => {
    profile = resolveMutableClientProfile(db);
  });

  return cloneDeep(profile!);
}

export async function mockUpdateContacts(
  payload: Pick<UserProfile, 'city' | 'phone'>,
): Promise<UserProfile> {
  let profile: UserProfile | null = null;

  patchMockDatabase((db) => {
    profile = resolveMutableClientProfile(db);
    Object.assign(profile, payload);
  });

  return cloneDeep(profile!);
}

export async function mockUpdateMain(
  payload: Pick<UserProfile, 'firstName' | 'lastName' | 'middleName' | 'avatarUrl'>,
): Promise<UserProfile> {
  let profile: UserProfile | null = null;

  patchMockDatabase((db) => {
    profile = resolveMutableClientProfile(db);
    Object.assign(profile, payload);

    if (!payload.middleName) {
      delete profile.middleName;
    }

    if (!payload.avatarUrl) {
      delete profile.avatarUrl;
    }
  });

  return cloneDeep(profile!);
}
