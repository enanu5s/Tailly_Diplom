// src/features/super-admin-admins-management/api/superAdminAdminsManagementApi.ts

import { request } from '@/shared/api/http';
import { isMockApiMode } from '@/shared/config/env';

import {
  mockCreateAdmin,
  mockDeleteAdmin,
  mockGetAdmins,
  mockUpdateAdmin,
} from './superAdminAdminsManagementApi.mock';
import {
  type CreateAdminPayload,
  type CreateAdminResponse,
  type DeleteAdminPayload,
  type ManagedAdmin,
  type UpdateAdminPayload,
} from '../model/types';

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

async function realDeleteAdmin(payload: DeleteAdminPayload): Promise<void> {
  await request<void>(`/super-admin/admins/${payload.adminId}`, {
    method: 'DELETE',
  });
}

async function realUpdateAdmin(payload: UpdateAdminPayload): Promise<ManagedAdmin> {
  const { adminId, ...body } = payload;
  return request<ManagedAdmin>(`/super-admin/admins/${adminId}`, {
    method: 'PATCH',
    body,
  });
}

export const superAdminAdminsManagementApi = {
  async getAdmins(): Promise<ManagedAdmin[]> {
    if (isMockApiMode) {
      return mockGetAdmins();
    }

    return realGetAdmins();
  },

  async createAdmin(payload: CreateAdminPayload): Promise<CreateAdminResponse> {
    if (isMockApiMode) {
      return mockCreateAdmin(payload);
    }

    return realCreateAdmin(payload);
  },

  async deleteAdmin(payload: DeleteAdminPayload): Promise<void> {
    if (isMockApiMode) {
      return mockDeleteAdmin(payload);
    }

    return realDeleteAdmin(payload);
  },

  async updateAdmin(payload: UpdateAdminPayload): Promise<ManagedAdmin> {
    if (isMockApiMode) {
      return mockUpdateAdmin(payload);
    }

    return realUpdateAdmin(payload);
  },
};
