// src/features/admin-password-recovery-management/model/types.ts
export type AdminPasswordRecoveryRequestStatus = 'pending' | 'processed';

export type AdminPasswordRecoveryRequestItem = {
  id: string;
  email: string;
  fullName?: string;
  requestedAt: string;
  status: AdminPasswordRecoveryRequestStatus;
  processedAt?: string;
  temporaryPassword?: string;
};

export type ProcessAdminPasswordRecoveryPayload = {
  requestId: string;
};

export type GetAdminPasswordRecoveryRequestsPayload = {
  processedFrom?: string;
  processedTo?: string;
};

export type ProcessAdminPasswordRecoveryResponse = {
  request: AdminPasswordRecoveryRequestItem;
  temporaryPassword: string;
};

export class AdminPasswordRecoveryManagementError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdminPasswordRecoveryManagementError';
  }
}
