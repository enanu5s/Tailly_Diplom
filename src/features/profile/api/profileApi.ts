// src/features/profile/api/profileApi.ts

import { requestParsed } from '@/shared/api/requestParsed';
import { userProfileSchema } from '@/shared/api/schemas/userProfileSchema';
import { isMockApiMode } from '@/shared/config/env';

import { mockGetProfile, mockUpdateContacts, mockUpdateMain } from './profileApi.mock';

import type { UserProfile } from '../model/types';

async function realGetProfile(): Promise<UserProfile> {
  return requestParsed('/me/profile', userProfileSchema);
}

async function realUpdateContacts(
  payload: Pick<UserProfile, 'city' | 'phone'>,
): Promise<UserProfile> {
  return requestParsed('/me/profile/contacts', userProfileSchema, {
    method: 'PUT',
    body: payload,
  });
}

async function realUpdateMain(
  payload: Pick<UserProfile, 'firstName' | 'lastName' | 'middleName' | 'avatarUrl'>,
): Promise<UserProfile> {
  return requestParsed('/me/profile/main', userProfileSchema, {
    method: 'PUT',
    body: payload,
  });
}

export const profileApi = {
  getProfile: (): Promise<UserProfile> =>
    isMockApiMode ? mockGetProfile() : realGetProfile(),

  updateContacts: (payload: Pick<UserProfile, 'city' | 'phone'>): Promise<UserProfile> =>
    isMockApiMode ? mockUpdateContacts(payload) : realUpdateContacts(payload),

  updateMain: (
    payload: Pick<UserProfile, 'firstName' | 'lastName' | 'middleName' | 'avatarUrl'>,
  ): Promise<UserProfile> =>
    isMockApiMode ? mockUpdateMain(payload) : realUpdateMain(payload),
};
