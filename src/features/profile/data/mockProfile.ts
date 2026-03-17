// src/features/profile/data/mockProfile.ts

import type { UserProfile } from '../model/types';

export function deepCopy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export let MOCK_PROFILE: UserProfile = {
  id: 'u-1',
  firstName: 'Иван',
  lastName: 'Петров',
  city: 'Москва',
  phone: '+7 (999) 123-45-67',
  email: 'ivan.petrov@mail.ru',
  avatarUrl: '/images/profile-avatar.png',
};