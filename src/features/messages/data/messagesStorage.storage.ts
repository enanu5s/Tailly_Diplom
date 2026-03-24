// src/features/messages/data/messagesStorage.storage.ts
import {
  ensureMockDatabaseLoaded,
  persistMockDatabase,
  unsafeMutableMockDb,
} from '@/shared/mock-db/store';

import type {
  ChatMessage,
  MessageImageAttachment,
  MessageParticipant,
  MessageParticipantRole,
  MessageReplyPreview,
  StoredMessageThread,
} from '../model/types';

/** Легаси-ключи (миграция в `mergeLegacyLocalStorageIfNeeded` общей mock-db). */
export const THREADS_STORAGE_KEY = 'tailly_messages_threads';
export const MESSAGES_STORAGE_KEY = 'tailly_messages_messages';
export const SUPPORT_TEAM_READ_KEY = 'support-team';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function isParticipantRole(value: unknown): value is MessageParticipantRole {
  return (
    value === 'client' ||
    value === 'specialist' ||
    value === 'admin' ||
    value === 'super_admin' ||
    value === 'support'
  );
}

export function createId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
}

function isQuotaExceededError(error: unknown): boolean {
  if (!(error instanceof DOMException)) {
    return false;
  }

  return (
    error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
  );
}

function persistMessagesDb(): void {
  try {
    persistMockDatabase();
  } catch (error) {
    if (isQuotaExceededError(error)) {
      throw new Error(
        'Хранилище сообщений переполнено. Удали старые сообщения с фото или прикрепи изображение меньшего размера.',
      );
    }

    throw error;
  }
}

function normalizeParticipant(value: unknown): MessageParticipant | null {
  if (!isRecord(value)) {
    return null;
  }

  const userId = asString(value.userId)?.trim();
  const role = value.role;
  const displayName = asString(value.displayName)?.trim();

  if (!userId || !displayName || !isParticipantRole(role)) {
    return null;
  }

  return {
    userId,
    role,
    displayName,
    avatarUrl: asString(value.avatarUrl)?.trim() || undefined,
  };
}

function normalizeStoredThread(value: unknown): StoredMessageThread | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = asString(value.id)?.trim();
  const kind = asString(value.kind);
  const createdAt = asString(value.createdAt)?.trim();
  const updatedAt = asString(value.updatedAt)?.trim();
  const lastMessagePreview = asString(value.lastMessagePreview)?.trim() ?? '';

  if (
    !id ||
    !createdAt ||
    !updatedAt ||
    (kind !== 'support' && kind !== 'specialist_direct')
  ) {
    return null;
  }

  const rawParticipants = Array.isArray(value.participants) ? value.participants : [];

  const participants = rawParticipants
    .map(normalizeParticipant)
    .filter((participant): participant is MessageParticipant => participant !== null);

  if (participants.length === 0) {
    return null;
  }

  return {
    id,
    kind,
    participants,
    createdAt,
    updatedAt,
    lastMessagePreview,
  };
}

function normalizeReadKeys(
  rawReadByUserIds: unknown[],
  authorRole: MessageParticipantRole,
): string[] {
  const normalized = rawReadByUserIds
    .map((item) => asString(item)?.trim())
    .filter((item): item is string => Boolean(item))
    .map((item) => {
      if (item === SUPPORT_TEAM_READ_KEY) {
        return SUPPORT_TEAM_READ_KEY;
      }

      if (authorRole === 'client' || authorRole === 'specialist') {
        if (item.startsWith('admin') || item.startsWith('super_admin')) {
          return SUPPORT_TEAM_READ_KEY;
        }
      }

      return item;
    });

  return [...new Set(normalized)];
}

function normalizeAttachment(value: unknown): MessageImageAttachment | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = asString(value.id)?.trim();
  const kind = asString(value.kind);
  const name = asString(value.name)?.trim();
  const mimeType = asString(value.mimeType)?.trim();
  const url = asString(value.url)?.trim();
  const thumbnailUrl = asString(value.thumbnailUrl)?.trim() || undefined;
  const sizeBytes = asNumber(value.sizeBytes);
  const width = asNumber(value.width);
  const height = asNumber(value.height);

  if (!id || kind !== 'image' || !name || !mimeType || !url || sizeBytes === undefined) {
    return null;
  }

  return {
    id,
    kind: 'image',
    name,
    mimeType,
    url,
    thumbnailUrl,
    width,
    height,
    sizeBytes,
  };
}

function normalizeReplyPreview(value: unknown): MessageReplyPreview | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const messageId = asString(value.messageId)?.trim();
  const authorName = asString(value.authorName)?.trim();
  const text = asString(value.text)?.trim() ?? '';
  const attachmentsCount = asNumber(value.attachmentsCount);

  if (!messageId || !authorName || attachmentsCount === undefined) {
    return undefined;
  }

  return {
    messageId,
    authorName,
    text,
    attachmentsCount: Math.max(0, Math.floor(attachmentsCount)),
  };
}

function normalizeMessage(value: unknown): ChatMessage | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = asString(value.id)?.trim();
  const threadId = asString(value.threadId)?.trim();
  const authorId = asString(value.authorId)?.trim();
  const authorRole = value.authorRole;
  const text = asString(value.text)?.trim() ?? '';
  const createdAt = asString(value.createdAt)?.trim();

  const rawAttachments = Array.isArray(value.attachments) ? value.attachments : [];
  const attachments = rawAttachments
    .map(normalizeAttachment)
    .filter((attachment): attachment is MessageImageAttachment => attachment !== null);

  if (
    !id ||
    !threadId ||
    !authorId ||
    !createdAt ||
    !isParticipantRole(authorRole) ||
    (!text && attachments.length === 0)
  ) {
    return null;
  }

  const authorName =
    asString(value.authorName)?.trim() ||
    (authorRole === 'support'
      ? 'Поддержка Tailly'
      : authorRole === 'specialist'
        ? 'Специалист'
        : authorRole === 'admin' || authorRole === 'super_admin'
          ? 'Администратор'
          : 'Пользователь');

  const authorSupportAgentName =
    asString(value.authorSupportAgentName)?.trim() || undefined;

  const rawReadByUserIds = Array.isArray(value.readByUserIds) ? value.readByUserIds : [];

  const legacyIsRead = typeof value.isRead === 'boolean' ? value.isRead : undefined;

  const readByUserIds =
    rawReadByUserIds.length > 0
      ? normalizeReadKeys(rawReadByUserIds, authorRole)
      : legacyIsRead
        ? [authorId]
        : [];

  const replyTo = normalizeReplyPreview(value.replyTo);

  return {
    id,
    threadId,
    authorId,
    authorRole,
    authorName,
    authorSupportAgentName,
    text,
    attachments,
    replyTo,
    createdAt,
    readByUserIds,
  };
}

export function readThreads(): StoredMessageThread[] {
  ensureMockDatabaseLoaded();
  return unsafeMutableMockDb()
    .messages.threads.map((row) => normalizeStoredThread(row))
    .filter((thread): thread is StoredMessageThread => thread !== null);
}

export function readMessages(): ChatMessage[] {
  ensureMockDatabaseLoaded();
  return unsafeMutableMockDb()
    .messages.items.map((row) => normalizeMessage(row))
    .filter((message): message is ChatMessage => message !== null);
}

export function writeThreads(threads: StoredMessageThread[]): void {
  ensureMockDatabaseLoaded();
  unsafeMutableMockDb().messages.threads = threads;
  persistMessagesDb();
}

export function writeMessages(messages: ChatMessage[]): void {
  ensureMockDatabaseLoaded();
  unsafeMutableMockDb().messages.items = messages;
  persistMessagesDb();
}
