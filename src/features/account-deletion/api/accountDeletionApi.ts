// src/features/account-deletion/api/accountDeletionApi.ts

import { request } from '@/shared/api/http';
import { isMockApiMode } from '@/shared/config/env';

import {
  mockGetAccountRestorePreview,
  mockRequestAccountDeletion,
  mockRestoreAccountByToken,
} from './accountDeletionApi.mock';

import type { AccountDeletionRestorePreview } from '../model/types';

async function realRequestAccountDeletion(payload: {
  userId: string;
  password: string;
}): Promise<{ ok: true; restoreDeadlineIso: string }> {
  return request('/account/deletion/request', {
    method: 'POST',
    body: payload,
  });
}

async function realGetRestorePreview(
  token: string,
): Promise<AccountDeletionRestorePreview> {
  return request('/account/deletion/restore-preview', {
    query: { token },
  });
}

async function realRestoreByToken(token: string): Promise<void> {
  await request('/account/deletion/restore', {
    method: 'POST',
    body: { token },
  });
}

export const accountDeletionApi = {
  requestDeletion(payload: {
    userId: string;
    password: string;
  }): Promise<{ ok: true; restoreDeadlineIso: string }> {
    if (isMockApiMode) {
      return mockRequestAccountDeletion(payload);
    }

    return realRequestAccountDeletion(payload);
  },

  getRestorePreview(token: string): Promise<AccountDeletionRestorePreview> {
    if (isMockApiMode) {
      return mockGetAccountRestorePreview(token);
    }

    return realGetRestorePreview(token);
  },

  restoreByToken(token: string): Promise<void> {
    if (isMockApiMode) {
      return mockRestoreAccountByToken(token);
    }

    return realRestoreByToken(token);
  },
};
