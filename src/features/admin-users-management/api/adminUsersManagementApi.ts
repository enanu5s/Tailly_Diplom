// src/features/admin-users-management/api/adminUsersManagementApi.ts

import { HttpError, request } from '@/shared/api/http';
import { isMockApiMode } from '@/shared/config/env';

import {
  mockGetManagedUsers,
  mockGetManagedUserById,
  mockRestoreManagedUserFromDeletion,
  mockUpdateManagedUserBlockedStatus,
  mockUpdateManagedUserProfile,
} from './adminUsersManagementApi.mock';

import type {
  GetManagedUsersPayload,
  ManagedUser,
  RestoreManagedUserFromDeletionPayload,
  UpdateManagedUserProfilePayload,
  UpdateUserBlockStatusPayload,
} from '../model/types';

function shouldFallbackToMock(error: unknown): boolean {
  return error instanceof HttpError && (error.status === 401 || error.status === 404);
}

async function realGetManagedUsers(payload?: GetManagedUsersPayload): Promise<ManagedUser[]> {
  const response = await request<ManagedUser[] | { items?: ManagedUser[] }>('/admin/users', {
    query: {
      search: payload?.search,
      role: payload?.role,
      page: payload?.page,
      pageSize: payload?.pageSize,
    },
  });

  if (Array.isArray(response)) {
    return response;
  }

  return Array.isArray(response.items) ? response.items : [];
}

async function realGetManagedUserById(userId: string): Promise<ManagedUser> {
  return request<ManagedUser>(`/admin/users/${encodeURIComponent(userId)}`);
}

async function realUpdateManagedUserBlockedStatus(
  payload: UpdateUserBlockStatusPayload,
): Promise<ManagedUser> {
  await request<void>(
    `/admin/users/${encodeURIComponent(payload.userId)}/block-status`,
    {
      method: 'PATCH',
      body: {
        isBlocked: payload.isBlocked,
        blockReason: payload.blockReason,
        blockedUntil: payload.blockedUntil,
        isPermanentBlock: payload.isPermanentBlock,
      },
    },
  );

  return realGetManagedUserById(payload.userId);
}

async function realUpdateManagedUserProfile(
  payload: UpdateManagedUserProfilePayload,
): Promise<ManagedUser> {
  return request<ManagedUser>(`/admin/users/${encodeURIComponent(payload.userId)}/profile`, {
    method: 'PATCH',
    body: {
      firstName: payload.firstName,
      lastName: payload.lastName,
      middleName: payload.middleName,
      specialistSlug: payload.specialistSlug,
    },
  });
}

async function realRestoreManagedUserFromDeletion(
  payload: RestoreManagedUserFromDeletionPayload,
): Promise<ManagedUser> {
  await request<void>(
    `/admin/users/${encodeURIComponent(payload.userId)}/restore-from-deletion`,
    {
      method: 'POST',
    },
  );

  return realGetManagedUserById(payload.userId);
}

export const adminUsersManagementApi = {
  async getUsers(payload?: GetManagedUsersPayload): Promise<ManagedUser[]> {
    if (isMockApiMode) {
      return mockGetManagedUsers(payload);
    }

    try {
      return await realGetManagedUsers(payload);
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        return mockGetManagedUsers(payload);
      }

      throw error;
    }
  },

  async getUserById(userId: string): Promise<ManagedUser> {
    if (isMockApiMode) {
      return mockGetManagedUserById(userId);
    }

    try {
      return await realGetManagedUserById(userId);
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        return mockGetManagedUserById(userId);
      }

      throw error;
    }
  },

  async updateBlockedStatus(payload: UpdateUserBlockStatusPayload): Promise<ManagedUser> {
    if (isMockApiMode) {
      return mockUpdateManagedUserBlockedStatus(payload);
    }

    try {
      return await realUpdateManagedUserBlockedStatus(payload);
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        return mockUpdateManagedUserBlockedStatus(payload);
      }

      throw error;
    }
  },

  async updateUserProfile(
    payload: UpdateManagedUserProfilePayload,
  ): Promise<ManagedUser> {
    if (isMockApiMode) {
      return mockUpdateManagedUserProfile(payload);
    }

    try {
      return await realUpdateManagedUserProfile(payload);
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        return mockUpdateManagedUserProfile(payload);
      }

      throw error;
    }
  },

  async restoreUserFromDeletion(
    payload: RestoreManagedUserFromDeletionPayload,
  ): Promise<ManagedUser> {
    if (isMockApiMode) {
      return mockRestoreManagedUserFromDeletion(payload);
    }

    try {
      return await realRestoreManagedUserFromDeletion(payload);
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        return mockRestoreManagedUserFromDeletion(payload);
      }

      throw error;
    }
  },
};
