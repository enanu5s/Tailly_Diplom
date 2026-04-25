//src/shared/lib/scroll/index.ts

const KEY_PREFIX = 'tailly:scroll:';

export function saveScrollPosition(pathname: string) {
  saveScrollPositionValue(pathname, window.scrollY);
}

export function saveScrollPositionValue(pathname: string, y: number) {
  try {
    sessionStorage.setItem(`${KEY_PREFIX}${pathname}`, String(y));
  } catch {
    // ignore
  }
}

export function consumeScrollPosition(pathname: string): number | null {
  try {
    const key = `${KEY_PREFIX}${pathname}`;
    const raw = sessionStorage.getItem(key);
    if (raw == null) return null;
    sessionStorage.removeItem(key);
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}
