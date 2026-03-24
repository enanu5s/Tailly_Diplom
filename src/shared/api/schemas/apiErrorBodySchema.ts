import { z } from 'zod';

/** Ожидаемый формат JSON-ошибки от backend (совместим с полями {@link HttpError}). */
export const apiErrorBodySchema = z.object({
  message: z.string().optional(),
  code: z.string().optional(),
  errors: z.record(z.string(), z.string()).optional(),
});

export type ApiErrorBody = z.infer<typeof apiErrorBodySchema>;
