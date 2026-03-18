// src/features/auth/data/mockAdminPasswordRecoveryRequests.ts

export type MockAdminPasswordRecoveryRequest = {
  id: string;
  email: string;
  requestedAt: string;
  status: 'pending' | 'processed';
  processedAt?: string;
  temporaryPassword?: string;
};

export const MOCK_ADMIN_PASSWORD_RECOVERY_REQUESTS: MockAdminPasswordRecoveryRequest[] = [];

export function wait(delay = 300): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delay);
  });
}

export function buildRecoveryRequestId(): string {
  return `admin-recovery-${Math.random().toString(36).slice(2, 10)}`;
}

export function cloneAdminPasswordRecoveryRequests(): MockAdminPasswordRecoveryRequest[] {
  return JSON.parse(
    JSON.stringify(MOCK_ADMIN_PASSWORD_RECOVERY_REQUESTS),
  ) as MockAdminPasswordRecoveryRequest[];
}

export function findPendingAdminPasswordRecoveryRequestByEmail(
  email: string,
): MockAdminPasswordRecoveryRequest | null {
  const normalizedEmail = email.trim().toLowerCase();

  return (
    MOCK_ADMIN_PASSWORD_RECOVERY_REQUESTS.find(
      (item) =>
        item.email.trim().toLowerCase() === normalizedEmail &&
        item.status === 'pending',
    ) ?? null
  );
}