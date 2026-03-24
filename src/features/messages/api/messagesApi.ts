// src/features/messages/api/messagesApi.ts
import { getOptionalApiBaseUrl, isMockApiMode } from '@/shared/config/env';

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

const API_BASE_URL = getOptionalApiBaseUrl();

async function notImplemented(): Promise<never> {
  throw new Error(
    `Messages real API is not implemented yet. API_BASE_URL="${API_BASE_URL}"`,
  );
}

export const messagesApi = {
  async getSnapshot(viewer: MessagesViewer): Promise<MessagesSnapshot> {
    if (isMockApiMode) {
      return Promise.resolve(getMessagesSnapshotFromStorage(viewer));
    }

    return notImplemented();
  },

  async getUnreadSummary(viewer: MessagesViewer): Promise<MessagesUnreadSummary> {
    if (isMockApiMode) {
      return Promise.resolve(getUnreadSummaryFromStorage(viewer));
    }

    return notImplemented();
  },

  async ensureSupportThread(
    payload: EnsureSupportThreadPayload,
  ): Promise<MessagesSnapshot> {
    if (isMockApiMode) {
      return Promise.resolve(ensureSupportThreadInStorage(payload));
    }

    return notImplemented();
  },

  async ensureSpecialistThread(
    payload: EnsureSpecialistThreadPayload,
  ): Promise<MessagesSnapshot> {
    if (isMockApiMode) {
      return Promise.resolve(ensureSpecialistThreadInStorage(payload));
    }

    return notImplemented();
  },

  async ensureClientThread(
    payload: EnsureClientThreadPayload,
  ): Promise<MessagesSnapshot> {
    if (isMockApiMode) {
      return Promise.resolve(ensureClientThreadInStorage(payload));
    }

    return notImplemented();
  },

  async markMessagesAsRead(
    payload: MarkMessagesAsReadPayload,
  ): Promise<MessagesSnapshot> {
    if (isMockApiMode) {
      return Promise.resolve(markMessagesAsReadInStorage(payload));
    }

    return notImplemented();
  },

  async sendMessage(payload: SendMessagePayload): Promise<MessagesSnapshot> {
    if (isMockApiMode) {
      return Promise.resolve(sendMessageInStorage(payload));
    }

    return notImplemented();
  },
};
