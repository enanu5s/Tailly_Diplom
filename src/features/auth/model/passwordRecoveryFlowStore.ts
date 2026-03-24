// /src/features/auth/model/passwordRecoveryFlowStore.ts
export type RecoveryFlowState = {
  email: string;
  code: string;
  isStarted: boolean;
  isVerified: boolean;
};

type Listener = () => void;

const listeners = new Set<Listener>();

let state: RecoveryFlowState = {
  email: '',
  code: '',
  isStarted: false,
  isVerified: false,
};

function notify(): void {
  listeners.forEach((listener) => listener());
}

export const passwordRecoveryFlowStore = {
  getState(): RecoveryFlowState {
    return state;
  },

  subscribe(fn: Listener): () => boolean {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  setStart(email: string): void {
    state = {
      email: email.trim(),
      code: '',
      isStarted: true,
      isVerified: false,
    };
    notify();
  },

  setVerified(code: string): void {
    state = {
      ...state,
      code: code.trim(),
      isVerified: true,
    };
    notify();
  },

  complete(): void {
    state = {
      ...state,
      isVerified: true,
    };
    notify();
  },

  reset(): void {
    state = {
      email: '',
      code: '',
      isStarted: false,
      isVerified: false,
    };
    notify();
  },
};
