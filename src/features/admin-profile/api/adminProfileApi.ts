// src/features/admin-profile/api/adminProfileApi.ts
import { request } from '@/shared/api/http';
import { getOptionalApiBaseUrl, isMockApiMode } from '@/shared/config/env';

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

const API_BASE_URL = getOptionalApiBaseUrl();

async function realGetAdminProfile(): Promise<AdminProfile> {
  return request<AdminProfile>(`${API_BASE_URL}/admin/profile`);
}

async function realUpdateAdminProfile(
  payload: UpdateAdminProfilePayload,
): Promise<AdminProfile> {
  return request<AdminProfile>(`${API_BASE_URL}/admin/profile`, {
    method: 'PATCH',
    body: payload,
  });
}

async function realRequestSuperAdminEmailChange(
  payload: RequestSuperAdminEmailChangePayload,
): Promise<RequestSuperAdminEmailChangeResponse> {
  return request<RequestSuperAdminEmailChangeResponse>(
    `${API_BASE_URL}/admin/profile/email-change/request`,
    {
      method: 'POST',
      body: payload,
    },
  );
}

async function realConfirmSuperAdminEmailChange(
  payload: ConfirmSuperAdminEmailChangePayload,
): Promise<AdminProfile> {
  return request<AdminProfile>(`${API_BASE_URL}/admin/profile/email-change/confirm`, {
    method: 'POST',
    body: payload,
  });
}

async function realCancelSuperAdminEmailChange(): Promise<void> {
  await request<void>(`${API_BASE_URL}/admin/profile/email-change`, {
    method: 'DELETE',
  });
}

async function realClearPasswordAttemptsLock(): Promise<AdminProfile> {
  return request<AdminProfile>(`${API_BASE_URL}/admin/profile/password-attempts-lock`, {
    method: 'DELETE',
  });
}

export const adminProfileApi = {
  async getProfile(): Promise<AdminProfile> {
    if (isMockApiMode) {
      return mockGetAdminProfile();
    }

    return realGetAdminProfile();
  },

  async updateProfile(payload: UpdateAdminProfilePayload): Promise<AdminProfile> {
    if (isMockApiMode) {
      return mockUpdateAdminProfile(payload);
    }

    return realUpdateAdminProfile(payload);
  },

  async requestSuperAdminEmailChange(
    payload: RequestSuperAdminEmailChangePayload,
  ): Promise<RequestSuperAdminEmailChangeResponse> {
    if (isMockApiMode) {
      return mockRequestSuperAdminEmailChangeApi(payload);
    }

    return realRequestSuperAdminEmailChange(payload);
  },

  async confirmSuperAdminEmailChange(
    payload: ConfirmSuperAdminEmailChangePayload,
  ): Promise<AdminProfile> {
    if (isMockApiMode) {
      return mockConfirmSuperAdminEmailChangeApi(payload);
    }

    return realConfirmSuperAdminEmailChange(payload);
  },

  async cancelSuperAdminEmailChange(): Promise<void> {
    if (isMockApiMode) {
      return mockCancelSuperAdminEmailChangeApi();
    }

    return realCancelSuperAdminEmailChange();
  },

  async clearPasswordAttemptsLock(): Promise<AdminProfile> {
    if (isMockApiMode) {
      return mockClearPasswordAttemptsLockApi();
    }

    return realClearPasswordAttemptsLock();
  },
};
