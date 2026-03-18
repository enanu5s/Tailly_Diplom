// src/features/admin-users-management/service/adminUsersManagementService.ts

import { adminUsersManagementApi } from '../api/adminUsersManagementApi';
import type {
  ManagedUser,
  UpdateUserBlockStatusPayload,
} from '../model/types';

export const adminUsersManagementService = {
  getUsers(): Promise<ManagedUser[]> {
    return adminUsersManagementApi.getUsers();
  },

  updateBlockedStatus(
    payload: UpdateUserBlockStatusPayload,
  ): Promise<ManagedUser> {
    return adminUsersManagementApi.updateBlockedStatus(payload);
  },
};