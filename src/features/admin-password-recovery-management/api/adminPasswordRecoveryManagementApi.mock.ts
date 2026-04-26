// src/features/admin-password-recovery-management/api/adminPasswordRecoveryManagementApi.mock.ts
import {
  cloneRecoveryRequests,
  processRecoveryRequest,
  wait,
} from '../data/mockAdminPasswordRecoveryManagement';
import { getMockAuthAccounts, normalizeEmail } from '@/features/auth/data/mockAuthAccounts';

import type {
  AdminPasswordRecoveryRequestItem,
  GetAdminPasswordRecoveryRequestsPayload,
  ProcessAdminPasswordRecoveryPayload,
  ProcessAdminPasswordRecoveryResponse,
} from '../model/types';

function isWithinRange(
  value: string | undefined,
  from?: string,
  to?: string,
): boolean {
  if (!value) {
    return false;
  }

  const time = new Date(value).getTime();
  if (Number.isNaN(time)) {
    return false;
  }

  const fromTime = from ? new Date(from).getTime() : Number.NEGATIVE_INFINITY;
  const toTime = to ? new Date(to).getTime() : Number.POSITIVE_INFINITY;

  return time >= fromTime && time <= toTime;
}

function enrichWithFullName(
  requests: AdminPasswordRecoveryRequestItem[],
): AdminPasswordRecoveryRequestItem[] {
  const accountsByEmail = new Map(
    getMockAuthAccounts().map((account) => [
      normalizeEmail(account.email),
      [account.lastName, account.firstName, account.middleName].filter(Boolean).join(' '),
    ]),
  );

  return requests.map((request) => ({
    ...request,
    fullName: accountsByEmail.get(normalizeEmail(request.email)) || request.fullName,
  }));
}

export async function mockGetAdminPasswordRecoveryRequests(): Promise<
  AdminPasswordRecoveryRequestItem[]
> {
  await wait();

  return enrichWithFullName(cloneRecoveryRequests());
}

export async function mockGetAdminPasswordRecoveryRequestsByRange(
  payload: GetAdminPasswordRecoveryRequestsPayload,
): Promise<AdminPasswordRecoveryRequestItem[]> {
  const all = await mockGetAdminPasswordRecoveryRequests();

  return all.filter((item) => {
    if (item.status !== 'processed') {
      return true;
    }

    return isWithinRange(item.processedAt, payload.processedFrom, payload.processedTo);
  });
}

export async function mockProcessAdminPasswordRecoveryRequest(
  payload: ProcessAdminPasswordRecoveryPayload,
): Promise<ProcessAdminPasswordRecoveryResponse> {
  await wait();

  const request = processRecoveryRequest(payload.requestId);

  return {
    request,
    temporaryPassword: request.temporaryPassword ?? '',
  };
}
