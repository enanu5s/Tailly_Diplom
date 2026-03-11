// src/features/super-admin-admins-management/api/superAdminAdminsManagementApi.ts

import { fetchJson } from '@/shared/api/fetchJson';

import {
    AdminManagementError,
    type CreateAdminPayload,
    type CreateAdminResponse,
    type DeleteAdminPayload,
    type ManagedAdmin,
} from '../model/types';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

type MockAdminRecord = ManagedAdmin & {
    temporaryPassword?: string;
};

const MOCK_ADMINS: MockAdminRecord[] = [
    {
        id: 'super-admin-1',
        adminId: 'super-admin-1',
        email: 'superadmin@tailly.local',
        firstName: 'Мария',
        lastName: 'Петрова',
        middleName: 'Александровна',
        birthDate: '1988-06-14',
        phone: '+7 (900) 000-00-02',
        position: 'Главный администратор',
        department: 'Администрация',
        status: 'active',
        role: 'super_admin',
        createdAt: '2026-01-10T09:00:00.000Z',
        createdBy: 'system',
        lastLoginAt: '2026-03-11T09:30:00.000Z',
    },
    {
        id: 'admin-1',
        adminId: 'admin-1',
        email: 'admin@tailly.local',
        firstName: 'Анна',
        lastName: 'Иванова',
        middleName: 'Сергеевна',
        birthDate: '1993-03-21',
        phone: '+7 (900) 000-00-01',
        position: 'Администратор поддержки',
        department: 'Поддержка',
        status: 'active',
        role: 'admin',
        createdAt: '2026-02-03T10:00:00.000Z',
        createdBy: 'super-admin-1',
        lastLoginAt: '2026-03-10T15:15:00.000Z',
    },
];

function wait(delay = 250): Promise<void> {
    return new Promise((resolve) => {
        window.setTimeout(resolve, delay);
    });
}

function buildAdminId(): string {
    return `admin-${Math.random().toString(36).slice(2, 10)}`;
}

function buildTemporaryPassword(): string {
    const randomPart = Math.random().toString(36).slice(2, 8);
    return `Tailly-${randomPart}!`;
}

function normalizeOptional(value?: string): string | undefined {
    const trimmed = value?.trim();

    return trimmed ? trimmed : undefined;
}

async function mockGetAdmins(): Promise<ManagedAdmin[]> {
    await wait();

    return JSON.parse(JSON.stringify(MOCK_ADMINS));
}

async function mockCreateAdmin(
    payload: CreateAdminPayload,
): Promise<CreateAdminResponse> {
    await wait();

    if (!payload.consent) {
        throw new AdminManagementError(
            'Для создания администратора необходимо подтверждение обработки персональных данных.',
        );
    }

    const normalizedEmail = payload.email.trim().toLowerCase();

    const existingAdmin = MOCK_ADMINS.find(
        (admin) => admin.email.toLowerCase() === normalizedEmail,
    );

    if (existingAdmin) {
        throw new AdminManagementError(
            'Администратор с таким email уже существует.',
        );
    }

    const adminId = buildAdminId();
    const temporaryPassword = buildTemporaryPassword();

    const createdAdmin: MockAdminRecord = {
        id: adminId,
        adminId,
        email: normalizedEmail,
        firstName: payload.firstName.trim(),
        lastName: payload.lastName.trim(),
        middleName: normalizeOptional(payload.middleName),
        birthDate: payload.birthDate,
        phone: normalizeOptional(payload.phone),
        position: normalizeOptional(payload.position),
        department: normalizeOptional(payload.department),
        status: 'active',
        role: 'admin',
        createdAt: new Date().toISOString(),
        createdBy: 'super-admin-1',
        lastLoginAt: null,
        temporaryPassword,
    };

    MOCK_ADMINS.unshift(createdAdmin);

    return {
        admin: JSON.parse(JSON.stringify(createdAdmin)),
        temporaryPassword,
    };
}

async function mockDeleteAdmin(
    payload: DeleteAdminPayload,
): Promise<void> {
    await wait();

    const adminIndex = MOCK_ADMINS.findIndex(
        (admin) => admin.adminId === payload.adminId,
    );


    if (adminIndex === -1) {
        throw new AdminManagementError('Администратор не найден.');
    }

    if (MOCK_ADMINS[adminIndex].role === 'super_admin') {
        throw new AdminManagementError(
            'Главного администратора удалить нельзя.',
        );
    }

    MOCK_ADMINS.splice(adminIndex, 1);
}

async function realGetAdmins(): Promise<ManagedAdmin[]> {
    return fetchJson<ManagedAdmin[]>(`${API_BASE_URL}/super-admin/admins`, {
        method: 'GET',
    });
}

async function realCreateAdmin(
    payload: CreateAdminPayload,
): Promise<CreateAdminResponse> {
    return fetchJson<CreateAdminResponse>(
        `${API_BASE_URL}/super-admin/admins`,
        {
            method: 'POST',
            body: JSON.stringify(payload),
        },
    );
}

async function realDeleteAdmin(
    payload: DeleteAdminPayload,
): Promise<void> {
    await fetchJson<void>(
        `${API_BASE_URL}/super-admin/admins/${payload.adminId}`,
        {
            method: 'DELETE',
        },
    );
}

export const superAdminAdminsManagementApi = {
    async getAdmins(): Promise<ManagedAdmin[]> {
        if (USE_MOCK) {
            return mockGetAdmins();
        }

        return realGetAdmins();
    },

    async createAdmin(
        payload: CreateAdminPayload,
    ): Promise<CreateAdminResponse> {
        if (USE_MOCK) {
            return mockCreateAdmin(payload);
        }

        return realCreateAdmin(payload);
    },

    async deleteAdmin(payload: DeleteAdminPayload): Promise<void> {
        if (USE_MOCK) {
            return mockDeleteAdmin(payload);
        }

        return realDeleteAdmin(payload);
    },
};