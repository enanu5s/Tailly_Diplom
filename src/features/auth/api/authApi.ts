// src/features/auth/api/authApi.ts

import { requestParsed } from '@/shared/api/requestParsed';
import { loginSuccessResponseSchema } from '@/shared/api/schemas/authUserSchema';
import { isMockApiMode } from '@/shared/config/env';

import { mockLogin } from './authApi.mock';
import { type LoginPayload, type LoginSuccessResponse } from '../model/types';

async function realLogin(payload: LoginPayload): Promise<LoginSuccessResponse> {
  return requestParsed('/auth/login', loginSuccessResponseSchema, {
    method: 'POST',
    body: payload,
  });
}

export const authApi = {
  async login(payload: LoginPayload): Promise<LoginSuccessResponse> {
    if (isMockApiMode) {
      return mockLogin(payload);
    }

    return realLogin(payload);
  },
};