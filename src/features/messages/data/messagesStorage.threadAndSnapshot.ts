// src/features/messages/data/messagesStorage.threadAndSnapshot.ts
import {
  createId,
  readMessages,
  readThreads,
  SUPPORT_TEAM_READ_KEY,
} from './messagesStorage.storage';

import type {
  ChatMessage,
  MessageImageAttachment,
  MessageParticipant,
  MessageParticipantRole,
  MessageThread,
  MessagesSnapshot,
  MessagesUnreadSummary,
  MessagesViewer,
  StoredMessageThread,
} from '../model/types';

export function isAdminViewer(viewer: MessagesViewer): boolean {
  return viewer.role === 'admin' || viewer.role === 'super_admin';
}

export function getReadKey(viewer: MessagesViewer): string {
  if (isAdminViewer(viewer)) {
    return SUPPORT_TEAM_READ_KEY;
  }

  return viewer.userId.trim();
}

function isThreadVisibleForViewer(
  thread: StoredMessageThread,
  viewer: MessagesViewer,
): boolean {
  if (viewer.role === 'guest') {
    return false;
  }

  if (isAdminViewer(viewer)) {
    return thread.kind === 'support';
  }

  return thread.participants.some((participant) => participant.userId === viewer.userId);
}

function getVisibleThreadsForViewer(
  threads: StoredMessageThread[],
  viewer: MessagesViewer,
): StoredMessageThread[] {
  return threads.filter((thread) => isThreadVisibleForViewer(thread, viewer));
}

function getSupportThreadUserParticipant(
  thread: StoredMessageThread,
): MessageParticipant | null {
  return (
    thread.participants.find((participant) => participant.role !== 'support') ?? null
  );
}

function getOtherParticipant(
  thread: StoredMessageThread,
  viewerUserId: string,
): MessageParticipant | null {
  return (
    thread.participants.find((participant) => participant.userId !== viewerUserId) ?? null
  );
}

export function isOwnMessageForViewer(
  message: ChatMessage,
  viewer: MessagesViewer,
): boolean {
  if (message.authorRole === 'support') {
    return isAdminViewer(viewer);
  }

  return message.authorId === viewer.userId;
}

function getUnreadCountForThread(
  threadId: string,
  messages: ChatMessage[],
  viewer: MessagesViewer,
): number {
  const readKey = getReadKey(viewer);

  if (!readKey) {
    return 0;
  }

  return messages.filter((message) => {
    if (message.threadId !== threadId) {
      return false;
    }

    if (isOwnMessageForViewer(message, viewer)) {
      return false;
    }

    return !message.readByUserIds.includes(readKey);
  }).length;
}

function mapStoredThreadToViewThread(
  thread: StoredMessageThread,
  viewer: MessagesViewer,
  messages: ChatMessage[],
): MessageThread {
  const unreadCount = getUnreadCountForThread(thread.id, messages, viewer);

  if (thread.kind === 'support') {
    if (isAdminViewer(viewer)) {
      const clientOrSpecialist = getSupportThreadUserParticipant(thread);

      return {
        id: thread.id,
        kind: thread.kind,
        participants: thread.participants,
        title: clientOrSpecialist?.displayName ?? 'Поддержка Tailly',
        avatarUrl: clientOrSpecialist?.avatarUrl,
        isPinned: true,
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt,
        lastMessagePreview: thread.lastMessagePreview,
        unreadCount,
      };
    }

    return {
      id: thread.id,
      kind: thread.kind,
      participants: thread.participants,
      title: 'Поддержка Tailly',
      avatarUrl: undefined,
      isPinned: true,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
      lastMessagePreview: thread.lastMessagePreview,
      unreadCount,
    };
  }

  const otherParticipant = getOtherParticipant(thread, viewer.userId);

  return {
    id: thread.id,
    kind: thread.kind,
    participants: thread.participants,
    title: otherParticipant?.displayName ?? 'Личный чат',
    avatarUrl: otherParticipant?.avatarUrl,
    isPinned: false,
    createdAt: thread.createdAt,
    updatedAt: thread.updatedAt,
    lastMessagePreview: thread.lastMessagePreview,
    unreadCount,
  };
}

function sortThreads(threads: MessageThread[]): MessageThread[] {
  return [...threads].sort((left, right) => {
    if (left.kind === 'support' && right.kind !== 'support') {
      return -1;
    }

    if (left.kind !== 'support' && right.kind === 'support') {
      return 1;
    }

    if (left.unreadCount > 0 && right.unreadCount === 0) {
      return -1;
    }

    if (left.unreadCount === 0 && right.unreadCount > 0) {
      return 1;
    }

    return right.updatedAt.localeCompare(left.updatedAt);
  });
}

export function buildSupportParticipant(): MessageParticipant {
  return {
    userId: 'tailly-support',
    role: 'support',
    displayName: 'Поддержка Tailly',
  };
}

export function buildViewerParticipant(viewer: MessagesViewer): MessageParticipant {
  return {
    userId: viewer.userId,
    role:
      viewer.role === 'guest'
        ? 'client'
        : viewer.role === 'support'
          ? 'support'
          : viewer.role,
    displayName: viewer.displayName.trim() || 'Пользователь',
    avatarUrl: viewer.avatarUrl?.trim() || undefined,
  };
}

export function resolveAuthorRole(
  viewer: MessagesViewer,
  thread: StoredMessageThread,
): MessageParticipantRole {
  if (thread.kind === 'support' && isAdminViewer(viewer)) {
    return 'support';
  }

  if (viewer.role === 'guest') {
    return 'client';
  }

  return viewer.role === 'support' ? 'support' : viewer.role;
}

export function resolveAuthorId(
  viewer: MessagesViewer,
  thread: StoredMessageThread,
): string {
  if (thread.kind === 'support' && isAdminViewer(viewer)) {
    return 'tailly-support';
  }

  return viewer.userId;
}

export function resolveAuthorName(
  viewer: MessagesViewer,
  thread: StoredMessageThread,
): string {
  if (thread.kind === 'support' && isAdminViewer(viewer)) {
    return 'Поддержка Tailly';
  }

  return viewer.displayName.trim() || 'Пользователь';
}

export function resolveAuthorSupportAgentName(
  viewer: MessagesViewer,
  thread: StoredMessageThread,
): string | undefined {
  if (thread.kind === 'support' && isAdminViewer(viewer)) {
    return viewer.displayName.trim() || 'Администратор';
  }

  return undefined;
}

export function seedSupportWelcomeMessage(threadId: string): ChatMessage {
  return {
    id: createId('message'),
    threadId,
    authorId: 'tailly-support',
    authorRole: 'support',
    authorName: 'Поддержка Tailly',
    authorSupportAgentName: 'Система',
    text: 'Здравствуйте! Это чат поддержки Tailly. Напишите ваш вопрос, и мы постараемся помочь.',
    attachments: [],
    createdAt: new Date().toISOString(),
    readByUserIds: [],
  };
}

export function buildMessagePreview(
  text: string,
  attachments: MessageImageAttachment[],
): string {
  const trimmedText = text.trim();

  if (trimmedText && attachments.length > 0) {
    return `${trimmedText} · Фото: ${attachments.length}`;
  }

  if (trimmedText) {
    return trimmedText;
  }

  if (attachments.length === 1) {
    return 'Фото';
  }

  if (attachments.length > 1) {
    return `Фото: ${attachments.length}`;
  }

  return '';
}

export function buildSnapshot(
  viewer: MessagesViewer,
  threads: StoredMessageThread[],
  messages: ChatMessage[],
): MessagesSnapshot {
  const visibleThreads = getVisibleThreadsForViewer(threads, viewer);
  const visibleThreadIds = new Set(visibleThreads.map((thread) => thread.id));

  const visibleMessages = messages.filter((message) =>
    visibleThreadIds.has(message.threadId),
  );

  const mappedThreads = visibleThreads.map((thread) =>
    mapStoredThreadToViewThread(thread, viewer, visibleMessages),
  );

  return {
    threads: sortThreads(mappedThreads),
    messages: [...visibleMessages].sort((left, right) =>
      left.createdAt.localeCompare(right.createdAt),
    ),
  };
}

export function getMessagesSnapshot(viewer: MessagesViewer): MessagesSnapshot {
  return buildSnapshot(viewer, readThreads(), readMessages());
}

export function getUnreadSummary(viewer: MessagesViewer): MessagesUnreadSummary {
  const snapshot = getMessagesSnapshot(viewer);

  const unreadMessagesCount = snapshot.threads.reduce(
    (accumulator, thread) => accumulator + thread.unreadCount,
    0,
  );

  const unreadThreadsCount = snapshot.threads.filter(
    (thread) => thread.unreadCount > 0,
  ).length;

  return {
    unreadMessagesCount,
    unreadThreadsCount,
  };
}
