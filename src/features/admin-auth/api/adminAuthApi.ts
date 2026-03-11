// src/features/admin-auth/api/adminAuthApi.ts

import { AdminLoginError, type AdminLoginPayload, type AdminLoginSuccessResponse } from '../model/types';

// Если fetchJson лежит у тебя в другом месте — поменяй только этот import.
import { fetchJson } from '@/shared/api/fetchJson';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

type MockAdminAccount = {
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

type MockAttemptState = {
    failedAttempts: number;
    lockUntil: string | null;
};

const MOCK_ADMIN_ACCOUNTS: MockAdminAccount[] = [
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
];

const attemptsMap = new Map<string, MockAttemptState>();

function wait(delay = 450): Promise<void> {
    return new Promise((resolve) => {
        window.setTimeout(resolve, delay);
    });
}

function getAttemptState(email: string): MockAttemptState {
    const normalizedEmail = email.trim().toLowerCase();
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

function resetAttempts(email: string): void {
    attemptsMap.set(email.trim().toLowerCase(), {
        failedAttempts: 0,
        lockUntil: null,
    });
}

function buildLockedUntilIso(): string {
    return new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString();
}

async function mockLogin(payload: AdminLoginPayload): Promise<AdminLoginSuccessResponse> {
    await wait();

    const email = payload.email.trim().toLowerCase();
    const password = payload.password;
    const attempts = getAttemptState(email);

    if (attempts.lockUntil && new Date(attempts.lockUntil).getTime() > Date.now()) {
        throw new AdminLoginError({
            code: 'TOO_MANY_ATTEMPTS',
            message:
                'Слишком много неверных попыток входа. Попробуйте позже или обратитесь к главному администратору.',
            attemptsLeft: 0,
            lockUntil: attempts.lockUntil,
        });
    }

    const account = MOCK_ADMIN_ACCOUNTS.find((item) => item.email.toLowerCase() === email);

    if (!account || account.password !== password) {
        const nextFailedAttempts = attempts.failedAttempts + 1;
        const attemptsLeft = Math.max(MAX_LOGIN_ATTEMPTS - nextFailedAttempts, 0);

        if (attemptsLeft <= 0) {
            const lockUntil = buildLockedUntilIso();

            attemptsMap.set(email, {
                failedAttempts: MAX_LOGIN_ATTEMPTS,
                lockUntil,
            });

            throw new AdminLoginError({
                code: 'TOO_MANY_ATTEMPTS',
                message:
                    'Лимит попыток входа исчерпан. Вход временно заблокирован.',
                attemptsLeft: 0,
                lockUntil,
            });
        }

        attemptsMap.set(email, {
            failedAttempts: nextFailedAttempts,
            lockUntil: null,
        });

        throw new AdminLoginError({
            code: 'INVALID_CREDENTIALS',
            message: 'Неверный логин или пароль.',
            attemptsLeft,
            lockUntil: null,
        });
    }

    if (account.isBlocked) {
        throw new AdminLoginError({
            code: 'ACCOUNT_BLOCKED',
            message: 'Аккаунт администратора заблокирован.',
        });
    }

    resetAttempts(email);


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

async function realLogin(payload: AdminLoginPayload): Promise<AdminLoginSuccessResponse> {
    return fetchJson<AdminLoginSuccessResponse>(`${API_BASE_URL}/admin/auth/login`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export const adminAuthApi = {
    async login(payload: AdminLoginPayload): Promise<AdminLoginSuccessResponse> {
        if (USE_MOCK) {
            return mockLogin(payload);
        }

        return realLogin(payload);
    },
};