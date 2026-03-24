// src/shared/config/mockDemoCredentials.ts
// Email и подписи фиксированы; пароли читаются из текущего mock-db (`getMockAuthAccounts`).

import {
  getMockAuthAccounts,
  hasAdminRole,
  normalizeEmail,
} from '@/features/auth/data/mockAuthAccounts';

export type MockDemoCredentialRow = {
  email: string;
  password: string;
  caption: string;
};

const UNIFIED_DEMO: readonly { email: string; caption: string }[] = [
  { email: 'client@tailly.local', caption: 'Клиент' },
  {
    email: 'specialist@tailly.local',
    caption: 'Специалист (включите «Войти как специалист»)',
  },
  { email: 'admin@tailly.local', caption: 'Администратор' },
  { email: 'superadmin@tailly.local', caption: 'Главный администратор' },
];

const ADMIN_PANEL_DEMO: readonly { email: string; caption: string }[] = [
  { email: 'admin@tailly.local', caption: 'Администратор' },
  { email: 'superadmin@tailly.local', caption: 'Главный администратор' },
];

function pickPasswordForEmail(
  accounts: ReturnType<typeof getMockAuthAccounts>,
  email: string,
  requireAdminRole: boolean,
): string {
  const n = normalizeEmail(email);
  const acc = accounts.find((a) => {
    if (normalizeEmail(a.email) !== n) {
      return false;
    }

    return !requireAdminRole || hasAdminRole(a.roles);
  });

  return acc?.password ?? '—';
}

/** Актуальные пары email/пароль из mock-db для общей формы входа. */
export function getMockUnifiedLoginDemoRows(): MockDemoCredentialRow[] {
  const accounts = getMockAuthAccounts();

  return UNIFIED_DEMO.map(({ email, caption }) => ({
    email,
    password: pickPasswordForEmail(accounts, email, false),
    caption,
  }));
}

/** Актуальные пары для формы входа администратора (только роли admin / super_admin). */
export function getMockAdminPanelLoginDemoRows(): MockDemoCredentialRow[] {
  const accounts = getMockAuthAccounts();

  return ADMIN_PANEL_DEMO.map(({ email, caption }) => ({
    email,
    password: pickPasswordForEmail(accounts, email, true),
    caption,
  }));
}
