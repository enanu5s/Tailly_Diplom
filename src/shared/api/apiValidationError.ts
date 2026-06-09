import type { ZodError } from 'zod';

export class ApiValidationError extends Error {
  readonly path: string;
  readonly zodError: ZodError;

  constructor(path: string, zodError: ZodError) {
    const detail = zodError.issues
      .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('; ');
    super(`Ответ API не соответствует ожидаемой схеме (${path}): ${detail}`);
    this.name = 'ApiValidationError';
    this.path = path;
    this.zodError = zodError;
  }
}
