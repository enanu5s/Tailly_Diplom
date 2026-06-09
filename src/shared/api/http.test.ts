import { afterEach, describe, expect, it, vi } from 'vitest';

import { HttpError, HttpTimeoutError, request } from './http';

describe('HttpError', () => {
  it('carries status and optional field errors', () => {
    const err = new HttpError({
      status: 422,
      body: { message: 'Bad' },
      message: 'Bad',
      code: 'VALIDATION',
      fieldErrors: { email: 'invalid' },
    });
    expect(err.status).toBe(422);
    expect(err.fieldErrors?.email).toBe('invalid');
    expect(err.name).toBe('HttpError');
  });
});

describe('HttpTimeoutError', () => {
  it('includes timeout in message', () => {
    const err = new HttpTimeoutError(5000);
    expect(err.timeoutMs).toBe(5000);
    expect(err.message).toContain('5000');
  });
});

describe('request', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('parses JSON response on 200', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ hello: 'world' }),
      }),
    );

    await expect(request<{ hello: string }>('/test-path')).resolves.toEqual({
      hello: 'world',
    });
  });

  it('throws HttpError on non-OK with JSON body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          message: 'Invalid',
          code: 'BAD',
          errors: { x: 'y' },
        }),
      }),
    );

    await expect(request('/bad')).rejects.toMatchObject({
      name: 'HttpError',
      status: 400,
      code: 'BAD',
    });
  });
});
