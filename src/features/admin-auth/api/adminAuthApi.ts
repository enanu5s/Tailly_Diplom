//src/features/admin-auth/api/adminAuthApi.ts
import { request } from '@/shared/api/http';

import { mockAdminLogin } from './adminAuthApi.mock';

import {
  type AdminLoginPayload,
  type AdminLoginSuccessResponse,
} from '../model/types';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';

async function realLogin(
  payload: AdminLoginPayload,
): Promise<AdminLoginSuccessResponse> {
  return request<AdminLoginSuccessResponse>('/admin/auth/login', {
    method: 'POST',
    body: payload,
  });
}

export const adminAuthApi = {
  async login(payload: AdminLoginPayload): Promise<AdminLoginSuccessResponse> {
    if (USE_MOCK) {
      return mockAdminLogin(payload);
    }

    return realLogin(payload);
  },
};