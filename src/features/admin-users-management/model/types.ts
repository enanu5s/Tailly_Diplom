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
  isScheduledForDeletion?: boolean;
  scheduledDeletionDeadline?: string;
};

export type GetManagedUsersPayload = {
  search?: string;
  role?: ManagedUserRole;
  page?: number;
  pageSize?: number;
};

export type UpdateUserBlockStatusPayload = {
  userId: string;
  isBlocked: boolean;
  blockReason?: string;
  blockedUntil?: string;
  isPermanentBlock?: boolean;
};

/** Профиль: ФИО; slug — только для роли specialist (публичный адрес профиля). */
export type UpdateManagedUserProfilePayload = {
  userId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  specialistSlug?: string;
};

export type RestoreManagedUserFromDeletionPayload = {
  userId: string;
};

export class AdminUsersManagementError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdminUsersManagementError';
  }
}
