// src/features/auth/api/authApi.ts

import { request } from '@/shared/api/http';

import { mockLogin } from './authApi.mock';

import {
  type LoginPayload,
  type LoginSuccessResponse,
} from '../model/types';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';

async function realLogin(
  payload: LoginPayload,
): Promise<LoginSuccessResponse> {
  return request<LoginSuccessResponse>('/auth/login', {
    method: 'POST',
    body: payload,
  });
}

export const authApi = {
  async login(payload: LoginPayload): Promise<LoginSuccessResponse> {
    if (USE_MOCK) {
      return mockLogin(payload);
    }

    return realLogin(payload);
  },
};