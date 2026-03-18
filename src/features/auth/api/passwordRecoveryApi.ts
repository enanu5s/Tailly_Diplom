// src/features/auth/api/passwordRecoveryApi.ts

import { request } from '@/shared/api/http';

import { passwordRecoveryMockApi } from './passwordRecoveryApi.mock';

import type {
  ResetPasswordPayload,
  SendRecoveryCodePayload,
  StartPasswordRecoveryPayload,
  StartPasswordRecoveryResponse,
  VerifyRecoveryCodePayload,
} from '../model/types';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export const passwordRecoveryApi = {
  async startRecovery(
    payload: StartPasswordRecoveryPayload,
  ): Promise<StartPasswordRecoveryResponse> {
    if (USE_MOCK) {
      return passwordRecoveryMockApi.startRecovery(payload);
    }

    return request<StartPasswordRecoveryResponse>(
      `${API_BASE_URL}/auth/password-recovery/start`,
      {
        method: 'POST',
        body: payload,
      },
    );
  },

  async sendCode(payload: SendRecoveryCodePayload): Promise<void> {
    if (USE_MOCK) {
      return passwordRecoveryMockApi.sendCode(payload);
    }

    return request(`${API_BASE_URL}/auth/password-recovery/send-code`, {
      method: 'POST',
      body: payload,
    });
  },

  async verifyCode(payload: VerifyRecoveryCodePayload): Promise<void> {
    if (USE_MOCK) {
      return passwordRecoveryMockApi.verifyCode(payload);
    }

    return request(`${API_BASE_URL}/auth/password-recovery/verify-code`, {
      method: 'POST',
      body: payload,
    });
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    if (USE_MOCK) {
      return passwordRecoveryMockApi.resetPassword(payload);
    }

    return request(`${API_BASE_URL}/auth/password-recovery/reset`, {
      method: 'POST',
      body: payload,
    });
  },
};