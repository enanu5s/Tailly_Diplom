//src/features/admin-auth/api/adminAuthApi.ts
import { HttpError } from '@/shared/api/http';
import { requestParsed } from '@/shared/api/requestParsed';
import { loginSuccessResponseSchema } from '@/shared/api/schemas/authUserSchema';
import { isMockApiMode } from '@/shared/config/env';

import { mockAdminLogin } from './adminAuthApi.mock';
import { type AdminLoginPayload, type AdminLoginSuccessResponse } from '../model/types';

async function realLogin(payload: AdminLoginPayload): Promise<AdminLoginSuccessResponse> {
  try {
    return await requestParsed('/auth/login', loginSuccessResponseSchema, {
      method: 'POST',
      body: {
        ...payload,
        requestedRole: 'super_admin',
      },
    });
  } catch (error) {
    if (!(error instanceof HttpError) || error.code !== 'Auth.InvalidRole') {
      throw error;
    }

    return requestParsed('/auth/login', loginSuccessResponseSchema, {
      method: 'POST',
      body: {
        ...payload,
        requestedRole: 'admin',
      },
    });
  }
}

export const adminAuthApi = {
  async login(payload: AdminLoginPayload): Promise<AdminLoginSuccessResponse> {
    if (isMockApiMode) {
      return mockAdminLogin(payload);
    }

    return realLogin(payload);
  },
};
