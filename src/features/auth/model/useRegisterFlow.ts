import { useSyncExternalStore } from 'react';
import { registerFlowStore } from './registerFlowStore';

export function useRegisterFlow() {
  return useSyncExternalStore(registerFlowStore.subscribe, registerFlowStore.getState);
}