// src/features/admin-password-recovery/model/types.ts
export type AdminPasswordRecoveryRequest = {
  email: string;
};

export type AdminPasswordRecoveryResponse = {
  success: true;
};

export class AdminPasswordRecoveryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdminPasswordRecoveryError';
  }
}