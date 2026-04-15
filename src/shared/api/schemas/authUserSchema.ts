// src/shared/api/schemas/authUserSchema.ts

import { z } from 'zod';

import type { AuthUser, UserRole } from '@/features/auth/model/authStore';

const userRoleSchema = z.enum([
  'guest',
  'client',
  'specialist',
  'admin',
  'super_admin',
]) satisfies z.ZodType<UserRole>;

export const authUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: userRoleSchema,
  name: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  middleName: z.string().optional(),
  phone: z.string().optional(),
  specialistId: z.string().optional(),
  specialistSlug: z.string().optional(),
  adminId: z.string().optional(),
  isBlocked: z.boolean().optional(),
}) satisfies z.ZodType<AuthUser>;

export const loginSuccessResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  accessTokenExpires: z.string(),
  refreshTokenExpires: z.string(),
  user: authUserSchema.optional(),
});