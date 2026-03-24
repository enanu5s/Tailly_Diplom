// src/features/auth/data/mockAdminPasswordRecoveryRequests.ts

import { cloneDeep } from '@/shared/mock-db/cloneDeep';
import {
  ensureMockDatabaseLoaded,
  patchMockDatabase,
  unsafeMutableMockDb,
} from '@/shared/mock-db/store';

export type MockAdminPasswordRecoveryRequest = {
  id: string;
  email: string;
  requestedAt: string;
  status: 'pending' | 'processed';
  processedAt?: string;
  temporaryPassword?: string;
};

export function wait(delay = 300): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delay);
  });
}

export function buildRecoveryRequestId(): string {
  return `admin-recovery-${Math.random().toString(36).slice(2, 10)}`;
}

export function getAdminPasswordRecoveryRequestsSnapshot(): MockAdminPasswordRecoveryRequest[] {
  ensureMockDatabaseLoaded();

  return cloneDeep(unsafeMutableMockDb().adminPasswordRecovery.requests);
}

export function cloneAdminPasswordRecoveryRequests(): MockAdminPasswordRecoveryRequest[] {
  return getAdminPasswordRecoveryRequestsSnapshot();
}

export function prependAdminPasswordRecoveryRequest(
  row: MockAdminPasswordRecoveryRequest,
): void {
  patchMockDatabase((db) => {
    db.adminPasswordRecovery.requests = [row, ...db.adminPasswordRecovery.requests];
  });
}

export function findPendingAdminPasswordRecoveryRequestByEmail(
  email: string,
): MockAdminPasswordRecoveryRequest | null {
  ensureMockDatabaseLoaded();

  const normalizedEmail = email.trim().toLowerCase();

  return (
    unsafeMutableMockDb().adminPasswordRecovery.requests.find(
      (item) =>
        item.email.trim().toLowerCase() === normalizedEmail &&
        item.status === 'pending',
    ) ?? null
  );
}
