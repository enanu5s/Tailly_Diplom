// src/features/auth/model/store.ts
type User = { id: string; email: string; name?: string };

type AuthState = {
  token: string | null;
  user: User | null;
};

const TOKEN_KEY = 'tailly_token';
const USER_KEY = 'tailly_user';

function readInitial(): AuthState {
  const token = localStorage.getItem(TOKEN_KEY);
  const userRaw = localStorage.getItem(USER_KEY);
  const user = userRaw ? (JSON.parse(userRaw) as User) : null;
  return { token, user };
}

let state: AuthState = readInitial();
const listeners = new Set<() => void>();

export const authStore = {
  getState: () => state,
  subscribe: (fn: () => void) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  setAuth: (token: string, user: User) => {
    state = { token, user };
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    listeners.forEach((l) => l());
  },
  logout: () => {
    state = { token: null, user: null };
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    listeners.forEach((l) => l());
  },
};