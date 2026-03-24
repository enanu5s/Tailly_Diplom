// src/features/profileSecurity/api/securityApi.ts

import { request } from '@/shared/api/http';
import { isMockApiMode } from '@/shared/config/env';

import {
  mockChangePassword,
  mockConfirmEmailChange,
  mockRequestEmailChangeCode,
} from './securityApi.mock';

/* ---------------- REAL ---------------- */

async function realRequestEmailChangeCode(): Promise<{
  requestId: string;
  maskedOldEmail: string;
}> {
  return request<{ requestId: string; maskedOldEmail: string }>(
    '/me/security/email/change/request',
    {
      method: 'POST',
    },
  );
}

async function realConfirmEmailChange(payload: {
  requestId: string;
  code: string;
  newEmail: string;
}): Promise<{ ok: true }> {
  return request<{ ok: true }>('/me/security/email/change/confirm', {
    method: 'POST',
    body: payload,
  });
}

async function realChangePassword(payload: {
  oldPassword: string;
  newPassword: string;
}): Promise<{ ok: true }> {
  return request<{ ok: true }>('/me/security/password/change', {
    method: 'POST',
    body: payload,
  });
}

/* ---------------- EXPORT ---------------- */

export const securityApi = {
  requestEmailChangeCode: () =>
    isMockApiMode ? mockRequestEmailChangeCode() : realRequestEmailChangeCode(),

  confirmEmailChange: (payload: { requestId: string; code: string; newEmail: string }) =>
    isMockApiMode ? mockConfirmEmailChange(payload) : realConfirmEmailChange(payload),

  changePassword: (payload: { oldPassword: string; newPassword: string }) =>
    isMockApiMode ? mockChangePassword(payload) : realChangePassword(payload),
};
