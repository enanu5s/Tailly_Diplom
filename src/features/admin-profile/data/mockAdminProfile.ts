// src/features/admin-profile/data/mockAdminProfile.ts
import {
  MOCK_ADMIN_ACCOUNTS,
  normalizeEmail,
} from '@/features/admin-auth/data/mockAdminAccounts';
import { authStore } from '@/features/auth/model/authStore';
import { MOCK_ADMINS } from '@/features/super-admin-admins-management/data/mockAdminsManagement';

import {
  AdminProfileError,
  type AdminProfile,
  type ConfirmSuperAdminEmailChangePayload,
  type RequestSuperAdminEmailChangePayload,
  type RequestSuperAdminEmailChangeResponse,
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

const EMAIL_CHANGE_CODE_TTL_MS = 15 * 60 * 1000;

type PendingSuperAdminEmailChange = {
  newEmail: string;
  code: string;
  createdAt: number;
};

const pendingSuperAdminEmailChangeByAdminId = new Map<
  string,
  PendingSuperAdminEmailChange
>();

function isValidEmailShape(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length > 3 && trimmed.includes('@') && trimmed.includes('.');
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

  if (
    MOCK_ADMINS[recordIndex].role === 'super_admin' &&
    typeof payload.birthDate === 'string' &&
    payload.birthDate.trim().length > 0
  ) {
    nextRecord.birthDate = payload.birthDate.trim();
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'position')) {
    nextRecord.position = normalizeOptional(payload.position);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'department')) {
    nextRecord.department = normalizeOptional(payload.department);
  }

  MOCK_ADMINS[recordIndex] = nextRecord;

  return mapRecordToProfile(MOCK_ADMINS[recordIndex]);
}

export function mockRequestSuperAdminEmailChange(
  payload: RequestSuperAdminEmailChangePayload,
): RequestSuperAdminEmailChangeResponse {
  const record = getCurrentAdminRecord();

  if (record.role !== 'super_admin') {
    throw new AdminProfileError(
      'Смена email через этот сценарий доступна только главному администратору.',
    );
  }

  const newEmail = normalizeEmail(payload.newEmail);

  if (!isValidEmailShape(newEmail)) {
    throw new AdminProfileError('Укажите корректный адрес новой почты.');
  }

  if (newEmail === normalizeEmail(record.email)) {
    throw new AdminProfileError('Новый email должен отличаться от текущего.');
  }

  const emailTaken = MOCK_ADMINS.some(
    (item) =>
      normalizeEmail(item.email) === newEmail && item.adminId !== record.adminId,
  );

  if (emailTaken) {
    throw new AdminProfileError('Этот email уже используется.');
  }

  const account = MOCK_ADMIN_ACCOUNTS.find(
    (item) => item.adminId === record.adminId,
  );

  if (!account || account.password !== payload.password) {
    throw new AdminProfileError('Неверный пароль.');
  }

  const code = String(Math.floor(100_000 + Math.random() * 900_000));

  pendingSuperAdminEmailChangeByAdminId.set(record.adminId, {
    newEmail,
    code,
    createdAt: Date.now(),
  });

  return {
    message: `Код подтверждения отправлен на текущий адрес ${record.email}.`,
    mockCodeForDevelopment: code,
  };
}

export function mockConfirmSuperAdminEmailChange(
  payload: ConfirmSuperAdminEmailChangePayload,
): AdminProfile {
  const record = getCurrentAdminRecord();

  if (record.role !== 'super_admin') {
    throw new AdminProfileError(
      'Подтверждение смены email доступно только главному администратору.',
    );
  }

  const pending = pendingSuperAdminEmailChangeByAdminId.get(record.adminId);

  if (!pending) {
    throw new AdminProfileError(
      'Сначала запросите код: укажите новый email и пароль.',
    );
  }

  if (Date.now() - pending.createdAt > EMAIL_CHANGE_CODE_TTL_MS) {
    pendingSuperAdminEmailChangeByAdminId.delete(record.adminId);
    throw new AdminProfileError('Код устарел. Запросите новый.');
  }

  const entered = payload.code.replace(/\s/g, '');

  if (entered !== pending.code) {
    throw new AdminProfileError('Неверный код подтверждения.');
  }

  const recordIndex = MOCK_ADMINS.findIndex(
    (item) => item.adminId === record.adminId,
  );

  if (recordIndex === -1) {
    throw new AdminProfileError('Администратор не найден.');
  }

  MOCK_ADMINS[recordIndex] = {
    ...MOCK_ADMINS[recordIndex],
    email: pending.newEmail,
  };

  const accIndex = MOCK_ADMIN_ACCOUNTS.findIndex(
    (item) => item.adminId === record.adminId,
  );

  if (accIndex !== -1) {
    MOCK_ADMIN_ACCOUNTS[accIndex] = {
      ...MOCK_ADMIN_ACCOUNTS[accIndex],
      email: pending.newEmail,
    };
  }

  pendingSuperAdminEmailChangeByAdminId.delete(record.adminId);

  return mapRecordToProfile(MOCK_ADMINS[recordIndex]);
}

/** Сброс незавершённой смены email (закрытие модального окна, «Назад»). */
export function clearPendingSuperAdminEmailChange(): void {
  const authState = authStore.getState();
  const adminId = authState.user?.adminId?.trim();

  if (adminId) {
    pendingSuperAdminEmailChangeByAdminId.delete(adminId);
  }
}