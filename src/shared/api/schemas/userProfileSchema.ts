import { z } from 'zod';

import type { UserProfile } from '@/features/profile/model/types';

export const userProfileSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  middleName: z.string().optional(),
  avatarUrl: z.string().optional(),
  city: z.string(),
  phone: z.string(),
  email: z.string(),
}) satisfies z.ZodType<UserProfile>;
