// src/features/messages/api/messagesApi.ts
import { request } from '@/shared/api/http';
import { isMockApiMode } from '@/shared/config/env';

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

export const messagesApi = {
  async getSnapshot(viewer: MessagesViewer): Promise<MessagesSnapshot> {
    if (isMockApiMode) {
      return Promise.resolve(getMessagesSnapshotFromStorage(viewer));
    }

    return realGetSnapshot(viewer);
  },

  async getUnreadSummary(viewer: MessagesViewer): Promise<MessagesUnreadSummary> {
    if (isMockApiMode) {
      return Promise.resolve(getUnreadSummaryFromStorage(viewer));
    }

    return realGetUnreadSummary(viewer);
  },

  async ensureSupportThread(
    payload: EnsureSupportThreadPayload,
  ): Promise<MessagesSnapshot> {
    if (isMockApiMode) {
      return Promise.resolve(ensureSupportThreadInStorage(payload));
    }

    return realEnsureSupportThread(payload);
  },

  async ensureSpecialistThread(
    payload: EnsureSpecialistThreadPayload,
  ): Promise<MessagesSnapshot> {
    if (isMockApiMode) {
      return Promise.resolve(ensureSpecialistThreadInStorage(payload));
    }

    return realEnsureSpecialistThread(payload);
  },

  async ensureClientThread(
    payload: EnsureClientThreadPayload,
  ): Promise<MessagesSnapshot> {
    if (isMockApiMode) {
      return Promise.resolve(ensureClientThreadInStorage(payload));
    }

    return realEnsureClientThread(payload);
  },

  async markMessagesAsRead(
    payload: MarkMessagesAsReadPayload,
  ): Promise<MessagesSnapshot> {
    if (isMockApiMode) {
      return Promise.resolve(markMessagesAsReadInStorage(payload));
    }

    return realMarkMessagesAsRead(payload);
  },

  async sendMessage(payload: SendMessagePayload): Promise<MessagesSnapshot> {
    if (isMockApiMode) {
      return Promise.resolve(sendMessageInStorage(payload));
    }

    return realSendMessage(payload);
  },
};
