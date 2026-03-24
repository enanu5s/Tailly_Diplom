// src/features/super-admin-admins-management/api/superAdminAdminsManagementApi.mock.ts

import { notifyNewAdminPasswordFromSuperAdmin } from '@/shared/lib/emailNotifications';
import { patchMockDatabase } from '@/shared/mock-db/store';

import {
  buildAdminId,
  buildTemporaryPassword,
  cloneAdmins,
  getSuperAdminAdminsMutable,
  normalizeOptional,
  type MockAdminRecord,
  wait,
} from '../data/mockAdminsManagement';
import {
  AdminManagementError,
  type CreateAdminPayload,
  type CreateAdminResponse,
  type DeleteAdminPayload,
  type ManagedAdmin,
  type UpdateAdminPayload,
} from '../model/types';

export async function mockGetAdmins(): Promise<ManagedAdmin[]> {
  await wait();

  return cloneAdmins();
}

export async function mockCreateAdmin(
  payload: CreateAdminPayload,
): Promise<CreateAdminResponse> {
  await wait();

  if (!payload.consent) {
    throw new AdminManagementError(
      'Для создания администратора необходимо подтверждение обработки персональных данных.',
    );
  }

  const normalizedEmail = payload.email.trim().toLowerCase();

  const existingAdmin = getSuperAdminAdminsMutable().find(
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

  patchMockDatabase((db) => {
    db.superAdmin.admins = [createdAdmin, ...db.superAdmin.admins];
  });

  notifyNewAdminPasswordFromSuperAdmin({
    adminEmail: normalizedEmail,
    adminName:
      `${payload.firstName.trim()} ${payload.lastName.trim()}`.trim(),
    temporaryPassword,
  });

  return {
    admin: JSON.parse(JSON.stringify(createdAdmin)),
    temporaryPassword,
  };
}

export async function mockDeleteAdmin(
  payload: DeleteAdminPayload,
): Promise<void> {
  await wait();

  const admins = getSuperAdminAdminsMutable();
  const adminIndex = admins.findIndex(
    (admin) => admin.adminId === payload.adminId,
  );

  if (adminIndex === -1) {
    throw new AdminManagementError('Администратор не найден.');
  }

  if (admins[adminIndex].role === 'super_admin') {
    throw new AdminManagementError(
      'Главного администратора удалить нельзя.',
    );
  }

  patchMockDatabase((db) => {
    db.superAdmin.admins = db.superAdmin.admins.filter(
      (admin) => admin.adminId !== payload.adminId,
    );
  });
}

export async function mockUpdateAdmin(
  payload: UpdateAdminPayload,
): Promise<ManagedAdmin> {
  await wait();

  const admins = getSuperAdminAdminsMutable();
  const adminIndex = admins.findIndex(
    (admin) => admin.adminId === payload.adminId,
  );

  if (adminIndex === -1) {
    throw new AdminManagementError('Администратор не найден.');
  }

  if (admins[adminIndex].role === 'super_admin') {
    throw new AdminManagementError(
      'Данные главного администратора здесь изменить нельзя.',
    );
  }

  const existing = admins[adminIndex];

  const updated: MockAdminRecord = {
    ...existing,
    firstName: payload.firstName.trim(),
    lastName: payload.lastName.trim(),
    middleName: normalizeOptional(payload.middleName),
    birthDate: payload.birthDate,
    phone: normalizeOptional(payload.phone),
    position: normalizeOptional(payload.position),
    department: normalizeOptional(payload.department),
  };

  patchMockDatabase((db) => {
    db.superAdmin.admins = db.superAdmin.admins.map((admin) =>
      admin.adminId === payload.adminId ? updated : admin,
    );
  });

  return JSON.parse(JSON.stringify(updated)) as ManagedAdmin;
}
