// src/features/admin-password-recovery-management/data/mockAdminPasswordRecoveryManagement.ts

import {
  MOCK_ADMIN_PASSWORD_RECOVERY_REQUESTS,
  wait,
  type MockAdminPasswordRecoveryRequest,
} from '@/features/auth/data/mockAdminPasswordRecoveryRequests';
import {
  getMockAuthAccounts,
  isAdminRole,
  normalizeEmail,
} from '@/features/auth/data/mockAuthAccounts';

import {
  AdminPasswordRecoveryManagementError,
  type AdminPasswordRecoveryRequestItem,
} from '../model/types';

function mapRequest(
  item: MockAdminPasswordRecoveryRequest,
): AdminPasswordRecoveryRequestItem {
  return JSON.parse(JSON.stringify(item)) as AdminPasswordRecoveryRequestItem;
}

export function cloneRecoveryRequests(): AdminPasswordRecoveryRequestItem[] {
  return MOCK_ADMIN_PASSWORD_RECOVERY_REQUESTS.map(mapRequest);
}

export function buildTemporaryPassword(): string {
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `Tailly-${randomPart}!`;
}

export function getRecoveryRequestById(
  requestId: string,
): MockAdminPasswordRecoveryRequest | null {
  return (
    MOCK_ADMIN_PASSWORD_RECOVERY_REQUESTS.find(
      (item) => item.id === requestId,
    ) ?? null
  );
}

function updateAdminAccountPassword(
  email: string,
  nextPassword: string,
): void {
  const normalizedTargetEmail = normalizeEmail(email);
  const accounts = getMockAuthAccounts();

  const account = accounts.find(
    (item) =>
      item.email.toLowerCase() === normalizedTargetEmail &&
      isAdminRole(item.role),
  );

  if (!account) {
    throw new AdminPasswordRecoveryManagementError(
      'Не удалось найти admin-аккаунт для обновления пароля.',
    );
  }

  account.password = nextPassword;
}

export function processRecoveryRequest(
  requestId: string,
): AdminPasswordRecoveryRequestItem {
  const requestIndex = MOCK_ADMIN_PASSWORD_RECOVERY_REQUESTS.findIndex(
    (item) => item.id === requestId,
  );

  if (requestIndex === -1) {
    throw new AdminPasswordRecoveryManagementError('Заявка не найдена.');
  }

  const currentItem = MOCK_ADMIN_PASSWORD_RECOVERY_REQUESTS[requestIndex];

  if (currentItem.status === 'processed') {
    throw new AdminPasswordRecoveryManagementError(
      'Заявка уже была обработана.',
    );
  }

  const temporaryPassword = buildTemporaryPassword();

  updateAdminAccountPassword(currentItem.email, temporaryPassword);

  MOCK_ADMIN_PASSWORD_RECOVERY_REQUESTS[requestIndex] = {
    ...currentItem,
    status: 'processed',
    processedAt: new Date().toISOString(),
    temporaryPassword,
  };

  return mapRequest(MOCK_ADMIN_PASSWORD_RECOVERY_REQUESTS[requestIndex]);
}

export { wait };