// src/shared/lib/mock/specialistAccountsStorage.ts

import {
  ensureMockDatabaseLoaded,
  patchMockDatabase,
  persistMockDatabase,
  unsafeMutableMockDb,
} from '@/shared/mock-db/store';

import { cloneDeep } from '@/shared/mock-db/cloneDeep';
import { SEED_MANAGED_SPECIALISTS } from '@/shared/mock-db/seed/managedSpecialists.seed';

export type ManagedSpecialistMockAccount = {
  id: string;
  email: string;
  password: string;
  role: 'specialist';
  firstName: string;
  lastName: string;
  middleName?: string;
  phone?: string;
  city: string;
  about: string;
  specialistId: string;
  specialistSlug?: string;
  applicationId?: string;
  createdAt: string;
  createdBy: string;
  isBlocked: boolean;
  blockReason?: string;
  blockedUntil?: string;
  isPermanentBlock?: boolean;
};

function cloneAccounts(
  accounts: ManagedSpecialistMockAccount[],
): ManagedSpecialistMockAccount[] {
  return cloneDeep(accounts);
}

function normalizeOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function normalizeAccounts(
  value: unknown,
): ManagedSpecialistMockAccount[] {
  if (!Array.isArray(value)) {
    return cloneAccounts(SEED_MANAGED_SPECIALISTS);
  }

  const result = value
    .filter(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as ManagedSpecialistMockAccount).id === 'string' &&
        typeof (item as ManagedSpecialistMockAccount).email === 'string' &&
        typeof (item as ManagedSpecialistMockAccount).password === 'string',
    )
    .map((item) => {
      const account = item as ManagedSpecialistMockAccount;

      return {
        ...account,
        blockReason: normalizeOptionalString(account.blockReason),
        blockedUntil: normalizeOptionalString(account.blockedUntil),
        isBlocked: Boolean(account.isBlocked),
        isPermanentBlock: Boolean(account.isPermanentBlock),
      };
    }) as ManagedSpecialistMockAccount[];

  return cloneAccounts(result);
}

export function syncManagedSpecialistBlockedState(
  account: ManagedSpecialistMockAccount,
): ManagedSpecialistMockAccount {
  if (!account.isBlocked) {
    return account;
  }

  if (account.isPermanentBlock) {
    return account;
  }

  if (!account.blockedUntil) {
    return account;
  }

  const blockedUntilTime = new Date(account.blockedUntil).getTime();

  if (Number.isNaN(blockedUntilTime)) {
    return account;
  }

  if (blockedUntilTime <= Date.now()) {
    return {
      ...account,
      isBlocked: false,
      blockReason: undefined,
      blockedUntil: undefined,
      isPermanentBlock: false,
    };
  }

  return account;
}

export function ensureManagedSpecialistAccountsSeed(): void {
  ensureMockDatabaseLoaded();
}

export function readManagedSpecialistAccounts(): ManagedSpecialistMockAccount[] {
  ensureMockDatabaseLoaded();

  const db = unsafeMutableMockDb();
  const normalizedAccounts = normalizeAccounts(db.specialists.managed);

  const syncedAccounts = normalizedAccounts.map(syncManagedSpecialistBlockedState);

  const hasChanges = syncedAccounts.some((account, index) => {
    const original = normalizedAccounts[index];

    return (
      original.isBlocked !== account.isBlocked ||
      original.blockReason !== account.blockReason ||
      original.blockedUntil !== account.blockedUntil ||
      Boolean(original.isPermanentBlock) !== Boolean(account.isPermanentBlock)
    );
  });

  if (hasChanges) {
    db.specialists.managed = syncedAccounts;
    persistMockDatabase();
  }

  return cloneAccounts(syncedAccounts);
}

export function writeManagedSpecialistAccounts(
  accounts: ManagedSpecialistMockAccount[],
): void {
  patchMockDatabase((db) => {
    db.specialists.managed = cloneDeep(accounts);
  });
}

export function upsertManagedSpecialistAccount(
  account: ManagedSpecialistMockAccount,
): void {
  patchMockDatabase((db) => {
    const accounts = [...db.specialists.managed];
    const existingIndex = accounts.findIndex((item) => item.id === account.id);

    if (existingIndex === -1) {
      accounts.unshift(account);
    } else {
      accounts[existingIndex] = account;
    }

    db.specialists.managed = accounts;
  });
}

export function updateManagedSpecialistAccount(
  specialistId: string,
  updater: (
    account: ManagedSpecialistMockAccount,
  ) => ManagedSpecialistMockAccount,
): ManagedSpecialistMockAccount {
  ensureMockDatabaseLoaded();

  const db = unsafeMutableMockDb();
  const accounts = [...db.specialists.managed];
  const targetIndex = accounts.findIndex(
    (item) => item.id === specialistId || item.specialistId === specialistId,
  );

  if (targetIndex === -1) {
    throw new Error('Специалист не найден в mock storage.');
  }

  const updated = updater(accounts[targetIndex]);
  accounts[targetIndex] = updated;
  db.specialists.managed = accounts;
  persistMockDatabase();

  return cloneDeep(updated);
}
