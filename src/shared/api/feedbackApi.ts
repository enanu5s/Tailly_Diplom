// src/shared/api/feedbackApi.ts
import { request } from '@/shared/api/http';
import { isMockApiMode } from '@/shared/config/env';

export type FeedbackRequest = {
  name: string;
  email: string;
  message: string;
};

export type FeedbackResponse = { ok: true };

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function mockSend(): Promise<FeedbackResponse> {
  await delay(600);
  return { ok: true };
}

// Когда будет сервер:
// POST /support/feedback -> { ok: true }
export const feedbackApi = {
  send: (dto: FeedbackRequest) => {
    if (isMockApiMode) return mockSend();
    return request<FeedbackResponse>('/support/feedback', { method: 'POST', body: dto });
  },
};
