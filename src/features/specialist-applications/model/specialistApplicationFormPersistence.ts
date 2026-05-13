import { authStore } from '@/features/auth';
import type { AuthUser } from '@/features/auth/model/authStore';

const STORAGE_KEY_PREFIX = 'tailly_specialist_form_submitted';
const GUEST_STORAGE_KEY = `${STORAGE_KEY_PREFIX}_guest`;

type StoredPayload = {
  email: string;
};

function getUserStorageIdentity(user: AuthUser | null): string | null {
  if (!user) {
    return null;
  }

  if (typeof user.id === 'string') {
    return user.id;
  }

  if ('specialistId' in user && typeof user.specialistId === 'string') {
    return user.specialistId;
  }

  if ('adminId' in user && typeof user.adminId === 'string') {
    return user.adminId;
  }

  if (typeof user.email === 'string') {
    return user.email.toLowerCase();
  }

  return null;
}

function buildStorageKey(user: AuthUser | null): string {
  const identity = getUserStorageIdentity(user);

  if (!identity) {
    return GUEST_STORAGE_KEY;
  }

  return `${STORAGE_KEY_PREFIX}_user_${identity}`;
}

function isStoredPayload(value: unknown): value is StoredPayload {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<StoredPayload>;

  return typeof candidate.email === 'string' && candidate.email.trim().length > 0;
}

export function readSpecialistFormSubmittedEmail(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const key = buildStorageKey(authStore.getState().user);
  const raw = window.localStorage.getItem(key);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (isStoredPayload(parsed)) {
      return parsed.email.trim();
    }
  } catch {
    return null;
  }

  return null;
}

export function persistSpecialistFormSubmission(email: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  const key = buildStorageKey(authStore.getState().user);
  const payload: StoredPayload = { email: email.trim() };

  window.localStorage.setItem(key, JSON.stringify(payload));
}
