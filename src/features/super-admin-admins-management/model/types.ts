// src/features/super-admin-admins-management/model/types.ts

export type ManagedAdminRole = 'admin' | 'super_admin';

export type ManagedAdminStatus = 'active' | 'inactive';

export type ManagedAdmin = {
    id: string;
    adminId: string;
    email: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    birthDate: string;
    phone?: string;
    position?: string;
    department?: string;
    status: ManagedAdminStatus;
    role: ManagedAdminRole;
    createdAt: string;
    createdBy: string;
    lastLoginAt?: string | null;
};

export type CreateAdminPayload = {
    email: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    birthDate: string;
    phone?: string;
    position?: string;
    department?: string;
    consent: boolean;
};

export type CreateAdminResponse = {
    admin: ManagedAdmin;
    temporaryPassword: string;
};

export type DeleteAdminPayload = {
    adminId: string;
};

export class AdminManagementError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AdminManagementError';
    }
}