// src/features/admin-password-recovery-management/model/adminPasswordRecoveryManagementStore.ts
import { makeAutoObservable, runInAction } from 'mobx';

import { adminPasswordRecoveryManagementService } from '../service/adminPasswordRecoveryManagementService';

import type { AdminPasswordRecoveryRequestItem } from './types';

type ProcessRequestRuntimeResponse = {
  [key: string]: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readStringField(source: unknown, fieldNames: string[]): string | undefined {
  if (!isRecord(source)) {
    return undefined;
  }

  for (const fieldName of fieldNames) {
    const value = source[fieldName];

    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return undefined;
}

function readRecordField(
  source: unknown,
  fieldNames: string[],
): Record<string, unknown> | undefined {
  if (!isRecord(source)) {
    return undefined;
  }

  for (const fieldName of fieldNames) {
    const value = source[fieldName];

    if (isRecord(value)) {
      return value;
    }
  }

  return undefined;
}

function extractTemporaryPassword(source: unknown): string {
  if (typeof source === 'string') {
    return source.trim();
  }

  const direct = readStringField(source, [
    'temporaryPassword',
    'TemporaryPassword',
    'tempPassword',
    'TempPassword',
    'generatedPassword',
    'GeneratedPassword',
    'newPassword',
    'NewPassword',
    'password',
    'Password',
  ]);

  if (direct) {
    return direct;
  }

  const nested = readRecordField(source, [
    'request',
    'Request',
    'value',
    'Value',
    'result',
    'Result',
  ]);

  return nested ? extractTemporaryPassword(nested) : '';
}

function normalizeProcessedRequest(
  source: unknown,
  fallback: AdminPasswordRecoveryRequestItem | undefined,
  temporaryPassword: string,
): AdminPasswordRecoveryRequestItem | null {
  const record = isRecord(source) ? source : undefined;
  const nested = readRecordField(record, [
    'request',
    'Request',
    'value',
    'Value',
    'result',
    'Result',
  ]);
  const requestSource = nested ?? record;

  if (!fallback && !requestSource) {
    return null;
  }

  const id = readStringField(requestSource, ['id', 'Id']) ?? fallback?.id;
  const email =
    readStringField(requestSource, ['email', 'Email']) ??
    readStringField(record, ['email', 'Email']) ??
    fallback?.email;

  if (!id || !email) {
    return null;
  }

  return {
    id,
    email,
    fullName:
      readStringField(requestSource, ['fullName', 'FullName', 'name', 'Name']) ??
      fallback?.fullName,
    requestedAt:
      readStringField(requestSource, ['requestedAt', 'RequestedAt']) ??
      fallback?.requestedAt ??
      new Date().toISOString(),
    status: 'processed',
    processedAt:
      readStringField(requestSource, ['processedAt', 'ProcessedAt']) ??
      new Date().toISOString(),
    temporaryPassword:
      temporaryPassword ||
      readStringField(requestSource, ['temporaryPassword', 'TemporaryPassword']),
  };
}

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
      const runtimeResult =
        typeof result === 'string'
          ? ({ temporaryPassword: result } satisfies ProcessRequestRuntimeResponse)
          : (result as ProcessRequestRuntimeResponse);
      const temporaryPassword = extractTemporaryPassword(runtimeResult);
      const processedRequest = normalizeProcessedRequest(
        runtimeResult,
        currentRequest,
        temporaryPassword,
      );

      if (!processedRequest) {
        throw new Error('Бэк обработал заявку, но не вернул данные заявки.');
      }

      runInAction(() => {
        this.requests = this.requests.map((item) =>
          item.id === processedRequest.id ? processedRequest : item,
        );
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
    this.clearSuccessMessage();
  }

  clearSuccessMessage(): void {
    this.lastProcessedRequestEmail = '';
    this.lastGeneratedPassword = '';
  }
}

export const adminPasswordRecoveryManagementStore =
  new AdminPasswordRecoveryManagementStore();
