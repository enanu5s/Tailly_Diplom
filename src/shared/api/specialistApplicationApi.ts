//src/shared/api/specialistApplicationApi.ts

import { request } from '@/shared/api/http';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';

export type SpecialistApplicationRequest = {
  name: string;
  email: string;
  phone: string;
  city: string;
  about: string;
};

export type SpecialistApplicationResponse = { ok: true };

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function mockSend(_: SpecialistApplicationRequest): Promise<SpecialistApplicationResponse> {
  await delay(700);
  return { ok: true };
}

// Когда будет сервер:
// POST /specialists/apply -> { ok: true }
export const specialistApplicationApi = {
  send: (dto: SpecialistApplicationRequest) => {
    if (USE_MOCK) return mockSend(dto);
    return request<SpecialistApplicationResponse>('/specialists/apply', { method: 'POST', body: dto });
  },
};