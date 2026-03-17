// src/features/super-admin-admins-management/api/superAdminAdminsManagementApi.mock.ts

import {
  AdminManagementError,
  type CreateAdminPayload,
  type CreateAdminResponse,
  type DeleteAdminPayload,
  type ManagedAdmin,
} from '../model/types';

import {
  buildAdminId,
  buildTemporaryPassword,
  cloneAdmins,
  MOCK_ADMINS,
  normalizeOptional,
  type MockAdminRecord,
  wait,
} from '../data/mockAdminsManagement';

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

  const existingAdmin = MOCK_ADMINS.find(
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

  MOCK_ADMINS.unshift(createdAdmin);

  return {
    admin: JSON.parse(JSON.stringify(createdAdmin)),
    temporaryPassword,
  };
}

export async function mockDeleteAdmin(
  payload: DeleteAdminPayload,
): Promise<void> {
  await wait();

  const adminIndex = MOCK_ADMINS.findIndex(
    (admin) => admin.adminId === payload.adminId,
  );

  if (adminIndex === -1) {
    throw new AdminManagementError('Администратор не найден.');
  }

  if (MOCK_ADMINS[adminIndex].role === 'super_admin') {
    throw new AdminManagementError(
      'Главного администратора удалить нельзя.',
    );
  }

  MOCK_ADMINS.splice(adminIndex, 1);
}