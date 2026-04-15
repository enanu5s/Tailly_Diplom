// src/features/profile/api/profileApi.ts

import { HttpError } from '@/shared/api/http';
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

function shouldFallbackToMock(error: unknown): boolean {
  return error instanceof HttpError && (error.status === 401 || error.status === 404);
}

export const profileApi = {
  async getProfile(): Promise<UserProfile> {
    if (isMockApiMode) {
      return mockGetProfile();
    }

    try {
      return await realGetProfile();
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        console.warn('[profileApi.getProfile] falling back to mock:', error);
        return mockGetProfile();
      }

      throw error;
    }
  },

  async updateContacts(
    payload: Pick<UserProfile, 'city' | 'phone'>,
  ): Promise<UserProfile> {
    if (isMockApiMode) {
      return mockUpdateContacts(payload);
    }

    try {
      return await realUpdateContacts(payload);
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        console.warn('[profileApi.updateContacts] falling back to mock:', error);
        return mockUpdateContacts(payload);
      }

      throw error;
    }
  },

  async updateMain(
    payload: Pick<UserProfile, 'firstName' | 'lastName' | 'middleName' | 'avatarUrl'>,
  ): Promise<UserProfile> {
    if (isMockApiMode) {
      return mockUpdateMain(payload);
    }

    try {
      return await realUpdateMain(payload);
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        console.warn('[profileApi.updateMain] falling back to mock:', error);
        return mockUpdateMain(payload);
      }

      throw error;
    }
  },
};