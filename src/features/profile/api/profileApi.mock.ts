// src/features/profile/api/profileApi.mock.ts

import type { UserProfile } from '../model/types';

import { deepCopy, MOCK_PROFILE } from '../data/mockProfile';

export async function mockGetProfile(): Promise<UserProfile> {
  return deepCopy(MOCK_PROFILE);
}

export async function mockUpdateContacts(
  payload: Pick<UserProfile, 'city' | 'phone'>,
): Promise<UserProfile> {
  Object.assign(MOCK_PROFILE, payload); // ✅

  return deepCopy(MOCK_PROFILE);
}

export async function mockUpdateMain(
  payload: Pick<UserProfile, 'firstName' | 'lastName' | 'avatarUrl'>,
): Promise<UserProfile> {
  Object.assign(MOCK_PROFILE, payload); // ✅

  return deepCopy(MOCK_PROFILE);
}