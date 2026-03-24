// src/features/auth/api/passwordRecoveryApi.ts

import { request } from '@/shared/api/http';
import { isMockApiMode } from '@/shared/config/env';

import { passwordRecoveryMockApi } from './passwordRecoveryApi.mock';

import type {
  ResetPasswordPayload,
  SendRecoveryCodePayload,
  StartPasswordRecoveryPayload,
  StartPasswordRecoveryResponse,
  VerifyRecoveryCodePayload,
} from '../model/types';

export const passwordRecoveryApi = {
  async startRecovery(
    payload: StartPasswordRecoveryPayload,
  ): Promise<StartPasswordRecoveryResponse> {
    if (isMockApiMode) {
      return passwordRecoveryMockApi.startRecovery(payload);
    }

    return request<StartPasswordRecoveryResponse>('/auth/password-recovery/start', {
      method: 'POST',
      body: payload,
    });
  },

  async sendCode(payload: SendRecoveryCodePayload): Promise<void> {
    if (isMockApiMode) {
      return passwordRecoveryMockApi.sendCode(payload);
    }

    return request('/auth/password-recovery/send-code', {
      method: 'POST',
      body: payload,
    });
  },

  async verifyCode(payload: VerifyRecoveryCodePayload): Promise<void> {
    if (isMockApiMode) {
      return passwordRecoveryMockApi.verifyCode(payload);
    }

    return request('/auth/password-recovery/verify-code', {
      method: 'POST',
      body: payload,
    });
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    if (isMockApiMode) {
      return passwordRecoveryMockApi.resetPassword(payload);
    }

    return request('/auth/password-recovery/reset', {
      method: 'POST',
      body: payload,
    });
  },
};
