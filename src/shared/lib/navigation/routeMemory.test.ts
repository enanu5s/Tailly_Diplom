import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  buildRouteKey,
  createNavigationState,
  createRouteSnapshot,
  getBackTargetFromState,
  getScrollPosition,
  saveScrollPosition,
} from './routeMemory';

describe('createRouteSnapshot / buildRouteKey', () => {
  it('копирует pathname, search, hash', () => {
    const loc = { pathname: '/a', search: '?x=1', hash: '#h' };
    expect(createRouteSnapshot(loc)).toEqual(loc);
    expect(buildRouteKey(loc)).toBe('/a?x=1#h');
  });
});

describe('createNavigationState', () => {
  it('добавляет from и сохраняет прежний state', () => {
    const loc = { pathname: '/to', search: '', hash: '' };
    const state = createNavigationState(loc, { foo: 1 });
    expect(state).toEqual({
      foo: 1,
      from: { pathname: '/to', search: '', hash: '' },
    });
  });

  it('нормализует не-объект state в пустой объект', () => {
    const loc = { pathname: '/', search: '', hash: '' };
    expect(createNavigationState(loc, null)).toEqual({
      from: { pathname: '/', search: '', hash: '' },
    });
  });
});

describe('getBackTargetFromState', () => {
  it('возвращает from при валидной форме', () => {
    const snap = { pathname: '/p', search: '?q=1', hash: '' };
    expect(getBackTargetFromState({ from: snap })).toEqual(snap);
  });

  it('возвращает null при невалидных данных', () => {
    expect(getBackTargetFromState(null)).toBeNull();
    expect(getBackTargetFromState({})).toBeNull();
    expect(
      getBackTargetFromState({ from: { pathname: 1, search: '', hash: '' } }),
    ).toBeNull();
  });
});

describe('scroll position (sessionStorage)', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  afterEach(() => {
    window.sessionStorage.clear();
  });

  it('saveScrollPosition и getScrollPosition сохраняют ключ', () => {
    saveScrollPosition('/x', 120.7);
    expect(getScrollPosition('/x')).toBe(120);
  });

  it('отрицательные значения приводятся к 0', () => {
    saveScrollPosition('/y', -5);
    expect(getScrollPosition('/y')).toBe(0);
  });
});
