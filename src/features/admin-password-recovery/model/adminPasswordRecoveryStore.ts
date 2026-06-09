// src/features/admin-password-recovery/model/adminPasswordRecoveryStore.ts
import { makeAutoObservable, runInAction } from 'mobx';

import { adminPasswordRecoveryService } from '../service/adminPasswordRecoveryService';

class AdminPasswordRecoveryStore {
  email = '';

  isSubmitting = false;
  submitError = '';
  isSuccess = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  setEmail(value: string): void {
    this.email = value;
  }

  get canSubmit(): boolean {
    return this.email.trim().length > 0 && !this.isSubmitting;
  }

  async submit(): Promise<void> {
    if (!this.canSubmit) return;

    runInAction(() => {
      this.isSubmitting = true;
      this.submitError = '';
      this.isSuccess = false;
    });

    try {
      await adminPasswordRecoveryService.send({
        email: this.email.trim(),
      });

      runInAction(() => {
        this.isSuccess = true;
      });
    } catch (error) {
      runInAction(() => {
        this.submitError =
          error instanceof Error ? error.message : 'Ошибка восстановления пароля';
      });
    } finally {
      runInAction(() => {
        this.isSubmitting = false;
      });
    }
  }

  reset(): void {
    this.email = '';
    this.isSubmitting = false;
    this.submitError = '';
    this.isSuccess = false;
  }
}

export const adminPasswordRecoveryStore = new AdminPasswordRecoveryStore();
