//src/shared/lib/navigation/routeMemory.ts

import type { Location } from 'react-router-dom';

export type RouteSnapshot = {
  pathname: string;
  search: string;
  hash: string;
};

export type RouteMemoryState = {
  from?: RouteSnapshot;
};

const SCROLL_STORAGE_KEY = 'tailly_route_scroll_positions_v1';

type ScrollPositionsMap = Record<string, number>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readScrollPositions(): ScrollPositionsMap {
  if (typeof window === 'undefined') {
    return {};
  }

  const rawValue = window.sessionStorage.getItem(SCROLL_STORAGE_KEY);

  if (!rawValue) {
    return {};
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;

    if (!isRecord(parsed)) {
      return {};
    }

    const result: ScrollPositionsMap = {};

    Object.entries(parsed).forEach(([key, value]) => {
      if (typeof value === 'number' && Number.isFinite(value)) {
        result[key] = value;
      }
    });

    return result;
  } catch {
    return {};
  }
}

function writeScrollPositions(value: ScrollPositionsMap): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(SCROLL_STORAGE_KEY, JSON.stringify(value));
}

export function createRouteSnapshot(
  location: Pick<Location, 'pathname' | 'search' | 'hash'>,
): RouteSnapshot {
  return {
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
  };
}

export function buildRouteKey(
  location: Pick<Location, 'pathname' | 'search' | 'hash'>,
): string {
  return `${location.pathname}${location.search}${location.hash}`;
}

export function saveScrollPosition(routeKey: string, scrollY: number): void {
  const current = readScrollPositions();

  current[routeKey] = Math.max(0, Math.floor(scrollY));

  writeScrollPositions(current);
}

export function getScrollPosition(routeKey: string): number | null {
  const current = readScrollPositions();
  const value = current[routeKey];

  return typeof value === 'number' ? value : null;
}

function normalizeState(state: unknown): Record<string, unknown> {
  if (isRecord(state)) {
    return state;
  }

  return {};
}

export function createNavigationState(
  location: Pick<Location, 'pathname' | 'search' | 'hash'>,
  state?: unknown,
): Record<string, unknown> {
  return {
    ...normalizeState(state),
    from: createRouteSnapshot(location),
  };
}

export function getBackTargetFromState(state: unknown): RouteSnapshot | null {
  if (!isRecord(state)) {
    return null;
  }

  const from = state.from;

  if (!isRecord(from)) {
    return null;
  }

  const pathname = from.pathname;
  const search = from.search;
  const hash = from.hash;

  if (
    typeof pathname !== 'string' ||
    typeof search !== 'string' ||
    typeof hash !== 'string'
  ) {
    return null;
  }

  return {
    pathname,
    search,
    hash,
  };
}