// src/features/messages/api/messagesApi.ts
import { HttpError, request } from '@/shared/api/http';
import { isMockApiMode } from '@/shared/config/env';
import { mockDataSourceStore } from '@/shared/lib/mock/mockDataSourceStore';

import {
  ensureClientThread as ensureClientThreadInStorage,
  ensureSpecialistThread as ensureSpecialistThreadInStorage,
  ensureSupportThread as ensureSupportThreadInStorage,
  getMessagesSnapshot as getMessagesSnapshotFromStorage,
  getUnreadSummary as getUnreadSummaryFromStorage,
  markMessagesAsRead as markMessagesAsReadInStorage,
  sendMessage as sendMessageInStorage,
} from '../data/messagesStorage';

import type {
  EnsureClientThreadPayload,
  EnsureSpecialistThreadPayload,
  EnsureSupportThreadPayload,
  MarkMessagesAsReadPayload,
  MessagesSnapshot,
  MessagesUnreadSummary,
  MessagesViewer,
  SendMessagePayload,
} from '../model/types';

/* ---------------- REAL (контракт для будущего backend; тело — те же DTO, что и в mock-слое) ---------------- */

async function realGetSnapshot(viewer: MessagesViewer): Promise<MessagesSnapshot> {
  return request<MessagesSnapshot>('/me/messages/snapshot', {
    method: 'POST',
    body: { viewer },
  });
}

async function realGetUnreadSummary(viewer: MessagesViewer): Promise<MessagesUnreadSummary> {
  return request<MessagesUnreadSummary>('/me/messages/unread-summary', {
    method: 'POST',
    body: { viewer },
  });
}

async function realEnsureSupportThread(
  payload: EnsureSupportThreadPayload,
): Promise<MessagesSnapshot> {
  return request<MessagesSnapshot>('/me/messages/threads/support', {
    method: 'POST',
    body: payload,
  });
}

async function realEnsureSpecialistThread(
  payload: EnsureSpecialistThreadPayload,
): Promise<MessagesSnapshot> {
  return request<MessagesSnapshot>('/me/messages/threads/specialist-direct', {
    method: 'POST',
    body: payload,
  });
}

async function realEnsureClientThread(
  payload: EnsureClientThreadPayload,
): Promise<MessagesSnapshot> {
  return request<MessagesSnapshot>('/me/messages/threads/client-direct', {
    method: 'POST',
    body: payload,
  });
}

async function realMarkMessagesAsRead(
  payload: MarkMessagesAsReadPayload,
): Promise<MessagesSnapshot> {
  return request<MessagesSnapshot>('/me/messages/read', {
    method: 'POST',
    body: payload,
  });
}

async function realSendMessage(payload: SendMessagePayload): Promise<MessagesSnapshot> {
  return request<MessagesSnapshot>('/me/messages/send', {
    method: 'POST',
    body: payload,
  });
}

function isEndpointMissing(error: unknown): boolean {
  return error instanceof HttpError && (error.status === 401 || error.status === 404);
}

export const messagesApi = {
  async getSnapshot(viewer: MessagesViewer): Promise<MessagesSnapshot> {
    if (isMockApiMode) {
      mockDataSourceStore.setSource('messages/chats', true);
      return Promise.resolve(getMessagesSnapshotFromStorage(viewer));
    }

    try {
      const data = await realGetSnapshot(viewer);
      mockDataSourceStore.setSource('messages/chats', false);
      return data;
    } catch (error) {
      if (isEndpointMissing(error)) {
        mockDataSourceStore.setSource('messages/chats', true);
        return Promise.resolve(getMessagesSnapshotFromStorage(viewer));
      }

      throw error;
    }
  },

  async getUnreadSummary(viewer: MessagesViewer): Promise<MessagesUnreadSummary> {
    if (isMockApiMode) {
      mockDataSourceStore.setSource('messages/unread-summary', true);
      return Promise.resolve(getUnreadSummaryFromStorage(viewer));
    }

    try {
      const data = await realGetUnreadSummary(viewer);
      mockDataSourceStore.setSource('messages/unread-summary', false);
      return data;
    } catch (error) {
      if (isEndpointMissing(error)) {
        mockDataSourceStore.setSource('messages/unread-summary', true);
        return Promise.resolve(getUnreadSummaryFromStorage(viewer));
      }

      throw error;
    }
  },

  async ensureSupportThread(
    payload: EnsureSupportThreadPayload,
  ): Promise<MessagesSnapshot> {
    if (isMockApiMode) {
      mockDataSourceStore.setSource('messages/chats', true);
      return Promise.resolve(ensureSupportThreadInStorage(payload));
    }

    try {
      const data = await realEnsureSupportThread(payload);
      mockDataSourceStore.setSource('messages/chats', false);
      return data;
    } catch (error) {
      if (isEndpointMissing(error)) {
        mockDataSourceStore.setSource('messages/chats', true);
        return Promise.resolve(ensureSupportThreadInStorage(payload));
      }

      throw error;
    }
  },

  async ensureSpecialistThread(
    payload: EnsureSpecialistThreadPayload,
  ): Promise<MessagesSnapshot> {
    if (isMockApiMode) {
      mockDataSourceStore.setSource('messages/chats', true);
      return Promise.resolve(ensureSpecialistThreadInStorage(payload));
    }

    try {
      const data = await realEnsureSpecialistThread(payload);
      mockDataSourceStore.setSource('messages/chats', false);
      return data;
    } catch (error) {
      if (isEndpointMissing(error)) {
        mockDataSourceStore.setSource('messages/chats', true);
        return Promise.resolve(ensureSpecialistThreadInStorage(payload));
      }

      throw error;
    }
  },

  async ensureClientThread(
    payload: EnsureClientThreadPayload,
  ): Promise<MessagesSnapshot> {
    if (isMockApiMode) {
      mockDataSourceStore.setSource('messages/chats', true);
      return Promise.resolve(ensureClientThreadInStorage(payload));
    }

    try {
      const data = await realEnsureClientThread(payload);
      mockDataSourceStore.setSource('messages/chats', false);
      return data;
    } catch (error) {
      if (isEndpointMissing(error)) {
        mockDataSourceStore.setSource('messages/chats', true);
        return Promise.resolve(ensureClientThreadInStorage(payload));
      }

      throw error;
    }
  },

  async markMessagesAsRead(
    payload: MarkMessagesAsReadPayload,
  ): Promise<MessagesSnapshot> {
    if (isMockApiMode) {
      mockDataSourceStore.setSource('messages/chats', true);
      return Promise.resolve(markMessagesAsReadInStorage(payload));
    }

    try {
      const data = await realMarkMessagesAsRead(payload);
      mockDataSourceStore.setSource('messages/chats', false);
      return data;
    } catch (error) {
      if (isEndpointMissing(error)) {
        mockDataSourceStore.setSource('messages/chats', true);
        return Promise.resolve(markMessagesAsReadInStorage(payload));
      }

      throw error;
    }
  },

  async sendMessage(payload: SendMessagePayload): Promise<MessagesSnapshot> {
    if (isMockApiMode) {
      mockDataSourceStore.setSource('messages/chats', true);
      return Promise.resolve(sendMessageInStorage(payload));
    }

    try {
      const data = await realSendMessage(payload);
      mockDataSourceStore.setSource('messages/chats', false);
      return data;
    } catch (error) {
      if (isEndpointMissing(error)) {
        mockDataSourceStore.setSource('messages/chats', true);
        return Promise.resolve(sendMessageInStorage(payload));
      }

      throw error;
    }
  },
};
