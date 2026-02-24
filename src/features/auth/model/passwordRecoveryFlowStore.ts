//src/features/auth/model/passwordRecoveryFlowStore.ts

type RecoveryFlowState = {
  email: string | null;
  recoveryId: string | null;
  resetToken: string | null;
};

const KEY = 'tailly_password_recovery_flow';

function readInitial(): RecoveryFlowState {
  const raw = localStorage.getItem(KEY);
  if (!raw) return { email: null, recoveryId: null, resetToken: null };
  try {
    return JSON.parse(raw) as RecoveryFlowState;
  } catch {
    return { email: null, recoveryId: null, resetToken: null };
  }
}

let state: RecoveryFlowState = readInitial();
const listeners = new Set<() => void>();

function commit(next: RecoveryFlowState) {
  state = next;
  localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

export const passwordRecoveryFlowStore = {
  getState: () => state,
  subscribe: (fn: () => void) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  setStart: (email: string, recoveryId: string) => {
    commit({ email, recoveryId, resetToken: null });
  },

  setVerified: (resetToken: string) => {
    commit({ ...state, resetToken });
  },

  reset: () => {
    commit({ email: null, recoveryId: null, resetToken: null });
  },
};