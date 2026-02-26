//src/features/profileSecurity/api/securityApi.ts
const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error((await res.text().catch(() => '')) || `HTTP ${res.status}`);
  return (await res.json()) as T;
}

/* ---------------- MOCK ---------------- */

let MOCK_OLD_EMAIL = 'ivan.petrov@mail.ru';

function maskEmail(email: string) {
  const [name, domain] = email.split('@');
  if (!domain) return '***';
  const n = name.length <= 2 ? `${name[0] ?? '*'}*` : `${name.slice(0, 2)}***`;
  return `${n}@${domain}`;
}

async function mockRequestEmailChangeCode(): Promise<{ requestId: string; maskedOldEmail: string }> {
  return {
    requestId: `req-${Math.random().toString(16).slice(2)}`,
    maskedOldEmail: maskEmail(MOCK_OLD_EMAIL),
  };
}

async function mockConfirmEmailChange(payload: { requestId: string; code: string; newEmail: string }): Promise<{ ok: true }> {
  // имитация проверки кода
  if (payload.code.trim().length < 4) throw new Error('Неверный код подтверждения');
  if (!payload.newEmail.includes('@')) throw new Error('Некорректная почта');
  MOCK_OLD_EMAIL = payload.newEmail.trim();
  return { ok: true };
}

async function mockChangePassword(payload: { oldPassword: string; newPassword: string }): Promise<{ ok: true }> {
  // имитация: "старый пароль" должен быть не пустой
  if (!payload.oldPassword.trim()) throw new Error('Введите текущий пароль');
  if (payload.newPassword.trim().length < 8) throw new Error('Новый пароль должен быть не короче 8 символов');
  return { ok: true };
}

/* ---------------- REAL ---------------- */

async function realRequestEmailChangeCode(): Promise<{ requestId: string; maskedOldEmail: string }> {
  return fetchJson(`${API_BASE_URL}/me/security/email/change/request`, { method: 'POST' });
}

async function realConfirmEmailChange(payload: { requestId: string; code: string; newEmail: string }): Promise<{ ok: true }> {
  return fetchJson(`${API_BASE_URL}/me/security/email/change/confirm`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

async function realChangePassword(payload: { oldPassword: string; newPassword: string }): Promise<{ ok: true }> {
  return fetchJson(`${API_BASE_URL}/me/security/password/change`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/* ---------------- EXPORT ---------------- */

export const securityApi = {
  requestEmailChangeCode: () => (USE_MOCK ? mockRequestEmailChangeCode() : realRequestEmailChangeCode()),
  confirmEmailChange: (payload: { requestId: string; code: string; newEmail: string }) =>
    (USE_MOCK ? mockConfirmEmailChange(payload) : realConfirmEmailChange(payload)),
  changePassword: (payload: { oldPassword: string; newPassword: string }) =>
    (USE_MOCK ? mockChangePassword(payload) : realChangePassword(payload)),
};