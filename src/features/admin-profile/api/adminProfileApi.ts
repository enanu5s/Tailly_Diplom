// src/features/admin-profile/api/adminProfileApi.ts
import { HttpError, request } from '@/shared/api/http';
import { isMockApiMode } from '@/shared/config/env';

import {
  mockCancelSuperAdminEmailChangeApi,
  mockClearPasswordAttemptsLockApi,
  mockConfirmSuperAdminEmailChangeApi,
  mockGetAdminProfile,
  mockRequestSuperAdminEmailChangeApi,
  mockUpdateAdminProfile,
} from './adminProfileApi.mock';

import type {
  AdminProfile,
  ConfirmSuperAdminEmailChangePayload,
  RequestSuperAdminEmailChangePayload,
  RequestSuperAdminEmailChangeResponse,
  UpdateAdminProfilePayload,
} from '../model/types';

function shouldFallbackToMock(error: unknown): boolean {
  return error instanceof HttpError && (error.status === 401 || error.status === 404);
}

async function realGetAdminProfile(): Promise<AdminProfile> {
  return request<AdminProfile>('/admin/profile');
}

async function realUpdateAdminProfile(
  payload: UpdateAdminProfilePayload,
): Promise<AdminProfile> {
  return request<AdminProfile>('/admin/profile', {
    method: 'PATCH',
    body: payload,
  });
}

async function realRequestSuperAdminEmailChange(
  payload: RequestSuperAdminEmailChangePayload,
): Promise<RequestSuperAdminEmailChangeResponse> {
  return request<RequestSuperAdminEmailChangeResponse>(
    '/admin/profile/email-change/request',
    {
      method: 'POST',
      body: payload,
    },
  );
}

async function realConfirmSuperAdminEmailChange(
  payload: ConfirmSuperAdminEmailChangePayload,
): Promise<AdminProfile> {
  return request<AdminProfile>('/admin/profile/email-change/confirm', {
    method: 'POST',
    body: payload,
  });
}

async function realCancelSuperAdminEmailChange(): Promise<void> {
  await request<void>('/admin/profile/email-change', {
    method: 'DELETE',
  });
}

async function realClearPasswordAttemptsLock(): Promise<AdminProfile> {
  return request<AdminProfile>('/admin/profile/password-attempts-lock', {
    method: 'DELETE',
  });
}

export const adminProfileApi = {
  async getProfile(): Promise<AdminProfile> {
    if (isMockApiMode) {
      return mockGetAdminProfile();
    }

    try {
      return await realGetAdminProfile();
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        return mockGetAdminProfile();
      }

      throw error;
    }
  },

  async updateProfile(payload: UpdateAdminProfilePayload): Promise<AdminProfile> {
    if (isMockApiMode) {
      return mockUpdateAdminProfile(payload);
    }

    try {
      return await realUpdateAdminProfile(payload);
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        return mockUpdateAdminProfile(payload);
      }

      throw error;
    }
  },

  async requestSuperAdminEmailChange(
    payload: RequestSuperAdminEmailChangePayload,
  ): Promise<RequestSuperAdminEmailChangeResponse> {
    if (isMockApiMode) {
      return mockRequestSuperAdminEmailChangeApi(payload);
    }

    try {
      return await realRequestSuperAdminEmailChange(payload);
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        return mockRequestSuperAdminEmailChangeApi(payload);
      }

      throw error;
    }
  },

  async confirmSuperAdminEmailChange(
    payload: ConfirmSuperAdminEmailChangePayload,
  ): Promise<AdminProfile> {
    if (isMockApiMode) {
      return mockConfirmSuperAdminEmailChangeApi(payload);
    }

    try {
      return await realConfirmSuperAdminEmailChange(payload);
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        return mockConfirmSuperAdminEmailChangeApi(payload);
      }

      throw error;
    }
  },

  async cancelSuperAdminEmailChange(): Promise<void> {
    if (isMockApiMode) {
      return mockCancelSuperAdminEmailChangeApi();
    }

    try {
      return await realCancelSuperAdminEmailChange();
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        return mockCancelSuperAdminEmailChangeApi();
      }

      throw error;
    }
  },

  async clearPasswordAttemptsLock(): Promise<AdminProfile> {
    if (isMockApiMode) {
      return mockClearPasswordAttemptsLockApi();
    }

    try {
      return await realClearPasswordAttemptsLock();
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        return mockClearPasswordAttemptsLockApi();
      }

      throw error;
    }
  },
};
