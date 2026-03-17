// src/features/auth/data/mockAuthAccounts.ts

import {
  readManagedSpecialistAccounts,
  type ManagedSpecialistMockAccount,
} from '@/shared/lib/mock/specialistAccountsStorage';

import type { UserRole } from '../model/authStore';
import type { LoginSuccessResponse } from '../model/types';

export type MockAuthAccount = {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  middleName?: string;
  phone?: string;
  specialistId?: string;
  specialistSlug?: string;
  adminId?: string;
  isBlocked: boolean;
};

export type MockAttemptState = {
  failedAttempts: number;
  lockUntil: string | null;
};

export const MAX_ADMIN_LOGIN_ATTEMPTS = 5;
export const ADMIN_LOCK_MINUTES = 15;

const BASE_AUTH_ACCOUNTS: MockAuthAccount[] = [
  {
    id: 'client-1',
    email: 'client@tailly.local',
    password: '123456',
    role: 'client',
    firstName: 'Елена',
    lastName: 'Смирнова',
    phone: '+7 (900) 000-00-10',
    isBlocked: false,
  },
  {
    id: 'specialist-1',
    email: 'specialist@tailly.local',
    password: '123456',
    role: 'specialist',
    firstName: 'Мария',
    lastName: 'Иванова',
    middleName: '',
    phone: '+7 (900) 000-00-20',
    specialistId: 'specialist-1',
    specialistSlug: 'maria-ivanova',
    isBlocked: false,
  },
  {
    id: 'admin-1',
    email: 'admin@tailly.local',
    password: '123456',
    role: 'admin',
    firstName: 'Анна',
    lastName: 'Иванова',
    middleName: 'Сергеевна',
    phone: '+7 (900) 000-00-01',
    adminId: 'admin-1',
    isBlocked: false,
  },
  {
    id: 'super-admin-1',
    email: 'superadmin@tailly.local',
    password: '123456',
    role: 'super_admin',
    firstName: 'Мария',
    lastName: 'Петрова',
    middleName: 'Александровна',
    phone: '+7 (900) 000-00-02',
    adminId: 'super-admin-1',
    isBlocked: false,
  },
];

export const adminAttemptsMap = new Map<string, MockAttemptState>();

export function wait(delay = 350): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delay);
  });
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isAdminRole(role: UserRole): boolean {
  return role === 'admin' || role === 'super_admin';
}

export function getAdminAttemptState(email: string): MockAttemptState {
  const normalizedEmail = normalizeEmail(email);
  const current = adminAttemptsMap.get(normalizedEmail);

  if (current) {
    return current;
  }

  const initialState: MockAttemptState = {
    failedAttempts: 0,
    lockUntil: null,
  };

  adminAttemptsMap.set(normalizedEmail, initialState);

  return initialState;
}

export function resetAdminAttempts(email: string): void {
  adminAttemptsMap.set(normalizeEmail(email), {
    failedAttempts: 0,
    lockUntil: null,
  });
}

export function buildAdminLockUntilIso(): string {
  return new Date(
    Date.now() + ADMIN_LOCK_MINUTES * 60_000,
  ).toISOString();
}

export function mapManagedSpecialistAccountToAuthAccount(
  account: ManagedSpecialistMockAccount,
): MockAuthAccount {
  return {
    id: account.id,
    email: account.email,
    password: account.password,
    role: account.role,
    firstName: account.firstName,
    lastName: account.lastName,
    middleName: account.middleName,
    phone: account.phone,
    specialistId: account.specialistId,
    specialistSlug: account.specialistSlug,
    isBlocked: account.isBlocked,
  };
}

export function getMockAuthAccounts(): MockAuthAccount[] {
  const specialistAccounts = readManagedSpecialistAccounts().map(
    mapManagedSpecialistAccountToAuthAccount,
  );

  return [...BASE_AUTH_ACCOUNTS, ...specialistAccounts];
}

export function mapAccountToLoginSuccess(
  account: MockAuthAccount,
): LoginSuccessResponse {
  return {
    accessToken: `mock-token-${account.id}`,
    user: {
      id: account.id,
      email: account.email,
      role: account.role,
      firstName: account.firstName,
      lastName: account.lastName,
      middleName: account.middleName,
      phone: account.phone,
      specialistId: account.specialistId,
      specialistSlug: account.specialistSlug,
      adminId: account.adminId,
      isBlocked: account.isBlocked,
    },
  };
}