// src/features/auth/data/mockLastLogin.ts
import { patchMockDatabase } from '@/shared/mock-db/store';

/** Обновляет «Последний вход» у записи администратора в mock-db (список superAdmin.admins). */
export function recordMockAdminLastLoginAt(
  adminId: string,
  atIso: string = new Date().toISOString(),
): void {
  const id = adminId.trim();

  if (!id) {
    return;
  }

  patchMockDatabase((db) => {
    const idx = db.superAdmin.admins.findIndex((a) => a.adminId === id);

    if (idx === -1) {
      return;
    }

    const row = db.superAdmin.admins[idx];
    db.superAdmin.admins[idx] = { ...row, lastLoginAt: atIso };
  });
}

/** Обновляет «Последний вход» у специалиста в specialists.managed. */
export function recordMockSpecialistLastLoginAt(
  specialistId: string,
  atIso: string = new Date().toISOString(),
): void {
  const id = specialistId.trim();

  if (!id) {
    return;
  }

  patchMockDatabase((db) => {
    const idx = db.specialists.managed.findIndex(
      (a) => a.specialistId === id || a.id === id,
    );

    if (idx === -1) {
      return;
    }

    const row = db.specialists.managed[idx];
    db.specialists.managed[idx] = { ...row, lastLoginAt: atIso };
  });
}
