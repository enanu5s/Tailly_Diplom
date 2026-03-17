// src/features/profileSecurity/api/securityApi.ts

import { request } from '@/shared/api/http';

import {
  mockChangePassword,
  mockConfirmEmailChange,
  mockRequestEmailChangeCode,
} from './securityApi.mock';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';

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
    USE_MOCK ? mockRequestEmailChangeCode() : realRequestEmailChangeCode(),

  confirmEmailChange: (payload: {
    requestId: string;
    code: string;
    newEmail: string;
  }) =>
    USE_MOCK
      ? mockConfirmEmailChange(payload)
      : realConfirmEmailChange(payload),

  changePassword: (payload: {
    oldPassword: string;
    newPassword: string;
  }) =>
    USE_MOCK ? mockChangePassword(payload) : realChangePassword(payload),
};