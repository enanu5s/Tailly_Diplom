// src/features/account-deletion/service/accountDeletionService.ts

import { accountDeletionApi } from '../api/accountDeletionApi';

import type { AccountDeletionRestorePreview } from '../model/types';

export const accountDeletionService = {
  requestDeletion(payload: {
    userId: string;
    password: string;
  }): Promise<{ ok: true; restoreDeadlineIso: string }> {
    return accountDeletionApi.requestDeletion(payload);
  },

  getRestorePreview(token: string): Promise<AccountDeletionRestorePreview> {
    return accountDeletionApi.getRestorePreview(token);
  },

  restoreByToken(token: string): Promise<void> {
    return accountDeletionApi.restoreByToken(token);
  },
};
