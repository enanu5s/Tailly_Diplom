// src/features/messages/model/messagesViewer.ts
import type { MessagesViewer } from './types';

export function getMessagesViewerFromUser(user: unknown): MessagesViewer {
  if (typeof user !== 'object' || user === null) {
    return {
      userId: '',
      role: 'guest',
      displayName: 'Гость',
    };
  }

  const source = user as {
    id?: string;
    role?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
    avatarUrl?: string;
  };

  const fullName =
    `${source.firstName?.trim() ?? ''} ${source.lastName?.trim() ?? ''}`.trim();

  const displayName =
    fullName ||
    source.name?.trim() ||
    source.email?.trim() ||
    (source.role === 'admin' || source.role === 'super_admin'
      ? 'Администратор'
      : source.role === 'specialist'
        ? 'Специалист'
        : source.role === 'client'
          ? 'Клиент'
          : 'Пользователь');

  const role =
    source.role === 'client' ||
    source.role === 'specialist' ||
    source.role === 'admin' ||
    source.role === 'super_admin'
      ? source.role
      : 'guest';

  return {
    userId: source.id?.trim() ?? '',
    role,
    displayName,
    avatarUrl: source.avatarUrl?.trim() || undefined,
  };
}