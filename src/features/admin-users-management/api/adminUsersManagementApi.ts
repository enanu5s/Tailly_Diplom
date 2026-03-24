// src/features/admin-users-management/api/adminUsersManagementApi.ts

import { request } from '@/shared/api/http';

import {
  mockGetManagedUsers,
  mockUpdateManagedUserBlockedStatus,
  mockUpdateManagedUserProfile,
} from './adminUsersManagementApi.mock';

import type {
  ManagedUser,
  UpdateManagedUserProfilePayload,
  UpdateUserBlockStatusPayload,
} from '../model/types';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

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
  return request<ManagedUser>(
    `${API_BASE_URL}/admin/users/${payload.userId}/profile`,
    {
      method: 'PATCH',
      body: {
        firstName: payload.firstName,
        lastName: payload.lastName,
        middleName: payload.middleName,
        specialistSlug: payload.specialistSlug,
      },
    },
  );
}

export const adminUsersManagementApi = {
  async getUsers(): Promise<ManagedUser[]> {
    if (USE_MOCK) {
      return mockGetManagedUsers();
    }

    return realGetManagedUsers();
  },

  async updateBlockedStatus(
    payload: UpdateUserBlockStatusPayload,
  ): Promise<ManagedUser> {
    if (USE_MOCK) {
      return mockUpdateManagedUserBlockedStatus(payload);
    }

    return realUpdateManagedUserBlockedStatus(payload);
  },

  async updateUserProfile(
    payload: UpdateManagedUserProfilePayload,
  ): Promise<ManagedUser> {
    if (USE_MOCK) {
      return mockUpdateManagedUserProfile(payload);
    }

    return realUpdateManagedUserProfile(payload);
  },
};