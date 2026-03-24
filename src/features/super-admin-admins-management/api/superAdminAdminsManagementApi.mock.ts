// src/features/super-admin-admins-management/api/superAdminAdminsManagementApi.mock.ts

import { enrichManagedAdminWithLoginSecurity } from '@/features/auth/data/adminMockLoginSecurity';
import type { MockAuthAccount } from '@/features/auth/data/mockAuthAccounts';
import {
  hasAdminRole,
  normalizeEmail,
  resetAdminAttempts,
} from '@/features/auth/data/mockAuthAccounts';
import { notifyNewAdminPasswordFromSuperAdmin } from '@/shared/lib/emailNotifications';
import {
  ensureMockDatabaseLoaded,
  patchMockDatabase,
  unsafeMutableMockDb,
} from '@/shared/mock-db/store';

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
  type ClearAdminPasswordLockPayload,
  type CreateAdminPayload,
  type CreateAdminResponse,
  type DeleteAdminPayload,
  type ManagedAdmin,
  type UpdateAdminBlockStatusPayload,
  type UpdateAdminPayload,
} from '../model/types';

export async function mockGetAdmins(): Promise<ManagedAdmin[]> {
  await wait();

  return cloneAdmins().map((row) =>
    enrichManagedAdminWithLoginSecurity(row as ManagedAdmin),
  );
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
    throw new AdminManagementError('Администратор с таким email уже существует.');
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

  const authAccount: MockAuthAccount = {
    id: adminId,
    email: normalizedEmail,
    password: temporaryPassword,
    roles: ['admin'],
    firstName: payload.firstName.trim(),
    lastName: payload.lastName.trim(),
    middleName: normalizeOptional(payload.middleName),
    phone: normalizeOptional(payload.phone),
    adminId,
    isBlocked: false,
  };

  patchMockDatabase((db) => {
    db.superAdmin.admins = [createdAdmin, ...db.superAdmin.admins];
    db.auth.baseAccounts.push(authAccount);
  });

  notifyNewAdminPasswordFromSuperAdmin({
    adminEmail: normalizedEmail,
    adminName: `${payload.firstName.trim()} ${payload.lastName.trim()}`.trim(),
    temporaryPassword,
  });

  const { temporaryPassword: _omitTemp, ...adminPublic } = createdAdmin;
  void _omitTemp;

  return {
    admin: enrichManagedAdminWithLoginSecurity(
      JSON.parse(JSON.stringify(adminPublic)) as ManagedAdmin,
    ),
    temporaryPassword,
  };
}

export async function mockDeleteAdmin(payload: DeleteAdminPayload): Promise<void> {
  await wait();

  const admins = getSuperAdminAdminsMutable();
  const adminIndex = admins.findIndex((admin) => admin.adminId === payload.adminId);

  if (adminIndex === -1) {
    throw new AdminManagementError('Администратор не найден.');
  }

  if (admins[adminIndex].role === 'super_admin') {
    throw new AdminManagementError('Главного администратора удалить нельзя.');
  }

  patchMockDatabase((db) => {
    db.superAdmin.admins = db.superAdmin.admins.filter(
      (admin) => admin.adminId !== payload.adminId,
    );
    db.auth.baseAccounts = db.auth.baseAccounts.filter(
      (acc) => acc.adminId !== payload.adminId,
    );
  });
}

export async function mockUpdateAdmin(
  payload: UpdateAdminPayload,
): Promise<ManagedAdmin> {
  await wait();

  const admins = getSuperAdminAdminsMutable();
  const adminIndex = admins.findIndex((admin) => admin.adminId === payload.adminId);

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

  return enrichManagedAdminWithLoginSecurity(
    JSON.parse(JSON.stringify(updated)) as ManagedAdmin,
  );
}

export async function mockSetAdminBlockStatus(
  payload: UpdateAdminBlockStatusPayload,
): Promise<ManagedAdmin> {
  await wait();

  const admins = getSuperAdminAdminsMutable();
  const row = admins.find((a) => a.adminId === payload.adminId);

  if (!row) {
    throw new AdminManagementError('Администратор не найден.');
  }

  if (row.role === 'super_admin') {
    throw new AdminManagementError(
      'Блокировку главного администратора здесь изменить нельзя.',
    );
  }

  const emailKey = normalizeEmail(row.email);

  ensureMockDatabaseLoaded();
  const accountIdx = unsafeMutableMockDb().auth.baseAccounts.findIndex(
    (a) => a.adminId === payload.adminId && hasAdminRole(a.roles),
  );

  if (accountIdx === -1) {
    throw new AdminManagementError('Учётная запись администратора не найдена.');
  }

  if (payload.isBlocked) {
    const normalizedReason = payload.blockReason?.trim();
    const normalizedBlockedUntil = payload.blockedUntil?.trim();
    const isPermanentBlock = Boolean(payload.isPermanentBlock);

    if (!normalizedReason) {
      throw new AdminManagementError('Укажите причину блокировки.');
    }

    if (!isPermanentBlock) {
      if (!normalizedBlockedUntil) {
        throw new AdminManagementError('Укажите дату окончания блокировки.');
      }

      const blockedUntilTime = new Date(normalizedBlockedUntil).getTime();

      if (Number.isNaN(blockedUntilTime)) {
        throw new AdminManagementError('Некорректная дата окончания блокировки.');
      }

      if (blockedUntilTime <= Date.now()) {
        throw new AdminManagementError(
          'Дата окончания блокировки должна быть в будущем.',
        );
      }
    }

    patchMockDatabase((db) => {
      const acc: MockAuthAccount = { ...db.auth.baseAccounts[accountIdx] };
      acc.isBlocked = true;
      acc.blockReason = normalizedReason;
      acc.blockedUntil = isPermanentBlock ? undefined : normalizedBlockedUntil;
      acc.isPermanentBlock = isPermanentBlock;

      db.auth.baseAccounts[accountIdx] = acc;
    });

    resetAdminAttempts(emailKey);
  } else {
    patchMockDatabase((db) => {
      const acc: MockAuthAccount = { ...db.auth.baseAccounts[accountIdx] };
      acc.isBlocked = false;
      acc.blockReason = undefined;
      acc.blockedUntil = undefined;
      acc.isPermanentBlock = false;

      db.auth.baseAccounts[accountIdx] = acc;
    });

    resetAdminAttempts(emailKey);
  }

  const next = getSuperAdminAdminsMutable().find((a) => a.adminId === payload.adminId);

  if (!next) {
    throw new AdminManagementError('Администратор не найден.');
  }

  return enrichManagedAdminWithLoginSecurity(next as ManagedAdmin);
}

export async function mockClearAdminPasswordLock(
  payload: ClearAdminPasswordLockPayload,
): Promise<ManagedAdmin> {
  await wait();

  const admins = getSuperAdminAdminsMutable();
  const row = admins.find((a) => a.adminId === payload.adminId);

  if (!row) {
    throw new AdminManagementError('Администратор не найден.');
  }

  if (row.role === 'super_admin') {
    throw new AdminManagementError(
      'Временный лок главного администратора снимается в разделе «Профиль».',
    );
  }

  resetAdminAttempts(normalizeEmail(row.email));

  const next = admins.find((a) => a.adminId === payload.adminId);

  if (!next) {
    throw new AdminManagementError('Администратор не найден.');
  }

  return enrichManagedAdminWithLoginSecurity(next as ManagedAdmin);
}
