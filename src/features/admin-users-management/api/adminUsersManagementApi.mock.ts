// src/features/admin-users-management/api/adminUsersManagementApi.mock.ts

import {
  cloneManagedUsers,
  updateManagedUserBlockedStatus,
  updateManagedUserProfile,
  wait,
} from '../data/mockAdminUsersManagement';

import type {
  ManagedUser,
  UpdateManagedUserProfilePayload,
  UpdateUserBlockStatusPayload,
} from '../model/types';

export async function mockGetManagedUsers(): Promise<ManagedUser[]> {
  await wait();

  return cloneManagedUsers();
}

export async function mockUpdateManagedUserBlockedStatus(
  payload: UpdateUserBlockStatusPayload,
): Promise<ManagedUser> {
  await wait();

  return updateManagedUserBlockedStatus(payload);
}

export async function mockUpdateManagedUserProfile(
  payload: UpdateManagedUserProfilePayload,
): Promise<ManagedUser> {
  await wait();

  return updateManagedUserProfile(payload);
}