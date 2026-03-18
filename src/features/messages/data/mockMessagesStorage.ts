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
  const ownerUserId = asString(value.ownerUserId)?.trim();
  const title = asString(value.title)?.trim();
  const createdAt = asString(value.createdAt)?.trim();
  const updatedAt = asString(value.updatedAt)?.trim();
  const lastMessagePreview = asString(value.lastMessagePreview)?.trim() ?? '';

  if (
    !id ||
    !ownerUserId ||
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
    ownerUserId,
    title,
    avatarUrl: asString(value.avatarUrl)?.trim() || undefined,
    specialistId: asString(value.specialistId)?.trim() || undefined,
    specialistSlug: asString(value.specialistSlug)?.trim() || undefined,
    isPinned: asBoolean(value.isPinned) ?? false,
    createdAt,
    updatedAt,
    lastMessagePreview,
    unreadCount:
      typeof value.unreadCount === 'number' && Number.isFinite(value.unreadCount)
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
  const text = asString(value.text)?.trim();
  const createdAt = asString(value.createdAt)?.trim();

  if (
    !id ||
    !threadId ||
    !authorId ||
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
    text,
    createdAt,
    isRead: asBoolean(value.isRead) ?? false,
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
    if (left.kind === 'support' && right.kind !== 'support') {
      return -1;
    }

    if (left.kind !== 'support' && right.kind === 'support') {
      return 1;
    }

    if (left.isPinned && !right.isPinned) {
      return -1;
    }

    if (!left.isPinned && right.isPinned) {
      return 1;
    }

    return right.updatedAt.localeCompare(left.updatedAt);
  });
}

function seedSupportWelcomeMessage(threadId: string): ChatMessage {
  return {
    id: createId('message'),
    threadId,
    authorId: 'tailly-support',
    authorRole: 'support',
    text: 'Здравствуйте! Это чат поддержки Tailly. Напишите ваш вопрос, и мы постараемся помочь.',
    createdAt: new Date().toISOString(),
    isRead: true,
  };
}

export function getMessagesSnapshot(ownerUserId: string): MessagesSnapshot {
  const threads = readThreads().filter(
    (thread) => thread.ownerUserId === ownerUserId,
  );
  const threadIds = new Set(threads.map((thread) => thread.id));
  const messages = readMessages().filter((message) => threadIds.has(message.threadId));

  return {
    threads: sortThreads(threads),
    messages: [...messages].sort((left, right) =>
      left.createdAt.localeCompare(right.createdAt),
    ),
  };
}

export function ensureSupportThread(
  payload: EnsureSupportThreadPayload,
): MessagesSnapshot {
  const allThreads = readThreads();
  const allMessages = readMessages();

  const existingThread = allThreads.find(
    (thread) =>
      thread.ownerUserId === payload.ownerUserId && thread.kind === 'support',
  );

  if (existingThread) {
    return getMessagesSnapshot(payload.ownerUserId);
  }

  const nowIso = new Date().toISOString();

  const newThread: MessageThread = {
    id: createId('thread'),
    kind: 'support',
    ownerUserId: payload.ownerUserId,
    title: 'Поддержка Tailly',
    isPinned: true,
    createdAt: nowIso,
    updatedAt: nowIso,
    lastMessagePreview:
      'Здравствуйте! Это чат поддержки Tailly. Напишите ваш вопрос, и мы постараемся помочь.',
    unreadCount: 0,
  };

  const welcomeMessage = seedSupportWelcomeMessage(newThread.id);

  writeThreads(sortThreads([...allThreads, newThread]));
  writeMessages([...allMessages, welcomeMessage]);

  return getMessagesSnapshot(payload.ownerUserId);
}

export function ensureSpecialistThread(
  payload: EnsureSpecialistThreadPayload,
): MessagesSnapshot {
  const allThreads = readThreads();

  const existingThread = allThreads.find(
    (thread) =>
      thread.ownerUserId === payload.ownerUserId &&
      thread.kind === 'specialist_direct' &&
      thread.specialistId === payload.specialistId,
  );

  if (existingThread) {
    return getMessagesSnapshot(payload.ownerUserId);
  }

  const nowIso = new Date().toISOString();

  const newThread: MessageThread = {
    id: createId('thread'),
    kind: 'specialist_direct',
    ownerUserId: payload.ownerUserId,
    title: payload.title.trim(),
    avatarUrl: payload.avatarUrl?.trim() || undefined,
    specialistId: payload.specialistId.trim(),
    specialistSlug: payload.specialistSlug.trim(),
    isPinned: false,
    createdAt: nowIso,
    updatedAt: nowIso,
    lastMessagePreview: '',
    unreadCount: 0,
  };

  writeThreads(sortThreads([...allThreads, newThread]));

  return getMessagesSnapshot(payload.ownerUserId);
}

export function sendMessage(
  ownerUserId: string,
  payload: SendMessagePayload,
): MessagesSnapshot {
  const text = payload.text.trim();

  if (!text) {
    return getMessagesSnapshot(ownerUserId);
  }

  const allThreads = readThreads();
  const allMessages = readMessages();

  const threadIndex = allThreads.findIndex(
    (thread) =>
      thread.id === payload.threadId && thread.ownerUserId === ownerUserId,
  );

  if (threadIndex === -1) {
    return getMessagesSnapshot(ownerUserId);
  }

  const nowIso = new Date().toISOString();

  const message: ChatMessage = {
    id: createId('message'),
    threadId: payload.threadId,
    authorId: payload.authorId,
    authorRole: payload.authorRole,
    text,
    createdAt: nowIso,
    isRead: true,
  };

  const updatedThreads = [...allThreads];
  updatedThreads[threadIndex] = {
    ...updatedThreads[threadIndex],
    updatedAt: nowIso,
    lastMessagePreview: text,
  };

  writeThreads(sortThreads(updatedThreads));
  writeMessages([...allMessages, message]);

  return getMessagesSnapshot(ownerUserId);
}