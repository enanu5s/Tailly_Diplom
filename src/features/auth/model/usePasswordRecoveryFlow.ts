//src/features/auth/model/usePasswordRecoveryFlow.ts

import { useSyncExternalStore } from 'react';

import { passwordRecoveryFlowStore } from './passwordRecoveryFlowStore';

export function usePasswordRecoveryFlow() {
  return useSyncExternalStore(passwordRecoveryFlowStore.subscribe, passwordRecoveryFlowStore.getState);
}