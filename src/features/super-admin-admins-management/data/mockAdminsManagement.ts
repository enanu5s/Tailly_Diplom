// src/features/super-admin-admins-management/data/mockAdminsManagement.ts

import { cloneDeep } from '@/shared/mock-db/cloneDeep';
import { ensureMockDatabaseLoaded, unsafeMutableMockDb } from '@/shared/mock-db/store';

import type { ManagedAdmin } from '../model/types';

export type MockAdminRecord = ManagedAdmin & {
  temporaryPassword?: string;
};

export function getSuperAdminAdminsMutable(): MockAdminRecord[] {
  ensureMockDatabaseLoaded();

  return unsafeMutableMockDb().superAdmin.admins;
}

export function wait(delay = 250): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delay);
  });
}

export function buildAdminId(): string {
  return `admin-${Math.random().toString(36).slice(2, 10)}`;
}

export function buildTemporaryPassword(): string {
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `Tailly-${randomPart}!`;
}

export function normalizeOptional(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function cloneAdmins(): ManagedAdmin[] {
  return cloneDeep(getSuperAdminAdminsMutable()) as ManagedAdmin[];
}
