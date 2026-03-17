// src/features/super-admin-admins-management/api/superAdminAdminsManagementApi.ts

import { request } from '@/shared/api/http';

import {
  mockCreateAdmin,
  mockDeleteAdmin,
  mockGetAdmins,
} from './superAdminAdminsManagementApi.mock';

import {
  type CreateAdminPayload,
  type CreateAdminResponse,
  type DeleteAdminPayload,
  type ManagedAdmin,
} from '../model/types';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';

async function realGetAdmins(): Promise<ManagedAdmin[]> {
  return request<ManagedAdmin[]>('/super-admin/admins');
}

async function realCreateAdmin(
  payload: CreateAdminPayload,
): Promise<CreateAdminResponse> {
  return request<CreateAdminResponse>('/super-admin/admins', {
    method: 'POST',
    body: payload,
  });
}

async function realDeleteAdmin(
  payload: DeleteAdminPayload,
): Promise<void> {
  await request<void>(`/super-admin/admins/${payload.adminId}`, {
    method: 'DELETE',
  });
}

export const superAdminAdminsManagementApi = {
  async getAdmins(): Promise<ManagedAdmin[]> {
    if (USE_MOCK) {
      return mockGetAdmins();
    }

    return realGetAdmins();
  },

  async createAdmin(
    payload: CreateAdminPayload,
  ): Promise<CreateAdminResponse> {
    if (USE_MOCK) {
      return mockCreateAdmin(payload);
    }

    return realCreateAdmin(payload);
  },

  async deleteAdmin(payload: DeleteAdminPayload): Promise<void> {
    if (USE_MOCK) {
      return mockDeleteAdmin(payload);
    }

    return realDeleteAdmin(payload);
  },
};