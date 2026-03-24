// src/features/messages/data/messagesStorage.ts
import { isMockApiMode } from '@/shared/config/env';

import {
  createId,
  readMessages,
  readThreads,
  SUPPORT_TEAM_READ_KEY,
  writeMessages,
  writeThreads,
} from './messagesStorage.storage';
import {
  buildMessagePreview,
  buildSnapshot,
  buildSupportParticipant,
  buildViewerParticipant,
  getMessagesSnapshot,
  getReadKey,
  isAdminViewer,
  isOwnMessageForViewer,
  resolveAuthorId,
  resolveAuthorName,
  resolveAuthorRole,
  resolveAuthorSupportAgentName,
  seedSupportWelcomeMessage,
} from './messagesStorage.threadAndSnapshot';
import { emitMessagesUpdated } from '../model/messagesEvents';

import type {
  ChatMessage,
  EnsureClientThreadPayload,
  EnsureSpecialistThreadPayload,
  EnsureSupportThreadPayload,
  MarkMessagesAsReadPayload,
  MessagesSnapshot,
  SendMessagePayload,
  StoredMessageThread,
} from '../model/types';

export {
  getMessagesSnapshot,
  getUnreadSummary,
} from './messagesStorage.threadAndSnapshot';

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
      thread.participants.some((participant) => participant.userId === viewer.userId),
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

  if (viewer.role === 'guest' || !viewer.userId.trim() || !payload.specialistId.trim()) {
    return getMessagesSnapshot(viewer);
  }

  const allThreads = readThreads();
  const allMessages = readMessages();

  const existingThread = allThreads.find(
    (thread) =>
      thread.kind === 'specialist_direct' &&
      thread.participants.some((participant) => participant.userId === viewer.userId) &&
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

export function ensureClientThread(payload: EnsureClientThreadPayload): MessagesSnapshot {
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
      thread.participants.some((participant) => participant.userId === viewer.userId) &&
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

export function markMessagesAsRead(payload: MarkMessagesAsReadPayload): MessagesSnapshot {
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
  if (!isMockApiMode || typeof window === 'undefined') {
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
