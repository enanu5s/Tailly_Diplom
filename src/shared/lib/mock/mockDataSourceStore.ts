type MockSourceState = Record<string, boolean>;

let state: MockSourceState = {};
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

export const mockDataSourceStore = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getState(): MockSourceState {
    return state;
  },

  setSource(source: string, isMock: boolean): void {
    const normalized = source.trim();

    if (!normalized) {
      return;
    }

    if (state[normalized] === isMock) {
      return;
    }

    state = {
      ...state,
      [normalized]: isMock,
    };

    emit();
  },

  clear(): void {
    if (Object.keys(state).length === 0) {
      return;
    }

    state = {};
    emit();
  },
};
