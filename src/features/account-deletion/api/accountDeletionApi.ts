// src/features/account-deletion/api/accountDeletionApi.ts

import { request } from '@/shared/api/http';

import {
  mockGetAccountRestorePreview,
  mockRequestAccountDeletion,
  mockRestoreAccountByToken,
} from './accountDeletionApi.mock';

import type { AccountDeletionRestorePreview } from '../model/types';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

async function realRequestAccountDeletion(payload: {
  userId: string;
  password: string;
}): Promise<{ ok: true; restoreDeadlineIso: string }> {
  return request(`${API_BASE_URL}/account/deletion/request`, {
    method: 'POST',
    body: payload,
  });
}

async function realGetRestorePreview(
  token: string,
): Promise<AccountDeletionRestorePreview> {
  return request(
    `${API_BASE_URL}/account/deletion/restore-preview?token=${encodeURIComponent(token)}`,
  );
}

async function realRestoreByToken(token: string): Promise<void> {
  await request(`${API_BASE_URL}/account/deletion/restore`, {
    method: 'POST',
    body: { token },
  });
}

export const accountDeletionApi = {
  requestDeletion(payload: {
    userId: string;
    password: string;
  }): Promise<{ ok: true; restoreDeadlineIso: string }> {
    if (USE_MOCK) {
      return mockRequestAccountDeletion(payload);
    }

    return realRequestAccountDeletion(payload);
  },

  getRestorePreview(token: string): Promise<AccountDeletionRestorePreview> {
    if (USE_MOCK) {
      return mockGetAccountRestorePreview(token);
    }

    return realGetRestorePreview(token);
  },

  restoreByToken(token: string): Promise<void> {
    if (USE_MOCK) {
      return mockRestoreAccountByToken(token);
    }

    return realRestoreByToken(token);
  },
};
