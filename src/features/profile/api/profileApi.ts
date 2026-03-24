// src/features/profile/api/profileApi.ts

import { request } from '@/shared/api/http';

import {
  mockGetProfile,
  mockUpdateContacts,
  mockUpdateMain,
} from './profileApi.mock';

import type { UserProfile } from '../model/types';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';

async function realGetProfile(): Promise<UserProfile> {
  return request<UserProfile>('/me/profile');
}

async function realUpdateContacts(
  payload: Pick<UserProfile, 'city' | 'phone'>,
): Promise<UserProfile> {
  return request<UserProfile>('/me/profile/contacts', {
    method: 'PUT',
    body: payload,
  });
}

async function realUpdateMain(
  payload: Pick<UserProfile, 'firstName' | 'lastName' | 'middleName' | 'avatarUrl'>,
): Promise<UserProfile> {
  return request<UserProfile>('/me/profile/main', {
    method: 'PUT',
    body: payload,
  });
}

export const profileApi = {
  getProfile: (): Promise<UserProfile> =>
    USE_MOCK ? mockGetProfile() : realGetProfile(),

  updateContacts: (
    payload: Pick<UserProfile, 'city' | 'phone'>,
  ): Promise<UserProfile> =>
    USE_MOCK ? mockUpdateContacts(payload) : realUpdateContacts(payload),

  updateMain: (
    payload: Pick<UserProfile, 'firstName' | 'lastName' | 'middleName' | 'avatarUrl'>,
  ): Promise<UserProfile> =>
    USE_MOCK ? mockUpdateMain(payload) : realUpdateMain(payload),
};