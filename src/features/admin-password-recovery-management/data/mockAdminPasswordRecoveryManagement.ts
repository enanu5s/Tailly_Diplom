// src/features/admin-password-recovery-management/data/mockAdminPasswordRecoveryManagement.ts

import {
  getAdminPasswordRecoveryRequestsSnapshot,
  wait,
  type MockAdminPasswordRecoveryRequest,
} from '@/features/auth/data/mockAdminPasswordRecoveryRequests';
import { normalizeEmail } from '@/features/auth/data/mockAuthAccounts';
import { patchMockDatabase } from '@/shared/mock-db/store';

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
  return getAdminPasswordRecoveryRequestsSnapshot().map(mapRequest);
}

export function buildTemporaryPassword(): string {
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `Tailly-${randomPart}!`;
}

export function getRecoveryRequestById(
  requestId: string,
): MockAdminPasswordRecoveryRequest | null {
  return (
    getAdminPasswordRecoveryRequestsSnapshot().find((item) => item.id === requestId) ??
    null
  );
}

export function processRecoveryRequest(
  requestId: string,
): AdminPasswordRecoveryRequestItem {
  const list = getAdminPasswordRecoveryRequestsSnapshot();
  const requestIndex = list.findIndex((item) => item.id === requestId);

  if (requestIndex === -1) {
    throw new AdminPasswordRecoveryManagementError('Заявка не найдена.');
  }

  const currentItem = list[requestIndex];

  if (currentItem.status === 'processed') {
    throw new AdminPasswordRecoveryManagementError('Заявка уже была обработана.');
  }

  const temporaryPassword = buildTemporaryPassword();

  const targetEmail = normalizeEmail(currentItem.email);

  patchMockDatabase((db) => {
    const acc = db.auth.baseAccounts.find(
      (item) => normalizeEmail(item.email) === targetEmail,
    );

    if (acc) {
      acc.password = temporaryPassword;
    }

    const idx = db.adminPasswordRecovery.requests.findIndex(
      (item) => item.id === requestId,
    );

    if (idx === -1) {
      return;
    }

    const row = db.adminPasswordRecovery.requests[idx];

    db.adminPasswordRecovery.requests = db.adminPasswordRecovery.requests.map(
      (item, i) =>
        i === idx
          ? {
              ...row,
              status: 'processed' as const,
              processedAt: new Date().toISOString(),
              temporaryPassword,
            }
          : item,
    );
  });

  const updated = getAdminPasswordRecoveryRequestsSnapshot().find(
    (item) => item.id === requestId,
  );

  if (!updated) {
    throw new AdminPasswordRecoveryManagementError('Заявка не найдена.');
  }

  return mapRequest(updated);
}

export { wait };
