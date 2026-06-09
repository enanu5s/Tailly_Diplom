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
  /** Заполняется в mock из auth.baseAccounts и adminAttempts */
  isBlocked?: boolean;
  blockReason?: string;
  blockedUntil?: string | null;
  isPermanentBlock?: boolean;
  passwordAttemptsLockUntil?: string | null;
  failedPasswordAttempts?: number;
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

export type UpdateAdminPayload = {
  adminId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  birthDate: string;
  phone?: string;
  position?: string;
  department?: string;
};

export type UpdateAdminBlockStatusPayload = {
  adminId: string;
  isBlocked: boolean;
  blockReason?: string;
  blockedUntil?: string;
  isPermanentBlock?: boolean;
};

export type ClearAdminPasswordLockPayload = {
  adminId: string;
};

export class AdminManagementError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdminManagementError';
  }
}
