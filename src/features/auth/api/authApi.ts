// src/features/auth/api/authApi.ts

import { fetchJson } from '@/shared/api/fetchJson';
import {
  readManagedSpecialistAccounts,
  type ManagedSpecialistMockAccount,
} from '@/shared/lib/mock/specialistAccountsStorage';

import type { UserRole } from '../model/authStore';
import {
  LoginError,
  type LoginPayload,
  type LoginSuccessResponse,
} from '../model/types';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

const MAX_ADMIN_LOGIN_ATTEMPTS = 5;
const ADMIN_LOCK_MINUTES = 15;

type MockAuthAccount = {
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

type MockAttemptState = {
  failedAttempts: number;
  lockUntil: string | null;
};

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

const adminAttemptsMap = new Map<string, MockAttemptState>();

function wait(delay = 350): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delay);
  });
}

function isAdminRole(role: UserRole): boolean {
  return role === 'admin' || role === 'super_admin';
}

function getAdminAttemptState(email: string): MockAttemptState {
  const normalizedEmail = email.trim().toLowerCase();
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

function resetAdminAttempts(email: string): void {
  adminAttemptsMap.set(email.trim().toLowerCase(), {
    failedAttempts: 0,
    lockUntil: null,
  });
}

function buildAdminLockUntilIso(): string {
  return new Date(
    Date.now() + ADMIN_LOCK_MINUTES * 60_000,
  ).toISOString();
}

function mapManagedSpecialistAccountToAuthAccount(
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

function getMockAuthAccounts(): MockAuthAccount[] {
  const specialistAccounts = readManagedSpecialistAccounts().map(
    mapManagedSpecialistAccountToAuthAccount,
  );

  return [...BASE_AUTH_ACCOUNTS, ...specialistAccounts];
}

async function mockLogin(
  payload: LoginPayload,
): Promise<LoginSuccessResponse> {
  await wait();

  const email = payload.email.trim().toLowerCase();
  const password = payload.password;

  const account =
    getMockAuthAccounts().find(
      (item) => item.email.toLowerCase() === email,
    ) ?? null;


  const isAdminAccount = Boolean(account && isAdminRole(account.role));

  if (isAdminAccount) {
    const attemptState = getAdminAttemptState(email);

    if (
      attemptState.lockUntil &&
      new Date(attemptState.lockUntil).getTime() > Date.now()
    ) {
      throw new LoginError({
        code: 'TOO_MANY_ATTEMPTS',
        message:
          'Лимит попыток для администратора исчерпан. Попробуйте позже.',
        attemptsLeft: 0,
        lockUntil: attemptState.lockUntil,
      });
    }
  }

  if (!account || account.password !== password) {
    if (isAdminAccount) {
      const attemptState = getAdminAttemptState(email);
      const nextFailedAttempts = attemptState.failedAttempts + 1;
      const attemptsLeft = Math.max(
        MAX_ADMIN_LOGIN_ATTEMPTS - nextFailedAttempts,
        0,
      );

      if (attemptsLeft <= 0) {
        const lockUntil = buildAdminLockUntilIso();

        adminAttemptsMap.set(email, {
          failedAttempts: MAX_ADMIN_LOGIN_ATTEMPTS,
          lockUntil,
        });

        throw new LoginError({
          code: 'TOO_MANY_ATTEMPTS',
          message:
            'Лимит попыток для администратора исчерпан. Вход временно заблокирован.',
          attemptsLeft: 0,
          lockUntil,
        });
      }

      adminAttemptsMap.set(email, {
        failedAttempts: nextFailedAttempts,
        lockUntil: null,
      });

      throw new LoginError({
        code: 'INVALID_CREDENTIALS',
        message: 'Неверный логин или пароль.',
        attemptsLeft,
        lockUntil: null,
      });
    }

    throw new LoginError({
      code: 'INVALID_CREDENTIALS',
      message: 'Неверный логин или пароль.',
    });
  }

  if (account.isBlocked) {
    throw new LoginError({
      code: 'ACCOUNT_BLOCKED',
      message: 'Аккаунт заблокирован.',
    });
  }

  if (isAdminRole(account.role)) {
    resetAdminAttempts(email);
  }

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

async function realLogin(
  payload: LoginPayload,
): Promise<LoginSuccessResponse> {
  return fetchJson<LoginSuccessResponse>(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export const authApi = {
  async login(payload: LoginPayload): Promise<LoginSuccessResponse> {
    if (USE_MOCK) {
      return mockLogin(payload);
    }

    return realLogin(payload);
  },
};
