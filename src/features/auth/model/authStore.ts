// src/features/auth/model/authStore.ts

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
};

const TOKEN_KEY = 'tailly_token';
const USER_KEY = 'tailly_user';

function buildDisplayName(user: Pick<AuthUser, 'name' | 'firstName' | 'lastName'>): string | undefined {
  if (user.name?.trim()) {
    return user.name.trim();
  }

  const fullName = [user.firstName?.trim(), user.lastName?.trim()].filter(Boolean).join(' ').trim();

  return fullName || undefined;
}

function normalizeUser(user: AuthUser): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: buildDisplayName(user),
    firstName: user.firstName?.trim() || undefined,
    lastName: user.lastName?.trim() || undefined,
    phone: user.phone?.trim() || undefined,
  };
}

function readUser(): AuthUser | null {
  const userRaw = localStorage.getItem(USER_KEY);

  if (!userRaw) {
    return null;
  }

  try {
    const parsed = JSON.parse(userRaw) as Partial<AuthUser>;

    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    if (typeof parsed.id !== 'string' || typeof parsed.email !== 'string') {
      return null;
    }

    return normalizeUser({
      id: parsed.id,
      email: parsed.email,
      name: typeof parsed.name === 'string' ? parsed.name : undefined,
      firstName: typeof parsed.firstName === 'string' ? parsed.firstName : undefined,
      lastName: typeof parsed.lastName === 'string' ? parsed.lastName : undefined,
      phone: typeof parsed.phone === 'string' ? parsed.phone : undefined,
    });
  } catch {
    localStorage.removeItem(USER_KEY);

    return null;
  }
}

function readInitial(): AuthState {
  const token = localStorage.getItem(TOKEN_KEY);

  return {
    token,
    user: readUser(),
  };
}

let state: AuthState = readInitial();
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

export const authStore = {
  getState: (): AuthState => state,

  subscribe: (fn: () => void) => {
    listeners.add(fn);

    return () => listeners.delete(fn);
  },

  setAuth: (token: string, user: AuthUser) => {
    const normalizedUser = normalizeUser(user);

    state = {
      token,
      user: normalizedUser,
    };

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));

    emit();
  },

  updateUser: (patch: Partial<AuthUser>) => {
    if (!state.user) {
      return;
    }

    const nextUser = normalizeUser({
      ...state.user,
      ...patch,
      id: patch.id ?? state.user.id,
      email: patch.email ?? state.user.email,
    });

    state = {
      ...state,
      user: nextUser,
    };

    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));

    emit();
  },

  logout: () => {
    state = {
      token: null,
      user: null,
    };

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    emit();
  },
};