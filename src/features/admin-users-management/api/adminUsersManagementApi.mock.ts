// src/features/admin-users-management/api/adminUsersManagementApi.mock.ts

import {
  cloneManagedUsers,
  restoreManagedUserFromDeletion,
  updateManagedUserBlockedStatus,
  updateManagedUserProfile,
  wait,
} from '../data/mockAdminUsersManagement';

import type {
  GetManagedUsersPayload,
  ManagedUser,
  ManagedUserRole,
  RestoreManagedUserFromDeletionPayload,
  UpdateManagedUserProfilePayload,
  UpdateUserBlockStatusPayload,
} from '../model/types';

export async function mockGetManagedUsers(payload?: GetManagedUsersPayload): Promise<ManagedUser[]> {
  await wait();

  const search = payload?.search?.trim().toLowerCase();
  const role = payload?.role;

  let users = cloneManagedUsers();

  if (role) {
    users = users.filter((user) => user.role === role);
  }

  if (search) {
    users = users.filter((user) => {
      const haystack = [
        user.email,
        user.firstName,
        user.lastName,
        user.middleName,
        user.name,
      ]
        .filter((value): value is string => typeof value === 'string')
        .join(' ')
        .toLowerCase();

      return haystack.includes(search);
    });
  }

  const page = Math.max(1, payload?.page ?? 1);
  const pageSize = Math.max(1, payload?.pageSize ?? 20);
  const start = (page - 1) * pageSize;

  return users.slice(start, start + pageSize);
}

export async function mockGetManagedUserById(
  userId: string,
  role: ManagedUserRole,
): Promise<ManagedUser> {
  await wait();

  const user = cloneManagedUsers().find((item) => item.id === userId && item.role === role);

  if (!user) {
    throw new Error('Пользователь не найден.');
  }

  return user;
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

export async function mockRestoreManagedUserFromDeletion(
  payload: RestoreManagedUserFromDeletionPayload,
): Promise<ManagedUser> {
  await wait();

  return restoreManagedUserFromDeletion(payload);
}
