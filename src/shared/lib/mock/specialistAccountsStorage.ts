// src/shared/lib/mock/specialistAccountsStorage.ts

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

const STORAGE_KEY = 'tailly_managed_specialist_accounts';

const INITIAL_SPECIALIST_ACCOUNTS: ManagedSpecialistMockAccount[] = [
    {
        id: 'specialist-1',
        email: 'specialist@tailly.local',
        password: '123456',
        role: 'specialist',
        firstName: 'Мария',
        lastName: 'Иванова',
        middleName: '',
        phone: '+7 (900) 000-00-20',
        city: 'Москва',
        about: 'Опыт ухода за животными, базовый тестовый специалист.',
        specialistId: 'specialist-1',
        specialistSlug: 'maria-ivanova',
        applicationId: undefined,
        createdAt: '2026-03-01T10:00:00.000Z',
        createdBy: 'system',
        isBlocked: false,
        blockReason: undefined,
        blockedUntil: undefined,
        isPermanentBlock: false,
    },
];

function cloneAccounts(
    accounts: ManagedSpecialistMockAccount[],
): ManagedSpecialistMockAccount[] {
    return JSON.parse(
        JSON.stringify(accounts),
    ) as ManagedSpecialistMockAccount[];
}

function normalizeOptionalString(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim() ? value : undefined;
}

function normalizeAccounts(
    value: unknown,
): ManagedSpecialistMockAccount[] {
    if (!Array.isArray(value)) {
        return cloneAccounts(INITIAL_SPECIALIST_ACCOUNTS);
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
    const existing = localStorage.getItem(STORAGE_KEY);

    if (!existing) {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(INITIAL_SPECIALIST_ACCOUNTS),
        );
    }
}

export function readManagedSpecialistAccounts(): ManagedSpecialistMockAccount[] {
    ensureManagedSpecialistAccountsSeed();

    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
        return cloneAccounts(INITIAL_SPECIALIST_ACCOUNTS);
    }

    try {
        const parsed = JSON.parse(raw) as unknown;
        const normalizedAccounts = normalizeAccounts(parsed);

        const syncedAccounts = normalizedAccounts.map(
            syncManagedSpecialistBlockedState,
        );

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
            writeManagedSpecialistAccounts(syncedAccounts);
        }

        return cloneAccounts(syncedAccounts);
    } catch {
        return cloneAccounts(INITIAL_SPECIALIST_ACCOUNTS);
    }
}

export function writeManagedSpecialistAccounts(
    accounts: ManagedSpecialistMockAccount[],
): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

export function upsertManagedSpecialistAccount(
    account: ManagedSpecialistMockAccount,
): void {
    const accounts = readManagedSpecialistAccounts();
    const existingIndex = accounts.findIndex(
        (item) => item.id === account.id,
    );

    if (existingIndex === -1) {
        accounts.unshift(account);
    } else {
        accounts[existingIndex] = account;
    }

    writeManagedSpecialistAccounts(accounts);
}

export function updateManagedSpecialistAccount(
    specialistId: string,
    updater: (
        account: ManagedSpecialistMockAccount,
    ) => ManagedSpecialistMockAccount,
): ManagedSpecialistMockAccount {
    const accounts = readManagedSpecialistAccounts();
    const targetIndex = accounts.findIndex(
        (item) => item.id === specialistId || item.specialistId === specialistId,
    );

    if (targetIndex === -1) {
        throw new Error('Специалист не найден в mock storage.');
    }

    const updatedAccount = updater(accounts[targetIndex]);
    accounts[targetIndex] = updatedAccount;

    writeManagedSpecialistAccounts(accounts);

    return updatedAccount;
}