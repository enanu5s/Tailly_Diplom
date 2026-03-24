import { describe, expect, it } from 'vitest';

import { authUserSchema, loginSuccessResponseSchema } from './authUserSchema';

describe('authUserSchema', () => {
  it('accepts minimal valid user', () => {
    const parsed = authUserSchema.safeParse({
      id: 'u1',
      email: 'user@example.com',
      role: 'client',
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects invalid role', () => {
    const parsed = authUserSchema.safeParse({
      id: 'u1',
      email: 'user@example.com',
      role: 'invalid',
    });
    expect(parsed.success).toBe(false);
  });
});

describe('loginSuccessResponseSchema', () => {
  it('accepts accessToken and user', () => {
    const parsed = loginSuccessResponseSchema.safeParse({
      accessToken: 'jwt',
      user: {
        id: 'u1',
        email: 'user@example.com',
        role: 'client',
      },
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.accessToken).toBe('jwt');
    }
  });
});
