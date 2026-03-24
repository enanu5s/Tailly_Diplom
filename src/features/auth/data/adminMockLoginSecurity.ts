// src/features/auth/data/adminMockLoginSecurity.ts
import type { AdminLoginSecurityInfo } from '@/features/admin-profile/model/types';
import type { ManagedAdmin } from '@/features/super-admin-admins-management/model/types';
import type { MockAuthAccount } from '@/features/auth/data/mockAuthAccounts';
import {
  getAdminAttemptState,
  getMockAuthAccounts,
  hasAdminRole,
  normalizeEmail,
  syncBlockedState,
} from '@/features/auth/data/mockAuthAccounts';

export function enrichManagedAdminWithLoginSecurity(admin: ManagedAdmin): ManagedAdmin {
  const accounts = getMockAuthAccounts();
  const acc = accounts.find(
    (a) => a.adminId === admin.adminId && hasAdminRole(a.roles),
  ) as MockAuthAccount | undefined;

  if (acc) {
    syncBlockedState(acc);
  }

  const attempts = getAdminAttemptState(admin.email);
  const lockMs = attempts.lockUntil ? new Date(attempts.lockUntil).getTime() : NaN;
  const passwordAttemptsLockUntil =
    attempts.lockUntil && !Number.isNaN(lockMs) && lockMs > Date.now()
      ? attempts.lockUntil
      : null;

  return {
    ...admin,
    isBlocked: Boolean(acc?.isBlocked),
    blockReason: acc?.blockReason,
    blockedUntil: acc?.blockedUntil,
    isPermanentBlock: Boolean(acc?.isPermanentBlock),
    passwordAttemptsLockUntil,
    failedPasswordAttempts: attempts.failedAttempts,
  };
}

export function buildAdminLoginSecurityInfo(email: string): AdminLoginSecurityInfo | undefined {
  const accounts = getMockAuthAccounts();
  const acc = accounts.find(
    (a) => normalizeEmail(a.email) === normalizeEmail(email) && hasAdminRole(a.roles),
  ) as MockAuthAccount | undefined;

  if (!acc) {
    return undefined;
  }

  syncBlockedState(acc);

  const attempts = getAdminAttemptState(email);
  const lockMs = attempts.lockUntil ? new Date(attempts.lockUntil).getTime() : NaN;
  const passwordAttemptsLockUntil =
    attempts.lockUntil && !Number.isNaN(lockMs) && lockMs > Date.now()
      ? attempts.lockUntil
      : null;

  return {
    isManuallyBlocked: Boolean(acc.isBlocked),
    blockReason: acc.blockReason,
    blockedUntil: acc.blockedUntil ?? null,
    isPermanentBlock: Boolean(acc.isPermanentBlock),
    passwordAttemptsLockUntil,
    failedPasswordAttempts: attempts.failedAttempts,
  };
}
