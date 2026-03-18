// src/features/admin-profile/service/adminProfileService.ts
import { adminProfileApi } from '../api/adminProfileApi';
import type {
  AdminProfile,
  UpdateAdminProfilePayload,
} from '../model/types';

export const adminProfileService = {
  getProfile(): Promise<AdminProfile> {
    return adminProfileApi.getProfile();
  },

  updateProfile(
    payload: UpdateAdminProfilePayload,
  ): Promise<AdminProfile> {
    return adminProfileApi.updateProfile(payload);
  },
};