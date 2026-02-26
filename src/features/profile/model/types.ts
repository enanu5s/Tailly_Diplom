//src/features/profile/model/types.ts

export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string; // "/images/..."
  city: string;
  phone: string;
  email: string;
};