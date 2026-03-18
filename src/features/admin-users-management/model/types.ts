// src/features/admin-users-management/model/types.ts

export type ManagedUserRole = 'client' | 'specialist';

export type ManagedUser = {
  id: string;
  email: string;
  role: ManagedUserRole;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  name?: string;
  specialistId?: string;
  specialistSlug?: string;
  isBlocked: boolean;
  blockReason?: string;
  blockedUntil?: string;
  isPermanentBlock?: boolean;
};

export type UpdateUserBlockStatusPayload = {
  userId: string;
  isBlocked: boolean;
  blockReason?: string;
  blockedUntil?: string;
  isPermanentBlock?: boolean;
};

export class AdminUsersManagementError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdminUsersManagementError';
  }
}