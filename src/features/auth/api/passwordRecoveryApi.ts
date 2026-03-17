// src/features/auth/api/passwordRecoveryApi.ts

import { request } from '@/shared/api/http';

import { passwordRecoveryMockApi } from './passwordRecoveryApi.mock';

import type {
  SendRecoveryCodePayload,
  VerifyRecoveryCodePayload,
  ResetPasswordPayload,
} from '../model/types';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';

export const passwordRecoveryApi = {
  async sendCode(payload: SendRecoveryCodePayload): Promise<void> {
    if (USE_MOCK) {
      return passwordRecoveryMockApi.sendCode(payload);
    }

    return request('/auth/password-recovery/send-code', {
      method: 'POST',
      body: payload,
    });
  },

  async verifyCode(payload: VerifyRecoveryCodePayload): Promise<void> {
    if (USE_MOCK) {
      return passwordRecoveryMockApi.verifyCode(payload);
    }

    return request('/auth/password-recovery/verify-code', {
      method: 'POST',
      body: payload,
    });
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    if (USE_MOCK) {
      return passwordRecoveryMockApi.resetPassword(payload);
    }

    return request('/auth/password-recovery/reset', {
      method: 'POST',
      body: payload,
    });
  },
};