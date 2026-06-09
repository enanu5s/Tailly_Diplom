// src/features/super-admin-admins-management/service/superAdminAdminsManagementService.ts

import { superAdminAdminsManagementApi } from '../api/superAdminAdminsManagementApi';

import type {
  ClearAdminPasswordLockPayload,
  CreateAdminPayload,
  CreateAdminResponse,
  DeleteAdminPayload,
  ManagedAdmin,
  UpdateAdminBlockStatusPayload,
  UpdateAdminPayload,
} from '../model/types';

export const superAdminAdminsManagementService = {
  getAdmins(): Promise<ManagedAdmin[]> {
    return superAdminAdminsManagementApi.getAdmins();
  },

  createAdmin(payload: CreateAdminPayload): Promise<CreateAdminResponse> {
    return superAdminAdminsManagementApi.createAdmin(payload);
  },

  deleteAdmin(payload: DeleteAdminPayload): Promise<void> {
    return superAdminAdminsManagementApi.deleteAdmin(payload);
  },

  updateAdmin(payload: UpdateAdminPayload): Promise<ManagedAdmin> {
    return superAdminAdminsManagementApi.updateAdmin(payload);
  },

  setAdminBlockStatus(payload: UpdateAdminBlockStatusPayload): Promise<ManagedAdmin> {
    return superAdminAdminsManagementApi.setAdminBlockStatus(payload);
  },

  clearAdminPasswordLock(
    payload: ClearAdminPasswordLockPayload,
  ): Promise<ManagedAdmin> {
    return superAdminAdminsManagementApi.clearAdminPasswordLock(payload);
  },
};
