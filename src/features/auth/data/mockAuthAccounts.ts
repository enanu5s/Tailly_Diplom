//src/features/auth/data/mockAuthAccounts.ts

import {
  readManagedSpecialistAccounts,
  type ManagedSpecialistMockAccount,
} from '@/shared/lib/mock/specialistAccountsStorage';
import {
  ensureMockDatabaseLoaded,
  patchMockDatabase,
  persistMockDatabase,
  unsafeMutableMockDb,
} from '@/shared/mock-db/store';

import {
  getActiveSoftDeleteRecord,
  getPermanentDeletedIds,
  purgeExpiredSoftDeletes,
} from './mockAccountDeletionStorage';

import type { UserRole } from '../model/authStore';
import type { LoginSuccessResponse } from '../model/types';

/** Блокировка в mock только для указанной роли (клиент / специалист). */
export type MockRoleBlockState = {
  isBlocked: boolean;
  blockReason?: string;
  blockedUntil?: string;
  isPermanentBlock?: boolean;
};

export type MockAuthAccount = {
  id: string;
  email: string;
  password: string;
  roles: UserRole[];
  firstName: string;
  lastName: string;
  middleName?: string;
  phone?: string;
  specialistId?: string;
  specialistSlug?: string;
  adminId?: string;
  isBlocked: boolean;
  blockReason?: string;
  blockedUntil?: string;
  /** Бессрочная блокировка (mock, по аналогии с управлением пользователями) */
  isPermanentBlock?: boolean;
  /**
   * Если задано — блокировка по роли (как на бэкенде). Иначе используются общие поля isBlocked* (legacy).
   */
  roleBlock?: Partial<Record<'client' | 'specialist', MockRoleBlockState>>;
  softDeletedAt?: string;
  softDeleteRestoreUntil?: string;
};

export type MockAttemptState = {
  failedAttempts: number;
  lockUntil: string | null;
};

export const MAX_ADMIN_LOGIN_ATTEMPTS = 5;
export const ADMIN_LOCK_MINUTES = 15;

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

export function hasAdminRole(roles: UserRole[]): boolean {
  return roles.some((role) => isAdminRole(role));
}

export function syncBlockedState(account: MockAuthAccount): void {
  if (!account.isBlocked || !account.blockedUntil) {
    return;
  }

  const blockedUntilTime = new Date(account.blockedUntil).getTime();

  if (Number.isNaN(blockedUntilTime)) {
    return;
  }

  if (blockedUntilTime <= Date.now()) {
    account.isBlocked = false;
    account.blockedUntil = undefined;
    account.blockReason = undefined;
  }
}

export function isMockRoleBlockEffective(slice: MockRoleBlockState): boolean {
  if (slice.isPermanentBlock) {
    return true;
  }

  if (slice.blockedUntil) {
    const t = new Date(slice.blockedUntil).getTime();

    if (Number.isNaN(t)) {
      return slice.isBlocked;
    }

    return t > Date.now();
  }

  return slice.isBlocked;
}

export function syncRoleBlockStates(account: MockAuthAccount): void {
  if (!account.roleBlock) {
    return;
  }

  for (const key of ['client', 'specialist'] as const) {
    const slice = account.roleBlock[key];

    if (!slice || slice.isPermanentBlock || !slice.blockedUntil) {
      continue;
    }

    const t = new Date(slice.blockedUntil).getTime();

    if (Number.isNaN(t) || t > Date.now()) {
      continue;
    }

    account.roleBlock[key] = {
      isBlocked: false,
      isPermanentBlock: false,
      blockedUntil: undefined,
      blockReason: undefined,
    };
  }
}

/** Блокировка входа для запрошенной роли (client / specialist / admin). */
export function isRoleLoginBlocked(account: MockAuthAccount, requestedRole: UserRole): boolean {
  syncBlockedState(account);
  syncRoleBlockStates(account);

  if (isAdminRole(requestedRole)) {
    return account.isBlocked;
  }

  if (requestedRole !== 'client' && requestedRole !== 'specialist') {
    return account.isBlocked;
  }

  const slice = account.roleBlock?.[requestedRole];

  if (slice !== undefined) {
    return isMockRoleBlockEffective(slice);
  }

  return account.isBlocked;
}

/** Поля блокировки для карточки пользователя в админке (по роли). */
export function getMockBlockFieldsForRole(
  account: MockAuthAccount,
  role: 'client' | 'specialist',
): {
  isBlocked: boolean;
  blockReason?: string;
  blockedUntil?: string;
  isPermanentBlock: boolean;
} {
  syncBlockedState(account);
  syncRoleBlockStates(account);

  const slice = account.roleBlock?.[role];

  if (slice !== undefined) {
    return {
      isBlocked: isMockRoleBlockEffective(slice),
      blockReason: slice.blockReason,
      blockedUntil: slice.blockedUntil,
      isPermanentBlock: Boolean(slice.isPermanentBlock),
    };
  }

  return {
    isBlocked: account.isBlocked,
    blockReason: account.blockReason,
    blockedUntil: account.blockedUntil,
    isPermanentBlock: Boolean(account.isPermanentBlock),
  };
}

export function getAdminAttemptState(email: string): MockAttemptState {
  ensureMockDatabaseLoaded();

  const normalizedEmail = normalizeEmail(email);
  const db = unsafeMutableMockDb();
  const current = db.auth.adminAttempts[normalizedEmail];

  if (current) {
    return current;
  }

  const initialState: MockAttemptState = {
    failedAttempts: 0,
    lockUntil: null,
  };

  db.auth.adminAttempts[normalizedEmail] = initialState;
  persistMockDatabase();

  return initialState;
}

export function putAdminAttemptState(email: string, state: MockAttemptState): void {
  ensureMockDatabaseLoaded();

  const db = unsafeMutableMockDb();
  db.auth.adminAttempts[normalizeEmail(email)] = state;
  persistMockDatabase();
}

export function resetAdminAttempts(email: string): void {
  putAdminAttemptState(email, {
    failedAttempts: 0,
    lockUntil: null,
  });
}

export function setMockAuthBaseAccountPasswordByEmail(
  email: string,
  password: string,
): void {
  const normalized = normalizeEmail(email);

  patchMockDatabase((db) => {
    const acc = db.auth.baseAccounts.find(
      (item) => normalizeEmail(item.email) === normalized,
    );

    if (acc) {
      acc.password = password;
    }
  });
}

export function buildAdminLockUntilIso(): string {
  return new Date(Date.now() + ADMIN_LOCK_MINUTES * 60_000).toISOString();
}

export function mapManagedSpecialistAccountToAuthAccount(
  account: ManagedSpecialistMockAccount,
): MockAuthAccount {
  return {
    id: account.id,
    email: account.email,
    password: account.password,
    roles: [account.role],
    firstName: account.firstName,
    lastName: account.lastName,
    middleName: account.middleName,
    phone: account.phone,
    specialistId: account.specialistId,
    specialistSlug: account.specialistSlug,
    isBlocked: account.isBlocked,
    blockReason:
      'blockReason' in account && typeof account.blockReason === 'string'
        ? account.blockReason
        : undefined,
    blockedUntil:
      'blockedUntil' in account && typeof account.blockedUntil === 'string'
        ? account.blockedUntil
        : undefined,
  };
}

function buildDeduplicationKey(account: MockAuthAccount): string {
  if (account.roles.includes('specialist') && account.specialistId?.trim()) {
    return `specialist:${account.specialistId.trim().toLowerCase()}`;
  }

  return `email:${normalizeEmail(account.email)}`;
}

function mergeRoles(currentRoles: UserRole[], nextRoles: UserRole[]): UserRole[] {
  return Array.from(new Set([...currentRoles, ...nextRoles]));
}

function chooseMoreCompleteAccount(
  currentAccount: MockAuthAccount,
  nextAccount: MockAuthAccount,
): MockAuthAccount {
  const currentScore =
    Number(Boolean(currentAccount.firstName)) +
    Number(Boolean(currentAccount.lastName)) +
    Number(Boolean(currentAccount.middleName)) +
    Number(Boolean(currentAccount.phone)) +
    Number(Boolean(currentAccount.specialistId)) +
    Number(Boolean(currentAccount.specialistSlug)) +
    Number(Boolean(currentAccount.blockReason)) +
    Number(Boolean(currentAccount.blockedUntil));

  const nextScore =
    Number(Boolean(nextAccount.firstName)) +
    Number(Boolean(nextAccount.lastName)) +
    Number(Boolean(nextAccount.middleName)) +
    Number(Boolean(nextAccount.phone)) +
    Number(Boolean(nextAccount.specialistId)) +
    Number(Boolean(nextAccount.specialistSlug)) +
    Number(Boolean(nextAccount.blockReason)) +
    Number(Boolean(nextAccount.blockedUntil));

  const baseAccount = nextScore > currentScore ? nextAccount : currentAccount;

  return {
    ...baseAccount,
    roles: mergeRoles(currentAccount.roles, nextAccount.roles),
    roleBlock: {
      ...currentAccount.roleBlock,
      ...nextAccount.roleBlock,
    },
  };
}

export function getMockAuthAccounts(): MockAuthAccount[] {
  ensureMockDatabaseLoaded();
  purgeExpiredSoftDeletes();

  const permanent = getPermanentDeletedIds();

  const specialistAccounts = readManagedSpecialistAccounts().map(
    mapManagedSpecialistAccountToAuthAccount,
  );

  const baseAccounts = unsafeMutableMockDb().auth.baseAccounts;
  const mergedAccounts = [...baseAccounts, ...specialistAccounts];
  const uniqueAccountsMap = new Map<string, MockAuthAccount>();

  for (const account of mergedAccounts) {
    syncBlockedState(account);

    const key = buildDeduplicationKey(account);
    const existingAccount = uniqueAccountsMap.get(key);

    if (!existingAccount) {
      uniqueAccountsMap.set(key, account);
      continue;
    }

    uniqueAccountsMap.set(key, chooseMoreCompleteAccount(existingAccount, account));
  }

  return Array.from(uniqueAccountsMap.values())
    .filter((account) => !permanent.has(account.id))
    .map((account) => {
      const rec = getActiveSoftDeleteRecord(account.id);

      if (!rec) {
        return account;
      }

      return {
        ...account,
        isBlocked: false,
        blockReason: undefined,
        blockedUntil: undefined,
        softDeletedAt: rec.softDeletedAt,
        softDeleteRestoreUntil: rec.restoreUntil,
      };
    });
}

export function mapAccountToLoginSuccess(
  account: MockAuthAccount,
  activeRole: UserRole,
): LoginSuccessResponse {
  syncBlockedState(account);
  syncRoleBlockStates(account);

  return {
    accessToken: `mock-token-${account.id}-${activeRole}`,
    user: {
      id: account.id,
      email: account.email,
      role: activeRole,
      firstName: account.firstName,
      lastName: account.lastName,
      middleName: account.middleName,
      phone: account.phone,
      specialistId: account.specialistId,
      specialistSlug: account.specialistSlug,
      adminId: account.adminId,
      isBlocked: isRoleLoginBlocked(account, activeRole),
    },
  };
}
