// src/features/admin-password-recovery-management/model/adminPasswordRecoveryManagementStore.ts
import { makeAutoObservable, runInAction } from 'mobx';

import { adminPasswordRecoveryManagementService } from '../service/adminPasswordRecoveryManagementService';

import type { AdminPasswordRecoveryRequestItem } from './types';

class AdminPasswordRecoveryManagementStore {
  requests: AdminPasswordRecoveryRequestItem[] = [];

  isLoading = false;
  loadError = '';

  processingRequestId: string | null = null;
  processError = '';

  lastProcessedRequestEmail = '';
  lastGeneratedPassword = '';

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get pendingRequests(): AdminPasswordRecoveryRequestItem[] {
    return this.requests.filter((item) => item.status === 'pending');
  }

  get processedRequests(): AdminPasswordRecoveryRequestItem[] {
    return this.requests.filter((item) => item.status === 'processed');
  }

  async load(): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.loadError = '';
    });

    try {
      const requests =
        await adminPasswordRecoveryManagementService.getRequests();

      runInAction(() => {
        this.requests = requests;
      });
    } catch (error) {
      runInAction(() => {
        this.loadError =
          error instanceof Error
            ? error.message
            : 'Не удалось загрузить заявки на восстановление пароля.';
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async processRequest(requestId: string): Promise<void> {
    runInAction(() => {
      this.processingRequestId = requestId;
      this.processError = '';
      this.lastProcessedRequestEmail = '';
      this.lastGeneratedPassword = '';
    });

    try {
      const result =
        await adminPasswordRecoveryManagementService.processRequest({
          requestId,
        });

      runInAction(() => {
        this.requests = this.requests.map((item) =>
          item.id === result.request.id ? result.request : item,
        );
        this.lastProcessedRequestEmail = result.request.email;
        this.lastGeneratedPassword = result.temporaryPassword;
      });
    } catch (error) {
      runInAction(() => {
        this.processError =
          error instanceof Error
            ? error.message
            : 'Не удалось обработать заявку.';
      });
    } finally {
      runInAction(() => {
        this.processingRequestId = null;
      });
    }
  }

  resetFeedback(): void {
    this.processError = '';
    this.lastProcessedRequestEmail = '';
    this.lastGeneratedPassword = '';
  }
}

export const adminPasswordRecoveryManagementStore =
  new AdminPasswordRecoveryManagementStore();