// src/features/admin-specialists-management/model/types.ts

export type ManagedSpecialistAccount = {
    id: string;
    email: string;
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

export type CreateSpecialistAccountPayload = {
    applicationId: string;
    email: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    phone?: string;
    city: string;
    about: string;
    reviewedBy: string;
};

export type CreateSpecialistAccountResponse = {
    account: ManagedSpecialistAccount;
    temporaryPassword: string;
};

export class AdminSpecialistsManagementError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AdminSpecialistsManagementError';
    }
}