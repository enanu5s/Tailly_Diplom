// src/features/admin-profile/model/types.ts
export type AdminProfileRole = 'admin' | 'super_admin';

export type AdminProfile = {
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
  role: AdminProfileRole;
};

export type UpdateAdminProfilePayload = {
  firstName: string;
  lastName: string;
  middleName?: string;
  phone?: string;
  /** Только для главного администратора */
  birthDate?: string;
  position?: string;
  department?: string;
};

export type RequestSuperAdminEmailChangePayload = {
  newEmail: string;
  password: string;
};

export type RequestSuperAdminEmailChangeResponse = {
  message: string;
  /**
   * Только в mock-режиме: код «из письма» для локальной проверки.
   * В продакшене отсутствует.
   */
  mockCodeForDevelopment?: string;
};

export type ConfirmSuperAdminEmailChangePayload = {
  code: string;
};

export class AdminProfileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdminProfileError';
  }
}
