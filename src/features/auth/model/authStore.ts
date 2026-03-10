// src/features/auth/model/authStore.ts

export type AuthRole =
  | 'guest'
  | 'client'
  | 'specialist'
  | 'admin'
  | 'super_admin';

export type AuthenticatedAuthRole = Exclude<AuthRole, 'guest'>;

export type AuthUser = {
  id: string;
  email: string;
  role: AuthenticatedAuthRole;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  specialistId?: string;
  specialistSlug?: string;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
};

const TOKEN_KEY = 'tailly_token';
const USER_KEY = 'tailly_user';

function normalizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
}

function isStoredRole(value: unknown): value is AuthenticatedAuthRole {
  return (
    value === 'client' ||
    value === 'specialist' ||
    value === 'admin' ||
    value === 'super_admin'
  );
}

function buildDisplayName(
  user: Pick<AuthUser, 'name' | 'firstName' | 'lastName'>,
): string | undefined {
  const explicitName = normalizeOptionalString(user.name);

  if (explicitName) {
    return explicitName;
  }

  const firstName = normalizeOptionalString(user.firstName);
  const lastName = normalizeOptionalString(user.lastName);
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();

  return fullName.length > 0 ? fullName : undefined;
}

function normalizeUser(user: AuthUser): AuthUser {
  return {
    id: user.id,
    email: user.email.trim().toLowerCase(),
    role: user.role,
    name: buildDisplayName(user),
    firstName: normalizeOptionalString(user.firstName),
    lastName: normalizeOptionalString(user.lastName),
    phone: normalizeOptionalString(user.phone),
    specialistId: normalizeOptionalString(user.specialistId),
    specialistSlug: normalizeOptionalString(user.specialistSlug),
  };
}

function parseStoredUser(raw: string | null): AuthUser | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AuthUser>;

    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    if (typeof parsed.id !== 'string' || typeof parsed.email !== 'string') {
      return null;
    }

    const role: AuthenticatedAuthRole = isStoredRole(parsed.role)
      ? parsed.role
      : 'client';

    return normalizeUser({
      id: parsed.id,
      email: parsed.email,
      role,
      name: parsed.name,
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      phone: parsed.phone,
      specialistId: parsed.specialistId,
      specialistSlug: parsed.specialistSlug,
    });
  } catch {
    localStorage.removeItem(USER_KEY);

    return null;
  }
}

function readInitial(): AuthState {
  const token = localStorage.getItem(TOKEN_KEY);
  const user = parseStoredUser(localStorage.getItem(USER_KEY));

  if (!token || !user) {
    return {
      token: null,
      user: null,
    };
  }

  return {
    token,
    user,
  };
}

let state: AuthState = readInitial();
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

export const authStore = {
  getState(): AuthState {
    return state;
  },

  subscribe(fn: () => void): () => void {
    listeners.add(fn);

    return () => listeners.delete(fn);
  },

  setAuth(token: string, user: AuthUser): void {
    const normalizedUser = normalizeUser(user);

    state = {
      token,
      user: normalizedUser,
    };

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));

    emit();
  },

  updateUser(patch: Partial<AuthUser>): void {
    if (!state.user) {
      return;
    }

    const nextUser = normalizeUser({
      ...state.user,
      ...patch,
      id: patch.id ?? state.user.id,
      email: patch.email ?? state.user.email,
      role: patch.role ?? state.user.role,
    });

    state = {
      ...state,
      user: nextUser,
    };

    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));

    emit();
  },
  logout(): void {
    state = {
      token: null,
      user: null,
    };

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    emit();
  },

  getRole(): AuthRole {
    if (!state.token || !state.user) {
      return 'guest';
    }

    return state.user.role;
  },

  isAuthenticated(): boolean {
    return Boolean(state.token && state.user);
  },

  hasRole(role: AuthRole): boolean {
    return this.getRole() === role;
  },

  hasAnyRole(roles: AuthRole[]): boolean {
    return roles.includes(this.getRole());
  },
};