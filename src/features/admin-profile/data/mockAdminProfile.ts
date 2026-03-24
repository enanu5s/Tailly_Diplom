// src/features/admin-profile/data/mockAdminProfile.ts
import { authStore } from '@/features/auth/model/authStore';
import { MOCK_ADMINS } from '@/features/super-admin-admins-management/data/mockAdminsManagement';

import {
  AdminProfileError,
  type AdminProfile,
  type UpdateAdminProfilePayload,
} from '../model/types';

type MockAdminProfileRecord = {
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
  role: 'admin' | 'super_admin';
};

export function wait(delay = 300): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delay);
  });
}

export function normalizeOptional(value?: string): string | undefined {
  const trimmed = value?.trim();

  return trimmed ? trimmed : undefined;
}

function mapRecordToProfile(record: MockAdminProfileRecord): AdminProfile {
  return JSON.parse(
    JSON.stringify({
      id: record.id,
      adminId: record.adminId,
      email: record.email,
      firstName: record.firstName,
      lastName: record.lastName,
      middleName: record.middleName,
      birthDate: record.birthDate,
      phone: record.phone,
      position: record.position,
      department: record.department,
      role: record.role,
    }),
  ) as AdminProfile;
}

export function getCurrentAdminRecord(): MockAdminProfileRecord {
  const authState = authStore.getState();
  const authUser = authState.user;

  if (!authUser || (authUser.role !== 'admin' && authUser.role !== 'super_admin')) {
    throw new AdminProfileError('Профиль администратора недоступен без авторизации.');
  }

  const adminId = authUser.adminId?.trim();

  if (!adminId) {
    throw new AdminProfileError('Не удалось определить ID администратора.');
  }

  const matchedAdmin = MOCK_ADMINS.find((item) => item.adminId === adminId);

  if (!matchedAdmin) {
    throw new AdminProfileError('Администратор не найден в mock-данных.');
  }

  return matchedAdmin;
}

export function getMockAdminProfile(): AdminProfile {
  const record = getCurrentAdminRecord();

  return mapRecordToProfile(record);
}

export function updateMockAdminProfile(
  payload: UpdateAdminProfilePayload,
): AdminProfile {
  const record = getCurrentAdminRecord();
  const recordIndex = MOCK_ADMINS.findIndex(
    (item) => item.adminId === record.adminId,
  );

  if (recordIndex === -1) {
    throw new AdminProfileError('Администратор не найден.');
  }

  const nextFirstName = payload.firstName.trim();
  const nextLastName = payload.lastName.trim();

  if (!nextFirstName || !nextLastName) {
    throw new AdminProfileError('Имя и фамилия обязательны для заполнения.');
  }

  const nextRecord: MockAdminProfileRecord = {
    ...MOCK_ADMINS[recordIndex],
    firstName: nextFirstName,
    lastName: nextLastName,
    middleName: normalizeOptional(payload.middleName),
    phone: normalizeOptional(payload.phone),
  };

  if (Object.prototype.hasOwnProperty.call(payload, 'position')) {
    nextRecord.position = normalizeOptional(payload.position);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'department')) {
    nextRecord.department = normalizeOptional(payload.department);
  }

  MOCK_ADMINS[recordIndex] = nextRecord;

  return mapRecordToProfile(MOCK_ADMINS[recordIndex]);
}