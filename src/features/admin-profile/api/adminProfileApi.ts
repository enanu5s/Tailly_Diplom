// src/features/admin-profile/api/adminProfileApi.ts
import { request } from '@/shared/api/http';

import {
  mockCancelSuperAdminEmailChangeApi,
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

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

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
  return request<AdminProfile>(
    `${API_BASE_URL}/admin/profile/email-change/confirm`,
    {
      method: 'POST',
      body: payload,
    },
  );
}

async function realCancelSuperAdminEmailChange(): Promise<void> {
  await request<void>(`${API_BASE_URL}/admin/profile/email-change`, {
    method: 'DELETE',
  });
}

export const adminProfileApi = {
  async getProfile(): Promise<AdminProfile> {
    if (USE_MOCK) {
      return mockGetAdminProfile();
    }

    return realGetAdminProfile();
  },

  async updateProfile(
    payload: UpdateAdminProfilePayload,
  ): Promise<AdminProfile> {
    if (USE_MOCK) {
      return mockUpdateAdminProfile(payload);
    }

    return realUpdateAdminProfile(payload);
  },

  async requestSuperAdminEmailChange(
    payload: RequestSuperAdminEmailChangePayload,
  ): Promise<RequestSuperAdminEmailChangeResponse> {
    if (USE_MOCK) {
      return mockRequestSuperAdminEmailChangeApi(payload);
    }

    return realRequestSuperAdminEmailChange(payload);
  },

  async confirmSuperAdminEmailChange(
    payload: ConfirmSuperAdminEmailChangePayload,
  ): Promise<AdminProfile> {
    if (USE_MOCK) {
      return mockConfirmSuperAdminEmailChangeApi(payload);
    }

    return realConfirmSuperAdminEmailChange(payload);
  },

  async cancelSuperAdminEmailChange(): Promise<void> {
    if (USE_MOCK) {
      return mockCancelSuperAdminEmailChangeApi();
    }

    return realCancelSuperAdminEmailChange();
  },
};