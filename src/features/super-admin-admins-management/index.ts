// src/features/super-admin-admins-management/index.ts

export { superAdminAdminsManagementApi } from './api/superAdminAdminsManagementApi';
export { superAdminAdminsManagementService } from './service/superAdminAdminsManagementService';
export { superAdminAdminsManagementStore } from './model/superAdminAdminsManagementStore';
export { SuperAdminAdminsManagementSection } from './ui/SuperAdminAdminsManagementSection';
export type {
    CreateAdminPayload,
    CreateAdminResponse,
    ManagedAdmin,
    ManagedAdminRole,
    ManagedAdminStatus,
} from './model/types';
export { AdminManagementError } from './model/types';