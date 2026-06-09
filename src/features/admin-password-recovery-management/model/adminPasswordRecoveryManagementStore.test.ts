import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../service/adminPasswordRecoveryManagementService', () => ({
  adminPasswordRecoveryManagementService: {
    getRequests: vi.fn(),
    processRequest: vi.fn(),
  },
}));

import { adminPasswordRecoveryManagementStore } from './adminPasswordRecoveryManagementStore';
import { adminPasswordRecoveryManagementService } from '../service/adminPasswordRecoveryManagementService';

import type { AdminPasswordRecoveryRequestItem } from './types';

const serviceMock = vi.mocked(adminPasswordRecoveryManagementService);

function createPendingRequest(): AdminPasswordRecoveryRequestItem {
  return {
    id: 'request-1',
    email: 'admin@example.com',
    fullName: 'Администратор',
    requestedAt: '2026-05-04T10:00:00.000Z',
    status: 'pending',
  };
}

describe('adminPasswordRecoveryManagementStore', () => {
  afterEach(() => {
    adminPasswordRecoveryManagementStore.requests = [];
    adminPasswordRecoveryManagementStore.processingRequestId = null;
    adminPasswordRecoveryManagementStore.processError = '';
    adminPasswordRecoveryManagementStore.lastProcessedRequestEmail = '';
    adminPasswordRecoveryManagementStore.lastGeneratedPassword = '';
    vi.clearAllMocks();
  });

  it('promotes processed request when backend returns only a temporary password', async () => {
    const pendingRequest = createPendingRequest();
    adminPasswordRecoveryManagementStore.requests = [pendingRequest];
    serviceMock.processRequest.mockResolvedValue({
      request: undefined as unknown as AdminPasswordRecoveryRequestItem,
      temporaryPassword: 'Temp-1234',
    });

    await adminPasswordRecoveryManagementStore.processRequest(pendingRequest.id);

    expect(adminPasswordRecoveryManagementStore.processError).toBe('');
    expect(adminPasswordRecoveryManagementStore.lastGeneratedPassword).toBe('Temp-1234');
    expect(adminPasswordRecoveryManagementStore.processedRequests[0]).toMatchObject({
      id: pendingRequest.id,
      email: pendingRequest.email,
      status: 'processed',
      temporaryPassword: 'Temp-1234',
    });
  });

  it('supports ASP.NET PascalCase process response', async () => {
    const pendingRequest = createPendingRequest();
    adminPasswordRecoveryManagementStore.requests = [pendingRequest];
    serviceMock.processRequest.mockResolvedValue({
      Email: 'admin@example.com',
      TemporaryPassword: 'Temp-5678',
    } as unknown as Awaited<
      ReturnType<typeof adminPasswordRecoveryManagementService.processRequest>
    >);

    await adminPasswordRecoveryManagementStore.processRequest(pendingRequest.id);

    expect(adminPasswordRecoveryManagementStore.processError).toBe('');
    expect(adminPasswordRecoveryManagementStore.lastGeneratedPassword).toBe('Temp-5678');
    expect(adminPasswordRecoveryManagementStore.processedRequests[0]).toMatchObject({
      id: pendingRequest.id,
      email: 'admin@example.com',
      status: 'processed',
      temporaryPassword: 'Temp-5678',
    });
  });

  it('supports backend responses with NewPassword field', async () => {
    const pendingRequest = createPendingRequest();
    adminPasswordRecoveryManagementStore.requests = [pendingRequest];
    serviceMock.processRequest.mockResolvedValue({
      Email: 'admin@example.com',
      NewPassword: 'Temp-9012',
    } as unknown as Awaited<
      ReturnType<typeof adminPasswordRecoveryManagementService.processRequest>
    >);

    await adminPasswordRecoveryManagementStore.processRequest(pendingRequest.id);

    expect(adminPasswordRecoveryManagementStore.lastGeneratedPassword).toBe('Temp-9012');
    expect(adminPasswordRecoveryManagementStore.processedRequests[0]).toMatchObject({
      id: pendingRequest.id,
      temporaryPassword: 'Temp-9012',
    });
  });
});
