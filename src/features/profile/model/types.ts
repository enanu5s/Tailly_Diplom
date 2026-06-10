//src/features/profile/model/types.ts

export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  avatarUrl?: string;
  city: string;
  district?: string;
  phone: string;
  email: string;
};
