// src/features/admin-users-management/service/adminUsersManagementService.ts

import { adminUsersManagementApi } from '../api/adminUsersManagementApi';

import type {
  GetManagedUsersPayload,
  ManagedUser,
  ManagedUserRole,
  RestoreManagedUserFromDeletionPayload,
  UpdateManagedUserProfilePayload,
  UpdateUserBlockStatusPayload,
} from '../model/types';

export const adminUsersManagementService = {
  getUsers(payload?: GetManagedUsersPayload): Promise<ManagedUser[]> {
    return adminUsersManagementApi.getUsers(payload);
  },

  getUserById(userId: string, role: ManagedUserRole): Promise<ManagedUser> {
    return adminUsersManagementApi.getUserById(userId, role);
  },

  updateBlockedStatus(payload: UpdateUserBlockStatusPayload): Promise<ManagedUser> {
    return adminUsersManagementApi.updateBlockedStatus(payload);
  },

  updateUserProfile(payload: UpdateManagedUserProfilePayload): Promise<ManagedUser> {
    return adminUsersManagementApi.updateUserProfile(payload);
  },

  restoreUserFromDeletion(
    payload: RestoreManagedUserFromDeletionPayload,
  ): Promise<ManagedUser> {
    return adminUsersManagementApi.restoreUserFromDeletion(payload);
  },
};
