//src/features/admin-auth/data/mockAdminAccounts.ts

import { buildExtraMockAdminPanelAccounts } from '@/shared/mock-db/seed/demoDataset.seed';

import type { AdminLoginSuccessResponse } from '../model/types';

export type MockAdminAccount = {
  id: string;
  adminId: string;
  email: string;
  password: string;
  role: 'admin' | 'super_admin';
  firstName: string;
  lastName: string;
  middleName?: string;
  phone?: string;
  isBlocked: boolean;
};

export type MockAttemptState = {
  failedAttempts: number;
  lockUntil: string | null;
};

export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCK_MINUTES = 15;

export const MOCK_ADMIN_ACCOUNTS: MockAdminAccount[] = [
  {
    id: 'admin-1',
    adminId: 'admin-1',
    email: 'admin@tailly.local',
    password: 'Admin123!',
    role: 'admin',
    firstName: 'Анна',
    lastName: 'Иванова',
    middleName: 'Сергеевна',
    phone: '+7 (900) 000-00-01',
    isBlocked: false,
  },
  {
    id: 'super-admin-1',
    adminId: 'super-admin-1',
    email: 'superadmin@tailly.local',
    password: 'SuperAdmin123!',
    role: 'super_admin',
    firstName: 'Мария',
    lastName: 'Петрова',
    middleName: 'Александровна',
    phone: '+7 (900) 000-00-02',
    isBlocked: false,
  },
  ...buildExtraMockAdminPanelAccounts(),
];

export const attemptsMap = new Map<string, MockAttemptState>();

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function wait(delay = 450): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delay);
  });
}

export function getAttemptState(email: string): MockAttemptState {
  const normalizedEmail = normalizeEmail(email);
  const state = attemptsMap.get(normalizedEmail);

  if (state) {
    return state;
  }

  const initialState: MockAttemptState = {
    failedAttempts: 0,
    lockUntil: null,
  };

  attemptsMap.set(normalizedEmail, initialState);

  return initialState;
}

export function resetAttempts(email: string): void {
  attemptsMap.set(normalizeEmail(email), {
    failedAttempts: 0,
    lockUntil: null,
  });
}

export function buildLockedUntilIso(): string {
  return new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString();
}

export function mapAccountToLoginSuccess(
  account: MockAdminAccount,
): AdminLoginSuccessResponse {
  return {
    accessToken: `mock-admin-token-${account.id}`,
    user: {
      id: account.id,
      adminId: account.adminId,
      email: account.email,
      role: account.role,
      firstName: account.firstName,
      lastName: account.lastName,
      middleName: account.middleName,
      phone: account.phone,
      isBlocked: false,
    },
  };
}
