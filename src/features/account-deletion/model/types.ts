// src/features/account-deletion/model/types.ts

export type AccountDeletionRestorePreview = {
  email: string;
  roleLabel: string;
  displayName: string;
  restoreDeadlineIso: string;
};

export class AccountDeletionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AccountDeletionError';
  }
}
