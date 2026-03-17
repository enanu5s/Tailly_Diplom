// src/features/profile/service/profileService.ts
import { profileApi } from '../api/profileApi';

import type { UserProfile } from '../model/types';

export const profileService = {
  getProfile: () => profileApi.getProfile(),

  updateContacts: (payload: Pick<UserProfile, 'city' | 'phone'>) =>
    profileApi.updateContacts(payload),

  updateMain: (payload: Pick<UserProfile, 'firstName' | 'lastName' | 'avatarUrl'>) =>
    profileApi.updateMain(payload),
};