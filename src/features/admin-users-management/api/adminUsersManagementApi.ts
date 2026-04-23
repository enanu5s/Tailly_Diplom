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
  ManagedUserRole,
  RestoreManagedUserFromDeletionPayload,
  UpdateManagedUserProfilePayload,
  UpdateUserBlockStatusPayload,
} from '../model/types';

function shouldFallbackToMock(error: unknown): boolean {
  return error instanceof HttpError && (error.status === 401 || error.status === 404);
}

function mapApiUserToManagedUser(raw: Record<string, unknown>): ManagedUser {
  const role = raw.role as ManagedUserRole;
  const softDeletedAt = raw.softDeletedAt as string | undefined;
  const restoreUntil = raw.restoreUntil as string | undefined;

  return {
    id: String(raw.id),
    email: String(raw.email),
    role,
    firstName: raw.firstName as string | undefined,
    lastName: raw.lastName as string | undefined,
    middleName: raw.middleName as string | undefined,
    specialistId: raw.specialistId as string | undefined,
    specialistSlug: raw.specialistSlug as string | undefined,
    isBlocked: Boolean(raw.isBlocked),
    blockReason: raw.blockReason as string | undefined,
    blockedUntil: raw.blockedUntil as string | undefined,
    isPermanentBlock: Boolean(raw.isPermanentBlock),
    isScheduledForDeletion: Boolean(softDeletedAt && restoreUntil),
    scheduledDeletionDeadline: restoreUntil,
  };
}

type AdminUsersListResponse = {
  items?: Record<string, unknown>[];
  total?: number;
  clientsCount?: number;
  specialistsCount?: number;
};

async function realGetManagedUsers(payload?: GetManagedUsersPayload): Promise<ManagedUser[]> {
  const response = await request<ManagedUser[] | AdminUsersListResponse>('/admin/users', {
    query: {
      search: payload?.search,
      role: payload?.role,
      page: payload?.page,
      pageSize: payload?.pageSize,
    },
  });

  if (Array.isArray(response)) {
    return response.map((row) => mapApiUserToManagedUser(row as unknown as Record<string, unknown>));
  }

  const items = Array.isArray(response.items) ? response.items : [];

  return items.map((row) => mapApiUserToManagedUser(row));
}

async function realGetManagedUserById(userId: string, role: ManagedUserRole): Promise<ManagedUser> {
  const raw = await request<Record<string, unknown>>(`/admin/users/${encodeURIComponent(userId)}`, {
    query: { role },
  });

  return mapApiUserToManagedUser(raw);
}

async function realUpdateManagedUserBlockedStatus(
  payload: UpdateUserBlockStatusPayload,
): Promise<ManagedUser> {
  await request<void>(
    `/admin/users/${encodeURIComponent(payload.userId)}/roles/${encodeURIComponent(payload.role)}/block-status`,
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

  return realGetManagedUserById(payload.userId, payload.role);
}

async function realUpdateManagedUserProfile(
  payload: UpdateManagedUserProfilePayload,
): Promise<ManagedUser> {
  const raw = await request<Record<string, unknown>>(
    `/admin/users/${encodeURIComponent(payload.userId)}/profile`,
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

  return mapApiUserToManagedUser({
    ...raw,
    role: raw.role ?? payload.role,
  });
}

async function realRestoreManagedUserFromDeletion(
  payload: RestoreManagedUserFromDeletionPayload,
): Promise<ManagedUser> {
  await request<void>(
    `/admin/users/${encodeURIComponent(payload.userId)}/roles/${encodeURIComponent(payload.role)}/restore-from-deletion`,
    {
      method: 'POST',
    },
  );

  return realGetManagedUserById(payload.userId, payload.role);
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

  async getUserById(userId: string, role: ManagedUserRole): Promise<ManagedUser> {
    if (isMockApiMode) {
      return mockGetManagedUserById(userId, role);
    }

    try {
      return await realGetManagedUserById(userId, role);
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        return mockGetManagedUserById(userId, role);
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
