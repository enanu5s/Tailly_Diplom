// src/features/admin-users-management/api/adminUsersManagementApi.ts

import { request } from '@/shared/api/http';
import { getOptionalApiBaseUrl, isMockApiMode } from '@/shared/config/env';

import {
  mockGetManagedUsers,
  mockRestoreManagedUserFromDeletion,
  mockUpdateManagedUserBlockedStatus,
  mockUpdateManagedUserProfile,
} from './adminUsersManagementApi.mock';

import type {
  ManagedUser,
  RestoreManagedUserFromDeletionPayload,
  UpdateManagedUserProfilePayload,
  UpdateUserBlockStatusPayload,
} from '../model/types';

const API_BASE_URL = getOptionalApiBaseUrl();

async function realGetManagedUsers(): Promise<ManagedUser[]> {
  return request<ManagedUser[]>(`${API_BASE_URL}/admin/users`);
}

async function realUpdateManagedUserBlockedStatus(
  payload: UpdateUserBlockStatusPayload,
): Promise<ManagedUser> {
  return request<ManagedUser>(
    `${API_BASE_URL}/admin/users/${payload.userId}/block-status`,
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
}

async function realUpdateManagedUserProfile(
  payload: UpdateManagedUserProfilePayload,
): Promise<ManagedUser> {
  return request<ManagedUser>(`${API_BASE_URL}/admin/users/${payload.userId}/profile`, {
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
  return request<ManagedUser>(
    `${API_BASE_URL}/admin/users/${payload.userId}/restore-from-deletion`,
    {
      method: 'POST',
    },
  );
}

export const adminUsersManagementApi = {
  async getUsers(): Promise<ManagedUser[]> {
    if (isMockApiMode) {
      return mockGetManagedUsers();
    }

    return realGetManagedUsers();
  },

  async updateBlockedStatus(payload: UpdateUserBlockStatusPayload): Promise<ManagedUser> {
    if (isMockApiMode) {
      return mockUpdateManagedUserBlockedStatus(payload);
    }

    return realUpdateManagedUserBlockedStatus(payload);
  },

  async updateUserProfile(
    payload: UpdateManagedUserProfilePayload,
  ): Promise<ManagedUser> {
    if (isMockApiMode) {
      return mockUpdateManagedUserProfile(payload);
    }

    return realUpdateManagedUserProfile(payload);
  },

  async restoreUserFromDeletion(
    payload: RestoreManagedUserFromDeletionPayload,
  ): Promise<ManagedUser> {
    if (isMockApiMode) {
      return mockRestoreManagedUserFromDeletion(payload);
    }

    return realRestoreManagedUserFromDeletion(payload);
  },
};
