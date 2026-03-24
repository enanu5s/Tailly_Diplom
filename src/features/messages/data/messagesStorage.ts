// src/features/messages/data/messagesStorage.ts
import { emitMessagesUpdated } from '../model/messagesEvents';

import type {
  ChatMessage,
  EnsureClientThreadPayload,
  EnsureSpecialistThreadPayload,
  EnsureSupportThreadPayload,
  MarkMessagesAsReadPayload,
  MessageImageAttachment,
  MessageParticipant,
  MessageParticipantRole,
  MessageReplyPreview,
  MessageThread,
  MessagesSnapshot,
  MessagesUnreadSummary,
  MessagesViewer,
  SendMessagePayload,
  StoredMessageThread,
} from '../model/types';

const THREADS_STORAGE_KEY = 'tailly_messages_threads';
const MESSAGES_STORAGE_KEY = 'tailly_messages_messages';
const SUPPORT_TEAM_READ_KEY = 'support-team';
const STORAGE_SOFT_LIMIT = 4_500_000;

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

function isQuotaExceededError(error: unknown): boolean {
  if (!(error instanceof DOMException)) {
    return false;
  }

  return (
    error.name === 'QuotaExceededError' ||
    error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
  );
}

function estimateLocalStorageUsage(): number {
  let total = 0;

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);

    if (!key) {
      continue;
    }

    const value = localStorage.getItem(key) ?? '';
    total += key.length + value.length;
  }

  return total;
}

function safeSetStorageItem(key: string, value: string): void {
  const currentValue = localStorage.getItem(key) ?? '';
  const projectedUsage =
    estimateLocalStorageUsage() - currentValue.length + value.length;

  if (projectedUsage > STORAGE_SOFT_LIMIT) {
    throw new Error(
      'Сообщение с фото слишком тяжёлое для mock-хранилища. Попробуй фото меньшего размера или удали старые сообщения с изображениями.',
    );
  }

  try {
    localStorage.setItem(key, value);
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

  const rawParticipants = Array.isArray(value.participants)
    ? value.participants
    : [];

  const participants = rawParticipants
    .map(normalizeParticipant)
    .filter(
      (participant): participant is MessageParticipant => participant !== null,
    );

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

  if (
    !id ||
    kind !== 'image' ||
    !name ||
    !mimeType ||
    !url ||
    sizeBytes === undefined
  ) {
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
    .filter(
      (attachment): attachment is MessageImageAttachment => attachment !== null,
    );

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

  const rawReadByUserIds = Array.isArray(value.readByUserIds)
    ? value.readByUserIds
    : [];

  const legacyIsRead =
    typeof value.isRead === 'boolean' ? value.isRead : undefined;

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

function readThreads(): StoredMessageThread[] {
  return safeJsonParse(localStorage.getItem(THREADS_STORAGE_KEY))
    .map(normalizeStoredThread)
    .filter((thread): thread is StoredMessageThread => thread !== null);
}

function readMessages(): ChatMessage[] {
  return safeJsonParse(localStorage.getItem(MESSAGES_STORAGE_KEY))
    .map(normalizeMessage)
    .filter((message): message is ChatMessage => message !== null);
}

function writeThreads(threads: StoredMessageThread[]): void {
  safeSetStorageItem(THREADS_STORAGE_KEY, JSON.stringify(threads));
}

function writeMessages(messages: ChatMessage[]): void {
  safeSetStorageItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
}

function isAdminViewer(viewer: MessagesViewer): boolean {
  return viewer.role === 'admin' || viewer.role === 'super_admin';
}

function getReadKey(viewer: MessagesViewer): string {
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

  return thread.participants.some(
    (participant) => participant.userId === viewer.userId,
  );
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
    thread.participants.find((participant) => participant.role !== 'support') ??
    null
  );
}

function getOtherParticipant(
  thread: StoredMessageThread,
  viewerUserId: string,
): MessageParticipant | null {
  return (
    thread.participants.find((participant) => participant.userId !== viewerUserId) ??
    null
  );
}

function isOwnMessageForViewer(
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

function buildSupportParticipant(): MessageParticipant {
  return {
    userId: 'tailly-support',
    role: 'support',
    displayName: 'Поддержка Tailly',
  };
}

function buildViewerParticipant(viewer: MessagesViewer): MessageParticipant {
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

function resolveAuthorRole(
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

function resolveAuthorId(
  viewer: MessagesViewer,
  thread: StoredMessageThread,
): string {
  if (thread.kind === 'support' && isAdminViewer(viewer)) {
    return 'tailly-support';
  }

  return viewer.userId;
}

function resolveAuthorName(
  viewer: MessagesViewer,
  thread: StoredMessageThread,
): string {
  if (thread.kind === 'support' && isAdminViewer(viewer)) {
    return 'Поддержка Tailly';
  }

  return viewer.displayName.trim() || 'Пользователь';
}

function resolveAuthorSupportAgentName(
  viewer: MessagesViewer,
  thread: StoredMessageThread,
): string | undefined {
  if (thread.kind === 'support' && isAdminViewer(viewer)) {
    return viewer.displayName.trim() || 'Администратор';
  }

  return undefined;
}

function seedSupportWelcomeMessage(threadId: string): ChatMessage {
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

function buildMessagePreview(
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

function buildSnapshot(
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

export function ensureSupportThread(
  payload: EnsureSupportThreadPayload,
): MessagesSnapshot {
  const { viewer } = payload;

  if (viewer.role === 'guest' || isAdminViewer(viewer)) {
    return getMessagesSnapshot(viewer);
  }

  const allThreads = readThreads();
  const allMessages = readMessages();

  const existingThread = allThreads.find(
    (thread) =>
      thread.kind === 'support' &&
      thread.participants.some(
        (participant) => participant.userId === viewer.userId,
      ),
  );

  if (existingThread) {
    return buildSnapshot(viewer, allThreads, allMessages);
  }

  const nowIso = new Date().toISOString();

  const newThread: StoredMessageThread = {
    id: createId('thread'),
    kind: 'support',
    participants: [buildViewerParticipant(viewer), buildSupportParticipant()],
    createdAt: nowIso,
    updatedAt: nowIso,
    lastMessagePreview:
      'Здравствуйте! Это чат поддержки Tailly. Напишите ваш вопрос, и мы постараемся помочь.',
  };

  const welcomeMessage = seedSupportWelcomeMessage(newThread.id);
  const updatedThreads = [...allThreads, newThread];
  const updatedMessages = [...allMessages, welcomeMessage];

  writeThreads(updatedThreads);
  writeMessages(updatedMessages);
  emitMessagesUpdated();

  return buildSnapshot(viewer, updatedThreads, updatedMessages);
}

export function ensureSpecialistThread(
  payload: EnsureSpecialistThreadPayload,
): MessagesSnapshot {
  const { viewer } = payload;

  if (
    viewer.role === 'guest' ||
    !viewer.userId.trim() ||
    !payload.specialistId.trim()
  ) {
    return getMessagesSnapshot(viewer);
  }

  const allThreads = readThreads();
  const allMessages = readMessages();

  const existingThread = allThreads.find(
    (thread) =>
      thread.kind === 'specialist_direct' &&
      thread.participants.some(
        (participant) => participant.userId === viewer.userId,
      ) &&
      thread.participants.some(
        (participant) => participant.userId === payload.specialistId.trim(),
      ),
  );

  if (existingThread) {
    return buildSnapshot(viewer, allThreads, allMessages);
  }

  const nowIso = new Date().toISOString();

  const newThread: StoredMessageThread = {
    id: createId('thread'),
    kind: 'specialist_direct',
    participants: [
      buildViewerParticipant(viewer),
      {
        userId: payload.specialistId.trim(),
        role: 'specialist',
        displayName: payload.specialistName.trim() || 'Специалист',
        avatarUrl: payload.specialistAvatarUrl?.trim() || undefined,
      },
    ],
    createdAt: nowIso,
    updatedAt: nowIso,
    lastMessagePreview: '',
  };

  const updatedThreads = [...allThreads, newThread];

  writeThreads(updatedThreads);
  emitMessagesUpdated();

  return buildSnapshot(viewer, updatedThreads, allMessages);
}

export function ensureClientThread(
  payload: EnsureClientThreadPayload,
): MessagesSnapshot {
  const { viewer } = payload;
  const clientId = payload.clientId.trim();

  if (viewer.role !== 'specialist' || !viewer.userId.trim() || !clientId) {
    return getMessagesSnapshot(viewer);
  }

  const allThreads = readThreads();
  const allMessages = readMessages();

  const existingThread = allThreads.find(
    (thread) =>
      thread.kind === 'specialist_direct' &&
      thread.participants.some(
        (participant) => participant.userId === viewer.userId,
      ) &&
      thread.participants.some((participant) => participant.userId === clientId),
  );

  if (existingThread) {
    return buildSnapshot(viewer, allThreads, allMessages);
  }

  const nowIso = new Date().toISOString();

  const newThread: StoredMessageThread = {
    id: createId('thread'),
    kind: 'specialist_direct',
    participants: [
      buildViewerParticipant(viewer),
      {
        userId: clientId,
        role: 'client',
        displayName: payload.clientName.trim() || 'Клиент',
        avatarUrl: payload.clientAvatarUrl?.trim() || undefined,
      },
    ],
    createdAt: nowIso,
    updatedAt: nowIso,
    lastMessagePreview: '',
  };

  const updatedThreads = [...allThreads, newThread];

  writeThreads(updatedThreads);
  emitMessagesUpdated();

  return buildSnapshot(viewer, updatedThreads, allMessages);
}

export function markMessagesAsRead(
  payload: MarkMessagesAsReadPayload,
): MessagesSnapshot {
  const { viewer, threadId, messageIds } = payload;

  if (!viewer.userId.trim() || messageIds.length === 0) {
    return getMessagesSnapshot(viewer);
  }

  const readKey = getReadKey(viewer);
  const targetMessageIds = new Set(messageIds);
  const allThreads = readThreads();
  const allMessages = readMessages();

  let hasChanges = false;

  const updatedMessages = allMessages.map((message) => {
    if (message.threadId !== threadId) {
      return message;
    }

    if (!targetMessageIds.has(message.id)) {
      return message;
    }

    if (isOwnMessageForViewer(message, viewer)) {
      return message;
    }

    if (message.readByUserIds.includes(readKey)) {
      return message;
    }

    hasChanges = true;

    return {
      ...message,
      readByUserIds: [...message.readByUserIds, readKey],
    };
  });

  if (hasChanges) {
    writeMessages(updatedMessages);
    emitMessagesUpdated();
  }

  return buildSnapshot(viewer, allThreads, updatedMessages);
}

export function sendMessage(payload: SendMessagePayload): MessagesSnapshot {
  const text = payload.text.trim();
  const attachments = Array.isArray(payload.attachments)
    ? payload.attachments.filter((attachment) => attachment.kind === 'image')
    : [];
  const viewer = payload.viewer;
  const replyTo = payload.replyTo;

  if (
    (!text && attachments.length === 0) ||
    viewer.role === 'guest' ||
    !viewer.userId.trim()
  ) {
    return getMessagesSnapshot(viewer);
  }

  const allThreads = readThreads();
  const allMessages = readMessages();

  const threadIndex = allThreads.findIndex((thread) => thread.id === payload.threadId);

  if (threadIndex === -1) {
    return getMessagesSnapshot(viewer);
  }

  const thread = allThreads[threadIndex];

  const canWrite =
    thread.participants.some((participant) => participant.userId === viewer.userId) ||
    (thread.kind === 'support' && isAdminViewer(viewer));

  if (!canWrite) {
    return getMessagesSnapshot(viewer);
  }

  const nowIso = new Date().toISOString();
  const readKey = getReadKey(viewer);

  const message: ChatMessage = {
    id: createId('message'),
    threadId: payload.threadId,
    authorId: resolveAuthorId(viewer, thread),
    authorRole: resolveAuthorRole(viewer, thread),
    authorName: resolveAuthorName(viewer, thread),
    authorSupportAgentName: resolveAuthorSupportAgentName(viewer, thread),
    text,
    attachments,
    replyTo,
    createdAt: nowIso,
    readByUserIds: readKey ? [readKey] : [],
  };

  const preview = buildMessagePreview(text, attachments);
  const updatedThreads = [...allThreads];
  updatedThreads[threadIndex] = {
    ...thread,
    updatedAt: nowIso,
    lastMessagePreview: preview,
  };

  const updatedMessages = [...allMessages, message];

  writeThreads(updatedThreads);
  writeMessages(updatedMessages);
  emitMessagesUpdated();

  return buildSnapshot(viewer, updatedThreads, updatedMessages);
}

/** Демо-переписки в localStorage (только если хранилище сообщений пустое). */
export function seedDemoMessagesIfEmpty(): void {
  const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';

  if (!USE_MOCK || typeof window === 'undefined') {
    return;
  }

  if (readThreads().length > 0 || readMessages().length > 0) {
    return;
  }

  const weekAgo = Date.now() - 7 * 86_400_000;

  const directThread1: StoredMessageThread = {
    id: 'demo-thread-client1-specialist2',
    kind: 'specialist_direct',
    participants: [
      { userId: 'client-1', role: 'client', displayName: 'Елена Смирнова' },
      {
        userId: 'specialist-2',
        role: 'specialist',
        displayName: 'Игорь П.',
      },
    ],
    createdAt: new Date(weekAgo).toISOString(),
    updatedAt: new Date(weekAgo + 3_600_000).toISOString(),
    lastMessagePreview: 'Договорились, до субботы!',
  };

  const directThread2: StoredMessageThread = {
    id: 'demo-thread-client5-specialist4',
    kind: 'specialist_direct',
    participants: [
      { userId: 'client-5', role: 'client', displayName: 'Ольга С.' },
      {
        userId: 'specialist-4',
        role: 'specialist',
        displayName: 'Татьяна Е.',
      },
    ],
    createdAt: new Date(weekAgo + 86_400_000).toISOString(),
    updatedAt: new Date(weekAgo + 90_000_000).toISOString(),
    lastMessagePreview: 'Фотоотчёт отправлю вечером.',
  };

  const supportThread: StoredMessageThread = {
    id: 'demo-thread-support-client10',
    kind: 'support',
    participants: [
      { userId: 'client-10', role: 'client', displayName: 'Сергей С.' },
      buildSupportParticipant(),
    ],
    createdAt: new Date(weekAgo + 172_800_000).toISOString(),
    updatedAt: new Date(weekAgo + 175_000_000).toISOString(),
    lastMessagePreview: 'Спасибо, разобрался с оплатой.',
  };

  const demoMessages: ChatMessage[] = [
    {
      id: 'demo-msg-1',
      threadId: directThread1.id,
      authorId: 'client-1',
      authorRole: 'client',
      authorName: 'Елена Смирнова',
      text: 'Добрый день! Можно перенести прогулку на субботу утром?',
      attachments: [],
      createdAt: new Date(weekAgo + 60_000).toISOString(),
      readByUserIds: ['client-1', 'specialist-2'],
    },
    {
      id: 'demo-msg-2',
      threadId: directThread1.id,
      authorId: 'specialist-2',
      authorRole: 'specialist',
      authorName: 'Игорь П.',
      text: 'Да, суббота с 10:00 подойдёт. Подтвердите, пожалуйста, адрес.',
      attachments: [],
      createdAt: new Date(weekAgo + 120_000).toISOString(),
      readByUserIds: ['client-1', 'specialist-2'],
    },
    {
      id: 'demo-msg-3',
      threadId: directThread1.id,
      authorId: 'client-1',
      authorRole: 'client',
      authorName: 'Елена Смирнова',
      text: 'Отлично, адрес тот же. Спасибо!',
      attachments: [],
      createdAt: new Date(weekAgo + 3_600_000).toISOString(),
      readByUserIds: ['client-1', 'specialist-2'],
    },
    {
      id: 'demo-msg-4',
      threadId: directThread2.id,
      authorId: 'client-5',
      authorRole: 'client',
      authorName: 'Ольга С.',
      text: 'Нужна передержка на выходные, кот спокойный.',
      attachments: [],
      createdAt: new Date(weekAgo + 86_400_000).toISOString(),
      readByUserIds: ['client-5', 'specialist-4'],
    },
    {
      id: 'demo-msg-5',
      threadId: directThread2.id,
      authorId: 'specialist-4',
      authorRole: 'specialist',
      authorName: 'Татьяна Е.',
      text: 'Могу принять с пятницы вечера. Уточните корм и привычки.',
      attachments: [],
      createdAt: new Date(weekAgo + 86_500_000).toISOString(),
      readByUserIds: ['client-5', 'specialist-4'],
    },
    {
      id: 'demo-msg-6',
      threadId: directThread2.id,
      authorId: 'specialist-4',
      authorRole: 'specialist',
      authorName: 'Татьяна Е.',
      text: 'Фотоотчёт отправлю вечером.',
      attachments: [],
      createdAt: new Date(weekAgo + 90_000_000).toISOString(),
      readByUserIds: ['client-5', 'specialist-4'],
    },
    {
      id: 'demo-msg-support-welcome',
      threadId: supportThread.id,
      authorId: 'tailly-support',
      authorRole: 'support',
      authorName: 'Поддержка Tailly',
      authorSupportAgentName: 'Система',
      text: 'Здравствуйте! Это чат поддержки Tailly. Напишите ваш вопрос, и мы постараемся помочь.',
      attachments: [],
      createdAt: new Date(weekAgo + 172_800_000).toISOString(),
      readByUserIds: ['client-10', SUPPORT_TEAM_READ_KEY],
    },
    {
      id: 'demo-msg-7',
      threadId: supportThread.id,
      authorId: 'client-10',
      authorRole: 'client',
      authorName: 'Сергей С.',
      text: 'Не проходит оплата картой в магазине, что проверить?',
      attachments: [],
      createdAt: new Date(weekAgo + 172_900_000).toISOString(),
      readByUserIds: ['client-10', SUPPORT_TEAM_READ_KEY],
    },
    {
      id: 'demo-msg-8',
      threadId: supportThread.id,
      authorId: 'tailly-support',
      authorRole: 'support',
      authorName: 'Поддержка Tailly',
      authorSupportAgentName: 'Агент',
      text: 'Проверьте лимиты карты и попробуйте СБП. Если ошибка повторится — пришлите скрин.',
      attachments: [],
      createdAt: new Date(weekAgo + 173_200_000).toISOString(),
      readByUserIds: [SUPPORT_TEAM_READ_KEY],
    },
    {
      id: 'demo-msg-9',
      threadId: supportThread.id,
      authorId: 'client-10',
      authorRole: 'client',
      authorName: 'Сергей С.',
      text: 'Спасибо, разобрался с оплатой.',
      attachments: [],
      createdAt: new Date(weekAgo + 175_000_000).toISOString(),
      readByUserIds: ['client-10', SUPPORT_TEAM_READ_KEY],
    },
  ];

  writeThreads([directThread1, directThread2, supportThread]);
  writeMessages(demoMessages);
  emitMessagesUpdated();
}