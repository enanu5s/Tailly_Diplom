// src/features/admin-profile/service/adminProfileService.ts
import { adminProfileApi } from '../api/adminProfileApi';
import type {
  AdminProfile,
  ConfirmSuperAdminEmailChangePayload,
  RequestSuperAdminEmailChangePayload,
  RequestSuperAdminEmailChangeResponse,
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

  requestSuperAdminEmailChange(
    payload: RequestSuperAdminEmailChangePayload,
  ): Promise<RequestSuperAdminEmailChangeResponse> {
    return adminProfileApi.requestSuperAdminEmailChange(payload);
  },

  confirmSuperAdminEmailChange(
    payload: ConfirmSuperAdminEmailChangePayload,
  ): Promise<AdminProfile> {
    return adminProfileApi.confirmSuperAdminEmailChange(payload);
  },

  cancelSuperAdminEmailChange(): Promise<void> {
    return adminProfileApi.cancelSuperAdminEmailChange();
  },
};