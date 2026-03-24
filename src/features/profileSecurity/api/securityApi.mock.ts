// src/features/profileSecurity/api/securityApi.mock.ts

import { getMockOldEmail, maskEmail, setMockOldEmail } from '../data/mockSecurity';

export async function mockRequestEmailChangeCode(): Promise<{
  requestId: string;
  maskedOldEmail: string;
}> {
  return {
    requestId: `req-${Math.random().toString(16).slice(2)}`,
    maskedOldEmail: maskEmail(getMockOldEmail()),
  };
}

export async function mockConfirmEmailChange(payload: {
  requestId: string;
  code: string;
  newEmail: string;
}): Promise<{ ok: true }> {
  if (payload.code.trim().length < 4) {
    throw new Error('Неверный код подтверждения');
  }

  if (!payload.newEmail.includes('@')) {
    throw new Error('Некорректная почта');
  }

  setMockOldEmail(payload.newEmail.trim());

  return { ok: true };
}

export async function mockChangePassword(payload: {
  oldPassword: string;
  newPassword: string;
}): Promise<{ ok: true }> {
  if (!payload.oldPassword.trim()) {
    throw new Error('Введите текущий пароль');
  }

  if (payload.newPassword.trim().length < 8) {
    throw new Error('Новый пароль должен быть не короче 8 символов');
  }

  return { ok: true };
}
