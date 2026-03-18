// src/features/messages/model/types.ts
export type MessageParticipantRole =
  | 'client'
  | 'specialist'
  | 'admin'
  | 'super_admin'
  | 'support';

export type MessageThreadKind = 'support' | 'specialist_direct';

export type MessageParticipant = {
  userId: string;
  role: MessageParticipantRole;
  displayName: string;
  avatarUrl?: string;
};

export type MessagesViewer = {
  userId: string;
  role: MessageParticipantRole | 'guest';
  displayName: string;
  avatarUrl?: string;
};

export type StoredMessageThread = {
  id: string;
  kind: MessageThreadKind;
  participants: MessageParticipant[];
  createdAt: string;
  updatedAt: string;
  lastMessagePreview: string;
};

export type MessageThread = {
  id: string;
  kind: MessageThreadKind;
  participants: MessageParticipant[];
  title: string;
  avatarUrl?: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  lastMessagePreview: string;
  unreadCount: number;
};

export type ChatMessage = {
  id: string;
  threadId: string;
  authorId: string;
  authorRole: MessageParticipantRole;
  authorName: string;
  authorSupportAgentName?: string;
  text: string;
  createdAt: string;
  readByUserIds: string[];
};

export type MessagesSnapshot = {
  threads: MessageThread[];
  messages: ChatMessage[];
};

export type MessagesUnreadSummary = {
  unreadMessagesCount: number;
  unreadThreadsCount: number;
};

export type EnsureSupportThreadPayload = {
  viewer: MessagesViewer;
};

export type EnsureSpecialistThreadPayload = {
  viewer: MessagesViewer;
  specialistId: string;
  specialistSlug: string;
  specialistName: string;
  specialistAvatarUrl?: string;
};

export type SendMessagePayload = {
  viewer: MessagesViewer;
  threadId: string;
  text: string;
};

export type MarkMessagesAsReadPayload = {
  viewer: MessagesViewer;
  threadId: string;
  messageIds: string[];
};