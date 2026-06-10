// src/shared/mock-db/seed/messages.seed.ts

import type { ChatMessage, StoredMessageThread } from '@/features/messages/model/types';

const weekAgo = Date.now() - 7 * 86_400_000;

export const SEED_MESSAGE_THREADS: StoredMessageThread[] = [
  {
    id: 'demo-thread-client1-specialist2',
    kind: 'specialist_direct',
    participants: [
      { userId: 'client-1', role: 'client', displayName: 'Елена Смирнова' },
      { userId: 'specialist-2', role: 'specialist', displayName: 'Игорь К.' },
    ],
    createdAt: new Date(weekAgo).toISOString(),
    updatedAt: new Date(weekAgo + 3_600_000).toISOString(),
    lastMessagePreview: 'Договорились, до субботы!',
  },
  {
    id: 'demo-thread-client3-specialist4',
    kind: 'specialist_direct',
    participants: [
      { userId: 'client-3', role: 'client', displayName: 'Ольга Новикова' },
      { userId: 'specialist-4', role: 'specialist', displayName: 'Дмитрий С.' },
    ],
    createdAt: new Date(weekAgo + 86_400_000).toISOString(),
    updatedAt: new Date(weekAgo + 90_000_000).toISOString(),
    lastMessagePreview: 'Фотоотчёт отправлю вечером.',
  },
  {
    id: 'demo-thread-support-client5',
    kind: 'support',
    participants: [
      { userId: 'client-5', role: 'client', displayName: 'Светлана Волкова' },
      { userId: 'support', role: 'support', displayName: 'Поддержка Тейлли' },
    ],
    createdAt: new Date(weekAgo + 172_800_000).toISOString(),
    updatedAt: new Date(weekAgo + 175_000_000).toISOString(),
    lastMessagePreview: 'Спасибо, разобрался с оплатой.',
  },
];

export const SEED_MESSAGES: ChatMessage[] = [
  {
    id: 'demo-msg-1',
    threadId: 'demo-thread-client1-specialist2',
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
    threadId: 'demo-thread-client1-specialist2',
    authorId: 'specialist-2',
    authorRole: 'specialist',
    authorName: 'Игорь К.',
    text: 'Да, суббота с 10:00 подойдёт.',
    attachments: [],
    createdAt: new Date(weekAgo + 120_000).toISOString(),
    readByUserIds: ['client-1', 'specialist-2'],
  },
  {
    id: 'demo-msg-3',
    threadId: 'demo-thread-client3-specialist4',
    authorId: 'client-3',
    authorRole: 'client',
    authorName: 'Ольга Новикова',
    text: 'Нужна передержка на выходные.',
    attachments: [],
    createdAt: new Date(weekAgo + 86_400_000).toISOString(),
    readByUserIds: ['client-3', 'specialist-4'],
  },
  {
    id: 'demo-msg-4',
    threadId: 'demo-thread-support-client5',
    authorId: 'client-5',
    authorRole: 'client',
    authorName: 'Светлана Волкова',
    text: 'Не могу найти заказ в истории.',
    attachments: [],
    createdAt: new Date(weekAgo + 172_800_000).toISOString(),
    readByUserIds: ['client-5', 'support'],
  },
  {
    id: 'demo-msg-5',
    threadId: 'demo-thread-support-client5',
    authorId: 'support',
    authorRole: 'support',
    authorName: 'Поддержка Тейлли',
    text: 'Проверьте раздел «Мои заказы» — заказ должен отображаться.',
    attachments: [],
    createdAt: new Date(weekAgo + 175_000_000).toISOString(),
    readByUserIds: ['client-5', 'support'],
  },
];
