// src/features/auth/model/registerFlowStore.ts
type RegisterFlowState = {
  email: string | null;
  registrationId: string | null;
  verificationToken: string | null;
};

const KEY = 'tailly_register_flow';

function readInitial(): RegisterFlowState {
  const raw = localStorage.getItem(KEY);
  if (!raw) return { email: null, registrationId: null, verificationToken: null };
  try {
    return JSON.parse(raw) as RegisterFlowState;
  } catch {
    return { email: null, registrationId: null, verificationToken: null };
  }
}

let state: RegisterFlowState = readInitial();
const listeners = new Set<() => void>();

function commit(next: RegisterFlowState) {
  state = next;
  localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

export const registerFlowStore = {
  getState: () => state,
  subscribe: (fn: () => void) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  setStart: (email: string, registrationId: string) => {
    commit({ email, registrationId, verificationToken: null });
  },

  setVerified: (verificationToken: string) => {
    commit({ ...state, verificationToken });
  },

  reset: () => {
    commit({ email: null, registrationId: null, verificationToken: null });
  },
};
