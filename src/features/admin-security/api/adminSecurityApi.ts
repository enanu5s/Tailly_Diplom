// src/features/admin-security/api/adminSecurityApi.ts

import { request } from '@/shared/api/http';
import { isMockApiMode } from '@/shared/config/env';

import { mockChangeAdminPassword } from './adminSecurityApi.mock';

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
    isMockApiMode ? mockChangeAdminPassword(payload) : realChangeAdminPassword(payload),
};
