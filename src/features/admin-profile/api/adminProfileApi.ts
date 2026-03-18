// src/features/admin-profile/api/adminProfileApi.ts
import { request } from '@/shared/api/http';

import {
  mockGetAdminProfile,
  mockUpdateAdminProfile,
} from './adminProfileApi.mock';
import type {
  AdminProfile,
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
};