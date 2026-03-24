// src/features/messages/data/mockMessagesStorage.ts

import type {
  ChatMessage,
  EnsureSpecialistThreadPayload,
  EnsureSupportThreadPayload,
  MessageThread,
  MessagesSnapshot,
  SendMessagePayload,
} from '../model/types';

const THREADS_STORAGE_KEY = 'tailly_messages_threads';
const MESSAGES_STORAGE_KEY = 'tailly_messages_messages';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function createId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
}

function safeJsonParse(value: string | null): unknown[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeThread(value: unknown): MessageThread | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = asString(value.id)?.trim();
  const kind = asString(value.kind);
  const title = asString(value.title)?.trim();
  const createdAt = asString(value.createdAt)?.trim();
  const updatedAt = asString(value.updatedAt)?.trim();
  const lastMessagePreview = asString(value.lastMessagePreview)?.trim() ?? '';

  const participants = Array.isArray(value.participants) ? value.participants : [];

  if (
    !id ||
    !title ||
    !createdAt ||
    !updatedAt ||
    (kind !== 'support' && kind !== 'specialist_direct')
  ) {
    return null;
  }

  return {
    id,
    kind,
    participants,
    title,
    avatarUrl: asString(value.avatarUrl)?.trim() || undefined,
    isPinned: asBoolean(value.isPinned) ?? false,
    createdAt,
    updatedAt,
    lastMessagePreview,
    unreadCount:
      typeof value.unreadCount === 'number'
        ? Math.max(0, Math.floor(value.unreadCount))
        : 0,
  };
}

function normalizeMessage(value: unknown): ChatMessage | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = asString(value.id)?.trim();
  const threadId = asString(value.threadId)?.trim();
  const authorId = asString(value.authorId)?.trim();
  const authorRole = asString(value.authorRole);
  const authorName = asString(value.authorName)?.trim();
  const text = asString(value.text)?.trim();
  const createdAt = asString(value.createdAt)?.trim();

  if (
    !id ||
    !threadId ||
    !authorId ||
    !authorName ||
    !text ||
    !createdAt ||
    (authorRole !== 'client' &&
      authorRole !== 'specialist' &&
      authorRole !== 'admin' &&
      authorRole !== 'support')
  ) {
    return null;
  }

  return {
    id,
    threadId,
    authorId,
    authorRole,
    authorName,
    text,
    attachments: [],
    createdAt,
    readByUserIds: Array.isArray(value.readByUserIds) ? value.readByUserIds : [],
  };
}

function readThreads(): MessageThread[] {
  return safeJsonParse(localStorage.getItem(THREADS_STORAGE_KEY))
    .map(normalizeThread)
    .filter((thread): thread is MessageThread => thread !== null);
}

function readMessages(): ChatMessage[] {
  return safeJsonParse(localStorage.getItem(MESSAGES_STORAGE_KEY))
    .map(normalizeMessage)
    .filter((message): message is ChatMessage => message !== null);
}

function writeThreads(threads: MessageThread[]): void {
  localStorage.setItem(THREADS_STORAGE_KEY, JSON.stringify(threads));
}

function writeMessages(messages: ChatMessage[]): void {
  localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
}

function sortThreads(threads: MessageThread[]): MessageThread[] {
  return [...threads].sort((left, right) => {
    if (left.kind === 'support' && right.kind !== 'support') return -1;
    if (left.kind !== 'support' && right.kind === 'support') return 1;

    if (left.isPinned && !right.isPinned) return -1;
    if (!left.isPinned && right.isPinned) return 1;

    return right.updatedAt.localeCompare(left.updatedAt);
  });
}

function seedSupportWelcomeMessage(threadId: string): ChatMessage {
  return {
    id: createId('message'),
    threadId,
    authorId: 'tailly-support',
    authorRole: 'support',
    authorName: 'Поддержка',
    text: 'Здравствуйте! Это чат поддержки Tailly. Напишите ваш вопрос, и мы постараемся помочь.',
    attachments: [],
    createdAt: new Date().toISOString(),
    readByUserIds: [],
  };
}

export function getMessagesSnapshot(viewerUserId: string): MessagesSnapshot {
  const threads = readThreads().filter((thread) =>
    thread.participants.some((p) => p.userId === viewerUserId),
  );

  const threadIds = new Set(threads.map((thread) => thread.id));

  const messages = readMessages().filter((message) => threadIds.has(message.threadId));

  return {
    threads: sortThreads(threads),
    messages: [...messages].sort((l, r) => l.createdAt.localeCompare(r.createdAt)),
  };
}

export function ensureSupportThread(
  payload: EnsureSupportThreadPayload,
): MessagesSnapshot {
  const { viewer } = payload;

  const allThreads = readThreads();
  const allMessages = readMessages();

  const existing = allThreads.find(
    (t) => t.kind === 'support' && t.participants.some((p) => p.userId === viewer.userId),
  );

  if (existing) {
    return getMessagesSnapshot(viewer.userId);
  }

  const nowIso = new Date().toISOString();

  const newThread: MessageThread = {
    id: createId('thread'),
    kind: 'support',
    participants: [
      {
        userId: viewer.userId,
        role: viewer.role === 'guest' ? 'client' : viewer.role,
        displayName: viewer.displayName,
        avatarUrl: viewer.avatarUrl,
      },
    ],
    title: 'Поддержка Tailly',
    isPinned: true,
    createdAt: nowIso,
    updatedAt: nowIso,
    lastMessagePreview: '',
    unreadCount: 0,
  };

  const welcome = seedSupportWelcomeMessage(newThread.id);

  writeThreads(sortThreads([...allThreads, newThread]));
  writeMessages([...allMessages, welcome]);

  return getMessagesSnapshot(viewer.userId);
}

export function ensureSpecialistThread(
  payload: EnsureSpecialistThreadPayload,
): MessagesSnapshot {
  const { viewer } = payload;

  const allThreads = readThreads();

  const existing = allThreads.find(
    (t) =>
      t.kind === 'specialist_direct' &&
      t.participants.some((p) => p.userId === viewer.userId),
  );

  if (existing) {
    return getMessagesSnapshot(viewer.userId);
  }

  const nowIso = new Date().toISOString();

  const newThread: MessageThread = {
    id: createId('thread'),
    kind: 'specialist_direct',
    participants: [
      {
        userId: viewer.userId,
        role: viewer.role === 'guest' ? 'client' : viewer.role,
        displayName: viewer.displayName,
        avatarUrl: viewer.avatarUrl,
      },
    ],
    title: payload.specialistName,
    avatarUrl: payload.specialistAvatarUrl,
    isPinned: false,
    createdAt: nowIso,
    updatedAt: nowIso,
    lastMessagePreview: '',
    unreadCount: 0,
  };

  writeThreads(sortThreads([...allThreads, newThread]));

  return getMessagesSnapshot(viewer.userId);
}

export function sendMessage(
  viewerUserId: string,
  payload: SendMessagePayload,
): MessagesSnapshot {
  const text = payload.text.trim();

  if (!text) {
    return getMessagesSnapshot(viewerUserId);
  }

  const allThreads = readThreads();
  const allMessages = readMessages();

  const threadIndex = allThreads.findIndex(
    (t) =>
      t.id === payload.threadId && t.participants.some((p) => p.userId === viewerUserId),
  );

  if (threadIndex === -1) {
    return getMessagesSnapshot(viewerUserId);
  }

  const nowIso = new Date().toISOString();

  const message: ChatMessage = {
    id: createId('message'),
    threadId: payload.threadId,
    authorId: payload.viewer.userId,
    authorRole: payload.viewer.role === 'guest' ? 'client' : payload.viewer.role,
    authorName: payload.viewer.displayName,
    text,
    attachments: [],
    createdAt: nowIso,
    readByUserIds: [payload.viewer.userId],
  };

  const updatedThreads = [...allThreads];
  updatedThreads[threadIndex] = {
    ...updatedThreads[threadIndex],
    updatedAt: nowIso,
    lastMessagePreview: text,
  };

  writeThreads(sortThreads(updatedThreads));
  writeMessages([...allMessages, message]);

  return getMessagesSnapshot(viewerUserId);
}
