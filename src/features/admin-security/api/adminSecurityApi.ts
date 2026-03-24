// src/features/admin-security/api/adminSecurityApi.ts

import { request } from '@/shared/api/http';

import { mockChangeAdminPassword } from './adminSecurityApi.mock';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';

async function realChangeAdminPassword(payload: {
  oldPassword: string;
  newPassword: string;
}): Promise<{ ok: true }> {
  return request<{ ok: true }>('/admin/security/password/change', {
    method: 'POST',
    body: payload,
  });
}

export const adminSecurityApi = {
  changePassword: (payload: { oldPassword: string; newPassword: string }) =>
    USE_MOCK ? mockChangeAdminPassword(payload) : realChangeAdminPassword(payload),
};
