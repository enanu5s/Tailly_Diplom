// src/features/auth/data/mockAccountDeletionStorage.ts

import {
  readManagedSpecialistAccounts,
  writeManagedSpecialistAccounts,
} from '@/shared/lib/mock/specialistAccountsStorage';

export const ACCOUNT_SOFT_DELETE_DAYS = 30;

const STORAGE_SOFT_DELETE = 'tailly_account_soft_delete_by_user_id';
const STORAGE_PERMANENT = 'tailly_permanently_deleted_user_ids';
const STORAGE_EMAIL_OUTBOX = 'tailly_mock_account_deletion_emails';
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

function readSoftDeleteMap(): Record<string, AccountSoftDeleteRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_SOFT_DELETE);

    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as unknown;

    if (!parsed || typeof parsed !== 'object') {
      return {};
    }

    return parsed as Record<string, AccountSoftDeleteRecord>;
  } catch {
    return {};
  }
}

function writeSoftDeleteMap(map: Record<string, AccountSoftDeleteRecord>): void {
  localStorage.setItem(STORAGE_SOFT_DELETE, JSON.stringify(map));
}

function readPermanentDeletedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_PERMANENT);

    if (!raw) {
      return new Set();
    }

    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return new Set();
    }

    return new Set(
      parsed.filter(
        (id): id is string => typeof id === 'string' && id.trim().length > 0,
      ),
    );
  } catch {
    return new Set();
  }
}

function writePermanentDeletedIds(ids: Set<string>): void {
  localStorage.setItem(STORAGE_PERMANENT, JSON.stringify([...ids]));
}

export function purgeExpiredSoftDeletes(): void {
  const map = readSoftDeleteMap();
  const permanent = readPermanentDeletedIds();
  const now = Date.now();
  let changed = false;
  let specialists = readManagedSpecialistAccounts();
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
    writeSoftDeleteMap(map);
    writePermanentDeletedIds(permanent);
  }

  if (specialistsTouched) {
    writeManagedSpecialistAccounts(specialists);
  }
}

export function getPermanentDeletedIds(): Set<string> {
  return readPermanentDeletedIds();
}

export function getActiveSoftDeleteRecord(
  userId: string,
): AccountSoftDeleteRecord | null {
  purgeExpiredSoftDeletes();

  const rec = readSoftDeleteMap()[userId];

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

  const map = readSoftDeleteMap();

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
  const map = readSoftDeleteMap();

  map[userId] = record;
  writeSoftDeleteMap(map);
}

export function removeSoftDeleteRecord(userId: string): void {
  const map = readSoftDeleteMap();

  if (!(userId in map)) {
    return;
  }

  delete map[userId];
  writeSoftDeleteMap(map);
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
    const raw = localStorage.getItem(STORAGE_EMAIL_OUTBOX);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    const list: MockAccountDeletionEmail[] = Array.isArray(parsed)
      ? (parsed as MockAccountDeletionEmail[])
      : [];

    const row: MockAccountDeletionEmail = {
      id: `mail-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      to: entry.to,
      subject: entry.subject,
      html: entry.html,
      sentAt: new Date().toISOString(),
    };

    list.unshift(row);

    localStorage.setItem(
      STORAGE_EMAIL_OUTBOX,
      JSON.stringify(list.slice(0, EMAIL_OUTBOX_MAX)),
    );
  } catch {
    /* демо-хранилище писем */
  }
}
