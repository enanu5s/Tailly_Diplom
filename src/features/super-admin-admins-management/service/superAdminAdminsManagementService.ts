// src/features/super-admin-admins-management/service/superAdminAdminsManagementService.ts

import { superAdminAdminsManagementApi } from '../api/superAdminAdminsManagementApi';

import type {
    CreateAdminPayload,
    CreateAdminResponse,
    DeleteAdminPayload,
    ManagedAdmin,
    UpdateAdminPayload,
} from '../model/types';

export const superAdminAdminsManagementService = {
    getAdmins(): Promise<ManagedAdmin[]> {
        return superAdminAdminsManagementApi.getAdmins();
    },

    createAdmin(payload: CreateAdminPayload): Promise<CreateAdminResponse> {
        return superAdminAdminsManagementApi.createAdmin(payload);
    },

    deleteAdmin(payload: DeleteAdminPayload): Promise<void> {
        return superAdminAdminsManagementApi.deleteAdmin(payload);
    },

    updateAdmin(payload: UpdateAdminPayload): Promise<ManagedAdmin> {
        return superAdminAdminsManagementApi.updateAdmin(payload);
    },
};