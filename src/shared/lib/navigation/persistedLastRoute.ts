// src/shared/lib/navigation/persistedLastRoute.ts

export const LAST_ROUTE_STORAGE_KEY = 'tailly_last_route';

export type PersistedLastRoute = {
  pathname: string;
  search: string;
  hash: string;
  savedAt: string;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function isPersistedLastRoute(value: unknown): value is PersistedLastRoute {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    isNonEmptyString(candidate.pathname) &&
    typeof candidate.search === 'string' &&
    typeof candidate.hash === 'string' &&
    isNonEmptyString(candidate.savedAt)
  );
}

export function saveLastRoute(params: {
  pathname: string;
  search?: string;
  hash?: string;
}): void {
  if (typeof window === 'undefined') {
    return;
  }

  const payload: PersistedLastRoute = {
    pathname: params.pathname,
    search: params.search ?? '',
    hash: params.hash ?? '',
    savedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(
    LAST_ROUTE_STORAGE_KEY,
    JSON.stringify(payload),
  );
}

export function readLastRoute(): PersistedLastRoute | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawValue = window.localStorage.getItem(LAST_ROUTE_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(rawValue);

    return isPersistedLastRoute(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function clearLastRoute(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(LAST_ROUTE_STORAGE_KEY);
}