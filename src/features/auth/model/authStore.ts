// src/features/auth/model/authStore.ts

import { ordersStore } from '@/features/orders/model/ordersStore';
import { shopFavoritesStore } from '@/features/shop/model/shopFavoritesStore';
import { clearLastRoute } from '@/shared/lib/navigation/persistedLastRoute';

export type UserRole = 'guest' | 'client' | 'specialist' | 'admin' | 'super_admin';

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  phone?: string;
  specialistId?: string;
  specialistSlug?: string;
  adminId?: string;
  isBlocked?: boolean;
};

type AuthState = {
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
};

const TOKEN_KEY = 'tailly_token';
const REFRESH_TOKEN_KEY = 'tailly_refresh_token';
const USER_KEY = 'tailly_user';

function normalizeRole(role?: string): UserRole {
  if (
    role === 'client' ||
    role === 'specialist' ||
    role === 'admin' ||
    role === 'super_admin'
  ) {
    return role;
  }

  return 'guest';
}

function buildDisplayName(user: Partial<AuthUser>): string | undefined {
  if (typeof user.name === 'string' && user.name.trim()) {
    return user.name.trim();
  }

  const value = [
    typeof user.lastName === 'string' ? user.lastName.trim() : '',
    typeof user.firstName === 'string' ? user.firstName.trim() : '',
    typeof user.middleName === 'string' ? user.middleName.trim() : '',
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  return value || undefined;
}

function normalizeUser(user: Partial<AuthUser>): AuthUser | null {
  if (typeof user.id !== 'string' || typeof user.email !== 'string') {
    return null;
  }

  return {
    id: user.id,
    email: user.email.trim(),
    role: normalizeRole(user.role),
    name: buildDisplayName(user),
    firstName:
      typeof user.firstName === 'string' ? user.firstName.trim() || undefined : undefined,
    lastName:
      typeof user.lastName === 'string' ? user.lastName.trim() || undefined : undefined,
    middleName:
      typeof user.middleName === 'string'
        ? user.middleName.trim() || undefined
        : undefined,
    phone: typeof user.phone === 'string' ? user.phone.trim() || undefined : undefined,
    specialistId:
      typeof user.specialistId === 'string'
        ? user.specialistId.trim() || undefined
        : undefined,
    specialistSlug:
      typeof user.specialistSlug === 'string'
        ? user.specialistSlug.trim() || undefined
        : undefined,
    adminId:
      typeof user.adminId === 'string' ? user.adminId.trim() || undefined : undefined,
    isBlocked: Boolean(user.isBlocked),
  };
}

function readUserFromStorage(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AuthUser>;
    const normalizedUser = normalizeUser(parsed);

    if (!normalizedUser) {
      localStorage.removeItem(USER_KEY);
      return null;
    }

    return normalizedUser;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

function readInitialState(): AuthState {
  return {
    token: localStorage.getItem(TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
    user: readUserFromStorage(),
  };
}

let state: AuthState = readInitialState();
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

export const authStore = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  },

  getState(): AuthState {
    return state;
  },

  getToken(): string | null {
    return state.token;
  },

  getRefreshToken(): string | null {
    return state.refreshToken;
  },

  setAuth(params: {
    token: string;
    refreshToken?: string | null;
    user?: AuthUser | null;
  }): void {
    const normalizedUser = params.user ? normalizeUser(params.user) : null;

    state = {
      token: params.token,
      refreshToken: params.refreshToken ?? null,
      user: normalizedUser,
    };

    localStorage.setItem(TOKEN_KEY, params.token);

    if (params.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, params.refreshToken);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }

    if (normalizedUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
    } else {
      localStorage.removeItem(USER_KEY);
    }

    emit();
  },

  updateUser(patch: Partial<AuthUser>): void {
    if (!state.user) {
      return;
    }

    const nextUser = normalizeUser({
      ...state.user,
      ...patch,
    });

    if (!nextUser) {
      return;
    }

    state = {
      ...state,
      user: nextUser,
    };

    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    emit();
  },

  setUser(user: AuthUser): void {
    const normalizedUser = normalizeUser(user);

    if (!normalizedUser) {
      return;
    }

    state = {
      ...state,
      user: normalizedUser,
    };

    localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
    emit();
  },

  logout(): void {
    ordersStore.resetSessionProductOrders();
    shopFavoritesStore.clear();

    state = {
      token: null,
      refreshToken: null,
      user: null,
    };

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    sessionStorage.setItem('tailly_logged_out', '1');

    clearLastRoute();

    emit();
  },
};