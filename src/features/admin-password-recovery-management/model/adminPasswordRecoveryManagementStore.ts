// src/features/admin-password-recovery-management/model/adminPasswordRecoveryManagementStore.ts
import { makeAutoObservable, runInAction } from 'mobx';

import { adminPasswordRecoveryManagementService } from '../service/adminPasswordRecoveryManagementService';

import type { AdminPasswordRecoveryRequestItem } from './types';

type PendingProcessedPromotion = {
  request: AdminPasswordRecoveryRequestItem;
  timeoutId: number;
};

type ProcessRequestRuntimeResponse = {
  request?: AdminPasswordRecoveryRequestItem;
  temporaryPassword?: string;
};

function getLastWorkWeekRange(): { processedFrom: string; processedTo: string } {
  const now = new Date();
  const day = now.getDay(); // 0..6, 1 - Monday
  const diffToMonday = day === 0 ? 6 : day - 1;
  const thisMonday = new Date(now);
  thisMonday.setDate(now.getDate() - diffToMonday);
  thisMonday.setHours(0, 0, 0, 0);

  const lastMonday = new Date(thisMonday);
  lastMonday.setDate(thisMonday.getDate() - 7);

  const lastFriday = new Date(lastMonday);
  lastFriday.setDate(lastMonday.getDate() + 4);
  lastFriday.setHours(23, 59, 59, 999);

  return {
    processedFrom: lastMonday.toISOString(),
    processedTo: lastFriday.toISOString(),
  };
}

class AdminPasswordRecoveryManagementStore {
  requests: AdminPasswordRecoveryRequestItem[] = [];

  isLoading = false;
  loadError = '';

  processingRequestId: string | null = null;
  processError = '';

  lastProcessedRequestEmail = '';
  lastGeneratedPassword = '';
  pendingProcessedPromotion: PendingProcessedPromotion | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get pendingRequests(): AdminPasswordRecoveryRequestItem[] {
    return this.requests.filter((item) => item.status === 'pending');
  }

  get processedRequests(): AdminPasswordRecoveryRequestItem[] {
    return this.requests.filter((item) => {
      if (item.status !== 'processed') {
        return false;
      }

      return item.id !== this.pendingProcessedPromotion?.request.id;
    });
  }

  async load(): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.loadError = '';
    });

    try {
      const requests = await adminPasswordRecoveryManagementService.getRequests(
        getLastWorkWeekRange(),
      );

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
    const currentRequest = this.requests.find((item) => item.id === requestId);

    runInAction(() => {
      this.processingRequestId = requestId;
      this.processError = '';
      this.lastProcessedRequestEmail = '';
      this.lastGeneratedPassword = '';
    });

    try {
      const result = await adminPasswordRecoveryManagementService.processRequest({
        requestId,
      });
      const runtimeResult = result as ProcessRequestRuntimeResponse;
      const temporaryPassword =
        runtimeResult.temporaryPassword ?? runtimeResult.request?.temporaryPassword ?? '';
      const processedRequest =
        runtimeResult.request ??
        (currentRequest
          ? {
              ...currentRequest,
              status: 'processed' as const,
              processedAt: new Date().toISOString(),
              temporaryPassword,
            }
          : null);

      if (!processedRequest) {
        throw new Error('Бэк обработал заявку, но не вернул данные заявки.');
      }

      runInAction(() => {
        if (this.pendingProcessedPromotion) {
          window.clearTimeout(this.pendingProcessedPromotion.timeoutId);
        }

        const timeoutId = window.setTimeout(() => {
          this.commitProcessedPromotion();
        }, 7000);

        this.pendingProcessedPromotion = {
          request: processedRequest,
          timeoutId,
        };
        this.lastProcessedRequestEmail = processedRequest.email;
        this.lastGeneratedPassword = temporaryPassword;
      });
    } catch (error) {
      runInAction(() => {
        this.processError =
          error instanceof Error ? error.message : 'Не удалось обработать заявку.';
      });
    } finally {
      runInAction(() => {
        this.processingRequestId = null;
      });
    }
  }

  resetFeedback(): void {
    this.processError = '';
    this.commitProcessedPromotion();
  }

  clearSuccessMessage(): void {
    this.commitProcessedPromotion();
  }

  private commitProcessedPromotion(): void {
    if (this.pendingProcessedPromotion) {
      window.clearTimeout(this.pendingProcessedPromotion.timeoutId);
      this.requests = this.requests.map((item) =>
        item.id === this.pendingProcessedPromotion?.request.id
          ? this.pendingProcessedPromotion.request
          : item,
      );
      this.pendingProcessedPromotion = null;
    }

    this.lastProcessedRequestEmail = '';
    this.lastGeneratedPassword = '';
  }
}

export const adminPasswordRecoveryManagementStore =
  new AdminPasswordRecoveryManagementStore();
