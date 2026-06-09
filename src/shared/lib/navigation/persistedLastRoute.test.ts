import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  LAST_ROUTE_STORAGE_KEY,
  clearLastRoute,
  readLastRoute,
  saveLastRoute,
} from './persistedLastRoute';

describe('persistedLastRoute', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('saveLastRoute записывает JSON с savedAt', () => {
    saveLastRoute({ pathname: '/home', search: '?a=1', hash: '#x' });
    const raw = window.localStorage.getItem(LAST_ROUTE_STORAGE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.pathname).toBe('/home');
    expect(parsed.search).toBe('?a=1');
    expect(parsed.hash).toBe('#x');
    expect(typeof parsed.savedAt).toBe('string');
  });

  it('readLastRoute возвращает объект или null', () => {
    expect(readLastRoute()).toBeNull();
    window.localStorage.setItem(LAST_ROUTE_STORAGE_KEY, 'not-json');
    expect(readLastRoute()).toBeNull();
    window.localStorage.setItem(
      LAST_ROUTE_STORAGE_KEY,
      JSON.stringify({ pathname: '/p', search: '', hash: '', savedAt: 't' }),
    );
    expect(readLastRoute()?.pathname).toBe('/p');
  });

  it('clearLastRoute удаляет ключ', () => {
    saveLastRoute({ pathname: '/x' });
    clearLastRoute();
    expect(window.localStorage.getItem(LAST_ROUTE_STORAGE_KEY)).toBeNull();
  });
});
