//src/features/profile/api/profileApi.ts
import type { UserProfile } from '../model/types';

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

/* MOCK */
let MOCK_PROFILE: UserProfile = {
  id: 'u-1',
  firstName: 'Иван',
  lastName: 'Петров',
  city: 'Москва',
  phone: '+7 (999) 123-45-67',
  email: 'ivan.petrov@mail.ru',
  avatarUrl: '/images/profile-avatar.png',
};

async function mockGetProfile(): Promise<UserProfile> {
  return structuredClone(MOCK_PROFILE);
}

async function mockUpdateContacts(payload: Pick<UserProfile, 'city' | 'phone'>): Promise<UserProfile> {
  MOCK_PROFILE = { ...MOCK_PROFILE, ...payload };
  return structuredClone(MOCK_PROFILE);
}

async function mockUpdateMain(
  payload: Pick<UserProfile, 'firstName' | 'lastName' | 'avatarUrl'>,
): Promise<UserProfile> {
  MOCK_PROFILE = { ...MOCK_PROFILE, ...payload };
  return JSON.parse(JSON.stringify(MOCK_PROFILE)) as UserProfile; // вместо structuredClone
}

async function realUpdateMain(
  payload: Pick<UserProfile, 'firstName' | 'lastName' | 'avatarUrl'>,
): Promise<UserProfile> {
  return fetchJson<UserProfile>(`${API_BASE_URL}/me/profile/main`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

/* REAL */
async function realGetProfile(): Promise<UserProfile> {
  return fetchJson<UserProfile>(`${API_BASE_URL}/me/profile`);
}

async function realUpdateContacts(payload: Pick<UserProfile, 'city' | 'phone'>): Promise<UserProfile> {
  return fetchJson<UserProfile>(`${API_BASE_URL}/me/profile/contacts`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export const profileApi = {
  getProfile: () => (USE_MOCK ? mockGetProfile() : realGetProfile()),
  updateContacts: (payload: Pick<UserProfile, 'city' | 'phone'>) =>
    (USE_MOCK ? mockUpdateContacts(payload) : realUpdateContacts(payload)),
  updateMain: (payload: Pick<UserProfile, 'firstName' | 'lastName' | 'avatarUrl'>) =>
    (USE_MOCK ? mockUpdateMain(payload) : realUpdateMain(payload)),
};