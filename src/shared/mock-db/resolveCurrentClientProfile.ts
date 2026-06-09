// src/shared/mock-db/resolveCurrentClientProfile.ts

import { authStore } from '@/features/auth/model/authStore';
import { getMockAuthAccounts } from '@/features/auth/data/mockAuthAccounts';
import type { UserProfile } from '@/features/profile/model/types';

import type { MockDbSnapshot } from './types';

/** ID пользователя из сессии (мок). */
export function requireMockSessionUserId(): string {
  const id = authStore.getState().user?.id;

  if (!id) {
    throw new Error('Нужна авторизация');
  }

  return id;
}

/**
 * Ссылка на профиль клиента для текущего пользователя.
 * Если записи нет (новый регистрант без сида, специалист без client-профиля в БД),
 * создаёт её из mock auth-аккаунта и/или данных сессии.
 */
export function resolveMutableClientProfile(db: MockDbSnapshot): UserProfile {
  const userId = requireMockSessionUserId();

  const existing = db.client.profiles[userId];
  if (existing) {
    return existing;
  }

  const sessionUser = authStore.getState().user;
  const account = getMockAuthAccounts().find((a) => a.id === userId);

  const profile: UserProfile = {
    id: userId,
    firstName: account?.firstName ?? sessionUser?.firstName ?? '',
    lastName: account?.lastName ?? sessionUser?.lastName ?? '',
    middleName: account?.middleName ?? sessionUser?.middleName,
    city: '',
    phone: account?.phone ?? sessionUser?.phone ?? '',
    email: (sessionUser?.email ?? account?.email ?? '').trim(),
  };

  db.client.profiles[userId] = profile;

  if (!db.client.petsByUserId[userId]) {
    db.client.petsByUserId[userId] = [];
  }

  return profile;
}
