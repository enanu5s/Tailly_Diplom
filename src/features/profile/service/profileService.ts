// src/features/profile/service/profileService.ts
import { profileApi } from '../api/profileApi';

import type { UserProfile } from '../model/types';

export const profileService = {
  getProfile: (): Promise<UserProfile> => profileApi.getProfile(),

  updateContacts: (
    payload: Pick<UserProfile, 'city' | 'phone'>,
  ): Promise<UserProfile> => profileApi.updateContacts(payload),

  updateMain: (
    payload: Pick<UserProfile, 'firstName' | 'lastName' | 'middleName' | 'avatarUrl'>,
  ): Promise<UserProfile> => profileApi.updateMain(payload),
};