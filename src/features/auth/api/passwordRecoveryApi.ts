//src/features/auth/api/passwordRecoveryApi.ts
import { request } from '@/shared/api/http';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';

export type StartRecoveryRequest = { email: string };
export type StartRecoveryResponse = { recoveryId: string };

export type VerifyRecoveryCodeRequest = { recoveryId: string; code: string };
export type VerifyRecoveryCodeResponse = { resetToken: string };

export type ResetPasswordRequest = { resetToken: string; newPassword: string };
export type ResetPasswordResponse = { ok: true };

// ---------------- MOCK ----------------
const mockDb: {
  lastCode: string;
  recoveryId: string;
  resetToken: string;
  email: string;
} = {
  lastCode: '123456',
  recoveryId: 'rec_1',
  resetToken: 'reset_1',
  email: '',
};

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function mockStart(dto: StartRecoveryRequest): Promise<StartRecoveryResponse> {
  await delay(400);
  mockDb.email = dto.email;
  return { recoveryId: mockDb.recoveryId };
}

async function mockVerify(dto: VerifyRecoveryCodeRequest): Promise<VerifyRecoveryCodeResponse> {
  await delay(350);
  if (dto.code !== mockDb.lastCode) {
    throw new Error('Неверный код (мок). Попробуй 123456');
  }
  return { resetToken: mockDb.resetToken };
}

async function mockReset(_: ResetPasswordRequest): Promise<ResetPasswordResponse> {
  await delay(450);
  return { ok: true };
}

// --------------- REAL ---------------
// Когда появится сервер:
// POST /auth/password/forgot      -> { recoveryId }
// POST /auth/password/verify      -> { resetToken }
// POST /auth/password/reset       -> { ok: true }

export const passwordRecoveryApi = {
  start: (dto: StartRecoveryRequest) => {
    if (USE_MOCK) return mockStart(dto);
    return request<StartRecoveryResponse>('/auth/password/forgot', { method: 'POST', body: dto });
  },

  verifyCode: (dto: VerifyRecoveryCodeRequest) => {
    if (USE_MOCK) return mockVerify(dto);
    return request<VerifyRecoveryCodeResponse>('/auth/password/verify', { method: 'POST', body: dto });
  },

  resetPassword: (dto: ResetPasswordRequest) => {
    if (USE_MOCK) return mockReset(dto);
    return request<ResetPasswordResponse>('/auth/password/reset', { method: 'POST', body: dto });
  },
};