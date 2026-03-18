// src/features/messages/service/messagesService.ts
import { messagesApi } from '../api/messagesApi';

import type {
  EnsureSpecialistThreadPayload,
  EnsureSupportThreadPayload,
  MarkMessagesAsReadPayload,
  MessagesSnapshot,
  MessagesUnreadSummary,
  MessagesViewer,
  SendMessagePayload,
} from '../model/types';

class MessagesService {
  getSnapshot(viewer: MessagesViewer): Promise<MessagesSnapshot> {
    return messagesApi.getSnapshot(viewer);
  }

  getUnreadSummary(viewer: MessagesViewer): Promise<MessagesUnreadSummary> {
    return messagesApi.getUnreadSummary(viewer);
  }

  ensureSupportThread(
    payload: EnsureSupportThreadPayload,
  ): Promise<MessagesSnapshot> {
    return messagesApi.ensureSupportThread(payload);
  }

  ensureSpecialistThread(
    payload: EnsureSpecialistThreadPayload,
  ): Promise<MessagesSnapshot> {
    return messagesApi.ensureSpecialistThread(payload);
  }

  markMessagesAsRead(
    payload: MarkMessagesAsReadPayload,
  ): Promise<MessagesSnapshot> {
    return messagesApi.markMessagesAsRead(payload);
  }

  sendMessage(payload: SendMessagePayload): Promise<MessagesSnapshot> {
    return messagesApi.sendMessage(payload);
  }
}

export const messagesService = new MessagesService();