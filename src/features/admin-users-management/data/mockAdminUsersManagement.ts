// src/features/admin-users-management/data/mockAdminUsersManagement.ts

import {
  getActiveSoftDeleteRecord,
  removeSoftDeleteRecord,
} from '@/features/auth/data/mockAccountDeletionStorage';
import { getMockAuthAccounts } from '@/features/auth/data/mockAuthAccounts';
import { notifyAccountBlocked } from '@/shared/lib/emailNotifications';
import {
  updateManagedSpecialistAccount,
  type ManagedSpecialistMockAccount,
} from '@/shared/lib/mock/specialistAccountsStorage';

import {
  AdminUsersManagementError,
  type ManagedUser,
  type ManagedUserRole,
  type RestoreManagedUserFromDeletionPayload,
  type UpdateManagedUserProfilePayload,
  type UpdateUserBlockStatusPayload,
} from '../model/types';

type MockAuthAccount = ReturnType<typeof getMockAuthAccounts>[number];

type ExtendedMockAuthAccount = MockAuthAccount & {
  blockReason?: string;
  blockedUntil?: string;
  isPermanentBlock?: boolean;
};

const SPECIALIST_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function wait(delay = 250): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delay);
  });
}

function buildDisplayName(account: MockAuthAccount): string | undefined {
  const value = [
    typeof account.lastName === 'string' ? account.lastName.trim() : '',
    typeof account.firstName === 'string' ? account.firstName.trim() : '',
    typeof account.middleName === 'string' ? account.middleName.trim() : '',
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  return value || undefined;
}

function getAccountManagedRole(account: MockAuthAccount): ManagedUserRole | null {
  if (account.roles.includes('specialist')) {
    return 'specialist';
  }

  if (account.roles.includes('client')) {
    return 'client';
  }

  return null;
}

function syncAutoUnblock(account: ExtendedMockAuthAccount): void {
  if (!account.isBlocked) {
    return;
  }

  if (account.isPermanentBlock) {
    return;
  }

  if (!account.blockedUntil) {
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
    account.isPermanentBlock = false;
  }
}

function mapAccountToManagedUser(account: ExtendedMockAuthAccount): ManagedUser {
  syncAutoUnblock(account);

  const role = getAccountManagedRole(account);
  const deletion = getActiveSoftDeleteRecord(account.id);

  return JSON.parse(
    JSON.stringify({
      id: account.id,
      email: account.email,
      role: role ?? 'client',
      firstName: account.firstName,
      lastName: account.lastName,
      middleName: account.middleName,
      name: buildDisplayName(account),
      specialistId: account.specialistId,
      specialistSlug: account.specialistSlug,
      isBlocked: Boolean(account.isBlocked),
      blockReason: account.blockReason,
      blockedUntil: account.blockedUntil,
      isPermanentBlock: Boolean(account.isPermanentBlock),
      isScheduledForDeletion: Boolean(deletion),
      scheduledDeletionDeadline: deletion?.restoreUntil,
    }),
  ) as ManagedUser;
}

function buildDeduplicationKey(account: ExtendedMockAuthAccount): string {
  if (account.roles.includes('specialist') && account.specialistId?.trim()) {
    return `specialist:${account.specialistId.trim().toLowerCase()}`;
  }

  if (account.email?.trim()) {
    return `email:${account.email.trim().toLowerCase()}`;
  }

  return `id:${account.id}`;
}

function persistSpecialistBlockState(account: ExtendedMockAuthAccount): void {
  if (!account.roles.includes('specialist')) {
    return;
  }

  const specialistKey = account.specialistId || account.id;

  updateManagedSpecialistAccount(
    specialistKey,
    (
      currentAccount: ManagedSpecialistMockAccount,
    ): ManagedSpecialistMockAccount => ({
      ...currentAccount,
      isBlocked: account.isBlocked,
      blockReason: account.blockReason,
      blockedUntil: account.blockedUntil,
      isPermanentBlock: Boolean(account.isPermanentBlock),
    }),
  );
}

function persistSpecialistProfilePatch(
  account: ExtendedMockAuthAccount,
  patch: Partial<
    Pick<
      ManagedSpecialistMockAccount,
      'firstName' | 'lastName' | 'middleName' | 'specialistSlug'
    >
  >,
): void {
  if (!account.roles.includes('specialist')) {
    return;
  }

  const specialistKey = account.specialistId || account.id;

  try {
    updateManagedSpecialistAccount(
      specialistKey,
      (currentAccount: ManagedSpecialistMockAccount): ManagedSpecialistMockAccount => ({
        ...currentAccount,
        ...patch,
      }),
    );
  } catch {
    /* аккаунт может быть только в BASE_AUTH_ACCOUNTS без записи в storage */
  }
}

export function cloneManagedUsers(): ManagedUser[] {
  const accounts = getMockAuthAccounts()
    .filter((account) => getAccountManagedRole(account) !== null)
    .map((account) => account as ExtendedMockAuthAccount);

  const uniqueAccountsMap = new Map<string, ExtendedMockAuthAccount>();

  for (const account of accounts) {
    syncAutoUnblock(account);

    if (account.roles.includes('specialist')) {
      persistSpecialistBlockState(account);
    }

    const dedupeKey = buildDeduplicationKey(account);

    if (!uniqueAccountsMap.has(dedupeKey)) {
      uniqueAccountsMap.set(dedupeKey, account);
      continue;
    }

    const currentSavedAccount = uniqueAccountsMap.get(dedupeKey)!;

    const currentSavedHasMoreSpecificIdentity =
      Boolean(currentSavedAccount.specialistId) ||
      Boolean(currentSavedAccount.specialistSlug) ||
      Boolean(currentSavedAccount.firstName) ||
      Boolean(currentSavedAccount.lastName);

    const nextHasMoreSpecificIdentity =
      Boolean(account.specialistId) ||
      Boolean(account.specialistSlug) ||
      Boolean(account.firstName) ||
      Boolean(account.lastName);

    if (!currentSavedHasMoreSpecificIdentity && nextHasMoreSpecificIdentity) {
      uniqueAccountsMap.set(dedupeKey, account);
    }
  }

  return Array.from(uniqueAccountsMap.values()).map(mapAccountToManagedUser);
}

export function updateManagedUserBlockedStatus(
  payload: UpdateUserBlockStatusPayload,
): ManagedUser {
  const accounts = getMockAuthAccounts() as ExtendedMockAuthAccount[];

  const account = accounts.find(
    (item) =>
      item.id === payload.userId && getAccountManagedRole(item) !== null,
  );

  if (!account) {
    throw new AdminUsersManagementError('Пользователь не найден.');
  }

  syncAutoUnblock(account);

  if (payload.isBlocked) {
    const normalizedReason = payload.blockReason?.trim();
    const normalizedBlockedUntil = payload.blockedUntil?.trim();
    const isPermanentBlock = Boolean(payload.isPermanentBlock);

    if (!normalizedReason) {
      throw new AdminUsersManagementError('Укажите причину блокировки.');
    }

    if (!isPermanentBlock) {
      if (!normalizedBlockedUntil) {
        throw new AdminUsersManagementError(
          'Укажите дату окончания блокировки.',
        );
      }

      const blockedUntilTime = new Date(normalizedBlockedUntil).getTime();

      if (Number.isNaN(blockedUntilTime)) {
        throw new AdminUsersManagementError(
          'Некорректная дата окончания блокировки.',
        );
      }

      if (blockedUntilTime <= Date.now()) {
        throw new AdminUsersManagementError(
          'Дата окончания блокировки должна быть в будущем.',
        );
      }
    }

    account.isBlocked = true;
    account.blockReason = normalizedReason;
    account.blockedUntil = isPermanentBlock
      ? undefined
      : normalizedBlockedUntil;
    account.isPermanentBlock = isPermanentBlock;

    const userName =
      `${account.firstName ?? ''} ${account.lastName ?? ''}`.trim() || 'пользователь';
    const blockedUntilLabel = isPermanentBlock
      ? 'бессрочно (до решения администрации)'
      : new Date(normalizedBlockedUntil!).toLocaleString('ru-RU', {
          dateStyle: 'long',
          timeStyle: 'short',
        });

    notifyAccountBlocked({
      email: account.email,
      userName,
      reason: normalizedReason,
      blockedUntilLabel,
    });
  } else {
    account.isBlocked = false;
    account.blockReason = undefined;
    account.blockedUntil = undefined;
    account.isPermanentBlock = false;
  }

  if (account.roles.includes('specialist')) {
    persistSpecialistBlockState(account);
  }

  return mapAccountToManagedUser(account);
}

export function updateManagedUserProfile(
  payload: UpdateManagedUserProfilePayload,
): ManagedUser {
  const accounts = getMockAuthAccounts();
  const account = accounts.find(
    (item) =>
      item.id === payload.userId && getAccountManagedRole(item) !== null,
  ) as ExtendedMockAuthAccount | undefined;

  if (!account) {
    throw new AdminUsersManagementError('Пользователь не найден.');
  }

  const firstName = payload.firstName.trim();
  const lastName = payload.lastName.trim();

  if (!firstName || !lastName) {
    throw new AdminUsersManagementError('Укажите имя и фамилию.');
  }

  const middleName = payload.middleName?.trim();

  account.firstName = firstName;
  account.lastName = lastName;
  account.middleName = middleName || undefined;

  const managedRole = getAccountManagedRole(account);

  if (managedRole === 'specialist') {
    if (payload.specialistSlug !== undefined) {
      const raw = payload.specialistSlug.trim().toLowerCase();

      if (!raw) {
        throw new AdminUsersManagementError('Slug не может быть пустым.');
      }

      if (!SPECIALIST_SLUG_PATTERN.test(raw)) {
        throw new AdminUsersManagementError(
          'Slug: только латиница в нижнем регистре, цифры и дефисы (например, maria-ivanova).',
        );
      }

      const myKey = account.specialistId || account.id;

      const slugTaken = accounts.some((u) => {
        if (getAccountManagedRole(u) !== 'specialist') {
          return false;
        }

        const uSlug = u.specialistSlug?.trim().toLowerCase() ?? '';

        if (uSlug !== raw) {
          return false;
        }

        const uKey = u.specialistId || u.id;

        return uKey !== myKey;
      });

      if (slugTaken) {
        throw new AdminUsersManagementError(
          'Такой slug уже занят другим специалистом.',
        );
      }

      account.specialistSlug = raw;

      persistSpecialistProfilePatch(account, {
        firstName: account.firstName,
        lastName: account.lastName,
        middleName: account.middleName,
        specialistSlug: raw,
      });
    } else {
      persistSpecialistProfilePatch(account, {
        firstName: account.firstName,
        lastName: account.lastName,
        middleName: account.middleName,
      });
    }
  }

  syncAutoUnblock(account);

  if (account.roles.includes('specialist')) {
    persistSpecialistBlockState(account);
  }

  return mapAccountToManagedUser(account);
}

export function restoreManagedUserFromDeletion(
  payload: RestoreManagedUserFromDeletionPayload,
): ManagedUser {
  const accounts = getMockAuthAccounts() as ExtendedMockAuthAccount[];

  const account = accounts.find(
    (item) =>
      item.id === payload.userId && getAccountManagedRole(item) !== null,
  );

  if (!account) {
    throw new AdminUsersManagementError('Пользователь не найден.');
  }

  if (!getActiveSoftDeleteRecord(account.id)) {
    throw new AdminUsersManagementError(
      'Аккаунт не находится в периоде восстановления после удаления.',
    );
  }

  removeSoftDeleteRecord(account.id);

  return mapAccountToManagedUser(account);
}
