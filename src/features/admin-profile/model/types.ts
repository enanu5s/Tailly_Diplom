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
  position?: string;
  department?: string;
};

export class AdminProfileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdminProfileError';
  }
}