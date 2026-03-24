//src/features/profileSecurity/emailChangeFlow/model/types.ts

export type EmailChangeFlowState = {
  step: 'request' | 'confirm' | 'done';
  requestId: string | null;
  maskedOldEmail: string | null;
};
