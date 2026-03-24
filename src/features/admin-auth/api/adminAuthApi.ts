//src/features/admin-auth/api/adminAuthApi.ts
import { requestParsed } from '@/shared/api/requestParsed';
import { loginSuccessResponseSchema } from '@/shared/api/schemas/authUserSchema';
import { isMockApiMode } from '@/shared/config/env';

import { mockAdminLogin } from './adminAuthApi.mock';
import { type AdminLoginPayload, type AdminLoginSuccessResponse } from '../model/types';

async function realLogin(payload: AdminLoginPayload): Promise<AdminLoginSuccessResponse> {
  return requestParsed('/admin/auth/login', loginSuccessResponseSchema, {
    method: 'POST',
    body: payload,
  });
}

export const adminAuthApi = {
  async login(payload: AdminLoginPayload): Promise<AdminLoginSuccessResponse> {
    if (isMockApiMode) {
      return mockAdminLogin(payload);
    }

    return realLogin(payload);
  },
};
