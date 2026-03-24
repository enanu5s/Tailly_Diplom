// src/features/admin-security/api/adminSecurityApi.mock.ts

import { normalizeEmail } from '@/features/admin-auth/data/mockAdminAccounts';
import {
  getMockAuthAccounts,
  hasAdminRole,
  setMockAuthBaseAccountPasswordByEmail,
  wait,
} from '@/features/auth/data/mockAuthAccounts';
import { authStore } from '@/features/auth/model/authStore';
import { isAdminRole } from '@/shared/lib/auth/roleAccess';

export async function mockChangeAdminPassword(payload: {
  oldPassword: string;
  newPassword: string;
}): Promise<{ ok: true }> {
  await wait();

  if (!payload.oldPassword.trim()) {
    throw new Error('Введите текущий пароль');
  }

  if (payload.newPassword.trim().length < 8) {
    throw new Error('Новый пароль должен быть не короче 8 символов');
  }

  const user = authStore.getState().user;

  if (!user || !isAdminRole(user.role)) {
    throw new Error('Сессия недействительна. Войдите снова.');
  }

  const email = normalizeEmail(user.email);
  const account = getMockAuthAccounts().find(
    (item) => normalizeEmail(item.email) === email && hasAdminRole(item.roles),
  );

  if (!account) {
    throw new Error('Аккаунт администратора не найден');
  }

  if (account.password !== payload.oldPassword) {
    throw new Error('Неверный текущий пароль');
  }

  setMockAuthBaseAccountPasswordByEmail(user.email, payload.newPassword.trim());

  return { ok: true };
}
