// src/features/auth/data/mockAccountDeletionStorage.ts

import {
  ensureMockDatabaseLoaded,
  patchMockDatabase,
  persistMockDatabase,
  unsafeMutableMockDb,
} from '@/shared/mock-db/store';

export const ACCOUNT_SOFT_DELETE_DAYS = 30;

const EMAIL_OUTBOX_MAX = 30;

export type AccountSoftDeleteRecord = {
  softDeletedAt: string;
  restoreUntil: string;
  token: string;
};

export type MockAccountDeletionEmail = {
  id: string;
  to: string;
  subject: string;
  html: string;
  sentAt: string;
};

function randomToken(): string {
  const bytes = new Uint8Array(24);

  crypto.getRandomValues(bytes);

  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function purgeExpiredSoftDeletes(): void {
  ensureMockDatabaseLoaded();

  const db = unsafeMutableMockDb();
  const map = { ...db.accountDeletion.softDeleteByUserId };
  const permanent = new Set(db.accountDeletion.permanentUserIds);
  const now = Date.now();
  let changed = false;
  let specialists = [...db.specialists.managed];
  let specialistsTouched = false;

  for (const [userId, rec] of Object.entries(map)) {
    const until = new Date(rec.restoreUntil).getTime();

    if (Number.isNaN(until) || until > now) {
      continue;
    }

    delete map[userId];
    permanent.add(userId);
    changed = true;

    const idx = specialists.findIndex(
      (item) => item.id === userId || item.specialistId === userId,
    );

    if (idx !== -1) {
      specialists = specialists.filter((_, i) => i !== idx);
      specialistsTouched = true;
    }
  }

  if (changed) {
    db.accountDeletion.softDeleteByUserId = map;
    db.accountDeletion.permanentUserIds = [...permanent];
  }

  if (specialistsTouched) {
    db.specialists.managed = specialists;
  }

  if (changed || specialistsTouched) {
    persistMockDatabase();
  }
}

export function getPermanentDeletedIds(): Set<string> {
  ensureMockDatabaseLoaded();

  return new Set(unsafeMutableMockDb().accountDeletion.permanentUserIds);
}

export function getActiveSoftDeleteRecord(
  userId: string,
): AccountSoftDeleteRecord | null {
  purgeExpiredSoftDeletes();

  const rec = unsafeMutableMockDb().accountDeletion.softDeleteByUserId[userId];

  if (!rec) {
    return null;
  }

  const until = new Date(rec.restoreUntil).getTime();

  if (Number.isNaN(until) || until <= Date.now()) {
    return null;
  }

  return rec;
}

export function isUserInSoftDeleteGracePeriod(userId: string): boolean {
  return getActiveSoftDeleteRecord(userId) !== null;
}

export function findUserIdByRestoreToken(
  token: string,
): { userId: string; record: AccountSoftDeleteRecord } | null {
  purgeExpiredSoftDeletes();

  const normalized = token.trim();

  if (!normalized) {
    return null;
  }

  const map = unsafeMutableMockDb().accountDeletion.softDeleteByUserId;

  for (const [userId, rec] of Object.entries(map)) {
    if (rec.token === normalized) {
      return { userId, record: rec };
    }
  }

  return null;
}

export function putSoftDeleteRecord(
  userId: string,
  record: AccountSoftDeleteRecord,
): void {
  patchMockDatabase((db) => {
    db.accountDeletion.softDeleteByUserId = {
      ...db.accountDeletion.softDeleteByUserId,
      [userId]: record,
    };
  });
}

export function removeSoftDeleteRecord(userId: string): void {
  patchMockDatabase((db) => {
    const next = { ...db.accountDeletion.softDeleteByUserId };
    delete next[userId];
    db.accountDeletion.softDeleteByUserId = next;
  });
}

export function createSoftDeleteRecord(): AccountSoftDeleteRecord {
  const softDeletedAt = new Date().toISOString();
  const restoreUntil = new Date(
    Date.now() + ACCOUNT_SOFT_DELETE_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  return {
    softDeletedAt,
    restoreUntil,
    token: randomToken(),
  };
}

export function appendMockAccountDeletionEmail(entry: {
  to: string;
  subject: string;
  html: string;
}): void {
  try {
    patchMockDatabase((db) => {
      const list = [...db.accountDeletion.deletionEmailOutbox];

      const row: MockAccountDeletionEmail = {
        id: `mail-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        to: entry.to,
        subject: entry.subject,
        html: entry.html,
        sentAt: new Date().toISOString(),
      };

      list.unshift(row);
      db.accountDeletion.deletionEmailOutbox = list.slice(0, EMAIL_OUTBOX_MAX);
    });
  } catch {
    /* демо-хранилище писем */
  }
}
