// src/features/admin-specialists-management/api/adminSpecialistsManagementApi.ts

import { fetchJson } from '@/shared/api/fetchJson';
import {
    readManagedSpecialistAccounts,
    upsertManagedSpecialistAccount,
    type ManagedSpecialistMockAccount,
} from '@/shared/lib/mock/specialistAccountsStorage';

import {
    AdminSpecialistsManagementError,
    type CreateSpecialistAccountPayload,
    type CreateSpecialistAccountResponse,
} from '../model/types';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

function wait(delay = 300): Promise<void> {
    return new Promise((resolve) => {
        window.setTimeout(resolve, delay);
    });
}

function slugify(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-zа-яё0-9\s-]/gi, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

function transliterate(value: string): string {
    const map: Record<string, string> = {
        а: 'a',
        б: 'b',
        в: 'v',
        г: 'g',
        д: 'd',
        е: 'e',
        ё: 'e',
        ж: 'zh',
        з: 'z',
        и: 'i',
        й: 'y',
        к: 'k',
        л: 'l',
        м: 'm',
        н: 'n',
        о: 'o',
        п: 'p',
        р: 'r',
        с: 's',
        т: 't',
        у: 'u',
        ф: 'f',
        х: 'h',
        ц: 'ts',
        ч: 'ch',
        ш: 'sh',
        щ: 'sch',
        ъ: '',
        ы: 'y',
        ь: '',
        э: 'e',
        ю: 'yu',
        я: 'ya',
    };

    return value
        .toLowerCase()
        .split('')
        .map((char) => map[char] ?? char)
        .join('');
}

function buildSpecialistSlug(firstName: string, lastName: string): string {
    const base = slugify(
        transliterate(`${firstName.trim()} ${lastName.trim()}`),
    );

    return base || `specialist-${Math.random().toString(36).slice(2, 8)}`;
}

function generateTemporaryPassword(): string {
    return `Tailly-${Math.random().toString(36).slice(2, 8)}!`;
}

function generateId(prefix: string): string {
    return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

async function mockCreateSpecialistAccount(
    payload: CreateSpecialistAccountPayload,
): Promise<CreateSpecialistAccountResponse> {
    await wait();

    const existingAccounts = readManagedSpecialistAccounts();
    const normalizedEmail = payload.email.trim().toLowerCase();

    const emailTaken = existingAccounts.some(
        (item) => item.email.toLowerCase() === normalizedEmail,
    );

    if (emailTaken) {
        throw new AdminSpecialistsManagementError(
            'Специалист с таким email уже существует.',
        );
    }

    const specialistId = generateId('specialist');
    const specialistSlug = buildSpecialistSlug(
        payload.firstName,
        payload.lastName,
    );
    const temporaryPassword = generateTemporaryPassword();

    const createdAccount: ManagedSpecialistMockAccount = {
        id: specialistId,
        email: normalizedEmail,
        password: temporaryPassword,
        role: 'specialist',
        firstName: payload.firstName.trim(),
        lastName: payload.lastName.trim(),
        middleName: payload.middleName?.trim() || undefined,
        phone: payload.phone?.trim() || undefined,
        city: payload.city.trim(),
        about: payload.about.trim(),
        specialistId,
        specialistSlug,
        applicationId: payload.applicationId,
        createdAt: new Date().toISOString(),
        createdBy: payload.reviewedBy,
        isBlocked: false,
    };

    upsertManagedSpecialistAccount(createdAccount);

    return {
        account: JSON.parse(
            JSON.stringify({
                ...createdAccount,
                password: undefined,
            }),
        ) as CreateSpecialistAccountResponse['account'],
        temporaryPassword,
    };
}


async function realCreateSpecialistAccount(
    payload: CreateSpecialistAccountPayload,
): Promise<CreateSpecialistAccountResponse> {
    return fetchJson<CreateSpecialistAccountResponse>(
        `${API_BASE_URL}/admin/specialists`,
        {
            method: 'POST',
            body: JSON.stringify(payload),
        },
    );
}

export const adminSpecialistsManagementApi = {
    async createSpecialistAccount(
        payload: CreateSpecialistAccountPayload,
    ): Promise<CreateSpecialistAccountResponse> {
        if (USE_MOCK) {
            return mockCreateSpecialistAccount(payload);
        }

        return realCreateSpecialistAccount(payload);
    },
};
