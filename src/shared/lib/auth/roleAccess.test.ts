import { describe, expect, it } from 'vitest';

import type { AuthUser } from '@/features/auth/model/authStore';

import {
  canAccessAdminArea,
  canAccessClientArea,
  canOrderShopProducts,
  isAuthenticatedRole,
} from './roleAccess';

describe('roleAccess', () => {
  it('isAuthenticatedRole returns false for guest', () => {
    expect(isAuthenticatedRole('guest')).toBe(false);
    expect(isAuthenticatedRole(undefined)).toBe(false);
  });

  it('isAuthenticatedRole returns true for client', () => {
    expect(isAuthenticatedRole('client')).toBe(true);
  });

  it('canAccessClientArea respects block flag', () => {
    const user: AuthUser = {
      id: '1',
      email: 'a@b.c',
      role: 'client',
      isBlocked: true,
    };
    expect(canAccessClientArea(user)).toBe(false);
  });

  it('canAccessAdminArea allows admin', () => {
    const user: AuthUser = {
      id: '1',
      email: 'a@b.c',
      role: 'admin',
    };
    expect(canAccessAdminArea(user)).toBe(true);
  });

  it('canOrderShopProducts allows specialist', () => {
    const user: AuthUser = {
      id: '1',
      email: 'a@b.c',
      role: 'specialist',
    };
    expect(canOrderShopProducts(user)).toBe(true);
  });
});
