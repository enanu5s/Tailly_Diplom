import { ApiValidationError } from '@/shared/api/apiValidationError';

import { request, type RequestOptions } from './http';

import type { z } from 'zod';

/**
 * HTTP-запрос с проверкой тела ответа через Zod.
 * Ошибки сети/статуса — {@link HttpError}; несоответствие схемы — {@link ApiValidationError}.
 */
export async function requestParsed<T>(
  path: string,
  schema: z.ZodType<T>,
  options: RequestOptions = {},
): Promise<T> {
  const data = await request<unknown>(path, options);
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    throw new ApiValidationError(path, parsed.error);
  }

  return parsed.data;
}
