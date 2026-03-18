// src/features/admin-users-management/data/mockAdminUsersManagement.ts

import { getMockAuthAccounts } from '@/features/auth/data/mockAuthAccounts';
import {
    updateManagedSpecialistAccount,
    type ManagedSpecialistMockAccount,
} from '@/shared/lib/mock/specialistAccountsStorage';

import {
    AdminUsersManagementError,
    type ManagedUser,
    type ManagedUserRole,
    type UpdateUserBlockStatusPayload,
} from '../model/types';

type MockAuthAccount = ReturnType<typeof getMockAuthAccounts>[number];

type ExtendedMockAuthAccount = MockAuthAccount & {
    blockReason?: string;
    blockedUntil?: string;
    isPermanentBlock?: boolean;
};

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

function isManagedRole(role?: string): role is ManagedUserRole {
    return role === 'client' || role === 'specialist';
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

    return JSON.parse(
        JSON.stringify({
            id: account.id,
            email: account.email,
            role: account.role,
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
        }),
    ) as ManagedUser;
}

function buildDeduplicationKey(account: ExtendedMockAuthAccount): string {
    if (account.role === 'specialist' && account.specialistId?.trim()) {
        return `specialist:${account.specialistId.trim().toLowerCase()}`;
    }

    if (account.email?.trim()) {
        return `email:${account.email.trim().toLowerCase()}`;
    }

    return `id:${account.id}`;
}

function persistSpecialistBlockState(account: ExtendedMockAuthAccount): void {
    if (account.role !== 'specialist') {
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

export function cloneManagedUsers(): ManagedUser[] {
    const accounts = getMockAuthAccounts()
        .filter((account) => isManagedRole(account.role))
        .map((account) => account as ExtendedMockAuthAccount);

    const uniqueAccountsMap = new Map<string, ExtendedMockAuthAccount>();

    for (const account of accounts) {
        syncAutoUnblock(account);

        if (account.role === 'specialist') {
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
        (item) => item.id === payload.userId && isManagedRole(item.role),
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
            throw new AdminUsersManagementError(
                'Укажите причину блокировки.',
            );
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
    } else {
        account.isBlocked = false;
        account.blockReason = undefined;
        account.blockedUntil = undefined;
        account.isPermanentBlock = false;
    }

    if (account.role === 'specialist') {
        persistSpecialistBlockState(account);
    }

    return mapAccountToManagedUser(account);
}