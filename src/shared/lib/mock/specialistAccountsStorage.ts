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
};

const STORAGE_KEY = 'tailly_managed_specialist_accounts';

const INITIAL_SPECIALIST_ACCOUNTS: ManagedSpecialistMockAccount[] = [
    {
        id: 'specialist-1',
        email: 'specialist@tailly.local',
        password: '123456',
        role: 'specialist',
        firstName: 'Ольга',
        lastName: 'Кузнецова',
        middleName: '',
        phone: '+7 (900) 000-00-20',
        city: 'Москва',
        about: 'Опыт ухода за животными, базовый тестовый специалист.',
        specialistId: 'specialist-1',
        specialistSlug: 'olga-kuznetsova',
        applicationId: undefined,
        createdAt: '2026-03-01T10:00:00.000Z',
        createdBy: 'system',
        isBlocked: false,
    },
];

function cloneAccounts(
    accounts: ManagedSpecialistMockAccount[],
): ManagedSpecialistMockAccount[] {
    return JSON.parse(
        JSON.stringify(accounts),
    ) as ManagedSpecialistMockAccount[];
}

function normalizeAccounts(
    value: unknown,
): ManagedSpecialistMockAccount[] {
    if (!Array.isArray(value)) {
        return cloneAccounts(INITIAL_SPECIALIST_ACCOUNTS);
    }

    const result = value.filter(
        (item) =>
            typeof item === 'object' &&
            item !== null &&
            typeof (item as ManagedSpecialistMockAccount).id === 'string' &&
            typeof (item as ManagedSpecialistMockAccount).email === 'string' &&
            typeof (item as ManagedSpecialistMockAccount).password === 'string',
    ) as ManagedSpecialistMockAccount[];

    return cloneAccounts(result);
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
        return normalizeAccounts(parsed);
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