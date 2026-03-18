// src/features/messages/ui/MessagesSection.tsx
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useRef } from 'react';
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import { useAuth } from '@/features/auth/model/useAuth';

import { getMessagesViewerFromUser } from '../model/messagesViewer';
import { messagesStore } from '../model/messagesStore';
import type { ChatMessage } from '../model/types';

import styles from './MessagesSection.module.css';

function formatTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function isAdminViewerRole(role: string): boolean {
  return role === 'admin' || role === 'super_admin';
}

function getReadKeyForViewer(
  viewer: ReturnType<typeof getMessagesViewerFromUser>,
): string {
  return isAdminViewerRole(viewer.role) ? 'support-team' : viewer.userId;
}

function isOwnMessageForViewer(
  message: ChatMessage,
  viewer: ReturnType<typeof getMessagesViewerFromUser>,
): boolean {
  if (message.authorRole === 'support') {
    return isAdminViewerRole(viewer.role);
  }

  return message.authorId === viewer.userId;
}

function isUnreadMessageForViewer(
  message: ChatMessage,
  viewer: ReturnType<typeof getMessagesViewerFromUser>,
): boolean {
  if (isOwnMessageForViewer(message, viewer)) {
    return false;
  }

  const readKey = getReadKeyForViewer(viewer);

  if (!readKey) {
    return false;
  }

  return !message.readByUserIds.includes(readKey);
}

function scrollToBottom(element: HTMLDivElement): void {
  element.scrollTop = element.scrollHeight;
}

export const MessagesSection = observer(() => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const messagesAreaRef = useRef<HTMLDivElement | null>(null);
  const previousThreadIdRef = useRef<string | null>(null);
  const previousMessagesLengthRef = useRef(0);
  const messageElementsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const firstUnreadMessageIdRef = useRef<string | null>(null);
  const pendingReadIdsRef = useRef<Set<string>>(new Set());
  const readTimerRef = useRef<number | null>(null);

  const viewer = useMemo(() => getMessagesViewerFromUser(user), [user]);

  const specialistIntent = useMemo(() => {
    const specialistId = searchParams.get('specialistId')?.trim() ?? '';
    const specialistSlug = searchParams.get('specialistSlug')?.trim() ?? '';
    const specialistName = searchParams.get('specialistName')?.trim() ?? '';
    const specialistAvatarUrl =
      searchParams.get('specialistAvatarUrl')?.trim() ?? '';

    if (!specialistId || !specialistSlug || !specialistName) {
      return null;
    }

    return {
      specialistId,
      specialistSlug,
      specialistName,
      specialistAvatarUrl: specialistAvatarUrl || undefined,
    };
  }, [searchParams]);

  useEffect(() => {
    if (!viewer.userId) {
      messagesStore.reset();
      return;
    }

    void messagesStore.init(viewer);
  }, [viewer]);

  useEffect(() => {
    if (!viewer.userId || !specialistIntent) {
      return;
    }

    void messagesStore
      .ensureSpecialistThread({
        viewer,
        specialistId: specialistIntent.specialistId,
        specialistSlug: specialistIntent.specialistSlug,
        specialistName: specialistIntent.specialistName,
        specialistAvatarUrl: specialistIntent.specialistAvatarUrl,
      })
      .finally(() => {
        navigate(
          {
            pathname: location.pathname,
          },
          { replace: true },
        );
      });
  }, [location.pathname, navigate, specialistIntent, viewer]);

  const { threads, activeThread, activeMessages, loading, error, draftMessage } =
    messagesStore;

  const unreadMessageIds = useMemo(() => {
    return activeMessages
      .filter((message) => isUnreadMessageForViewer(message, viewer))
      .map((message) => message.id);
  }, [activeMessages, viewer]);

  useEffect(() => {
    firstUnreadMessageIdRef.current = unreadMessageIds[0] ?? null;
  }, [unreadMessageIds]);

  useEffect(() => {
    const currentThreadId = messagesStore.activeThreadId;
    const previousThreadId = previousThreadIdRef.current;
    const isThreadChanged = currentThreadId !== previousThreadId;

    if (!isThreadChanged) {
      return;
    }

    previousThreadIdRef.current = currentThreadId;
    previousMessagesLengthRef.current = activeMessages.length;
    pendingReadIdsRef.current.clear();

    if (readTimerRef.current !== null) {
      window.clearTimeout(readTimerRef.current);
      readTimerRef.current = null;
    }

    requestAnimationFrame(() => {
      const messagesArea = messagesAreaRef.current;

      if (!messagesArea) {
        return;
      }

      const firstUnreadId = firstUnreadMessageIdRef.current;

      if (firstUnreadId) {
        const firstUnreadElement = messageElementsRef.current.get(firstUnreadId);

        if (firstUnreadElement) {
          const targetTop = firstUnreadElement.offsetTop - 16;
          messagesArea.scrollTop = Math.max(targetTop, 0);
          return;
        }
      }

      scrollToBottom(messagesArea);
    });
  }, [messagesStore.activeThreadId, activeMessages.length]);

  useEffect(() => {
    const element = messagesAreaRef.current;

    if (!element || !messagesStore.activeThreadId) {
      previousMessagesLengthRef.current = activeMessages.length;
      return;
    }

    const prevLength = previousMessagesLengthRef.current;
    const nextLength = activeMessages.length;
    const hasNewMessage = nextLength > prevLength;

    if (!hasNewMessage) {
      previousMessagesLengthRef.current = nextLength;
      return;
    }

    const lastMessage = activeMessages[nextLength - 1];
    const distanceToBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight;
    const wasNearBottom = distanceToBottom <= 140;
    const lastMessageIsOwn = lastMessage
      ? isOwnMessageForViewer(lastMessage, viewer)
      : false;

    previousMessagesLengthRef.current = nextLength;

    if (!lastMessage) {
      return;
    }

    if (lastMessageIsOwn || wasNearBottom) {
      requestAnimationFrame(() => {
        const target = messagesAreaRef.current;

        if (!target) {
          return;
        }

        scrollToBottom(target);
      });
    }
  }, [activeMessages, viewer, messagesStore.activeThreadId]);

  useEffect(() => {
    const root = messagesAreaRef.current;
    const activeThreadId = messagesStore.activeThreadId;

    if (!root || !activeThreadId || unreadMessageIds.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleUnreadIds: string[] = [];

        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const messageId = entry.target.getAttribute('data-message-id')?.trim();

          if (!messageId) {
            return;
          }

          if (!unreadMessageIds.includes(messageId)) {
            return;
          }

          visibleUnreadIds.push(messageId);
        });

        if (visibleUnreadIds.length === 0) {
          return;
        }

        visibleUnreadIds.forEach((messageId) =>
          pendingReadIdsRef.current.add(messageId),
        );

        if (readTimerRef.current !== null) {
          window.clearTimeout(readTimerRef.current);
        }

        readTimerRef.current = window.setTimeout(() => {
          const idsToMark = [...pendingReadIdsRef.current];
          pendingReadIdsRef.current.clear();
          readTimerRef.current = null;

          if (idsToMark.length === 0) {
            return;
          }

          void messagesStore.markMessagesAsRead({
            viewer,
            threadId: activeThreadId,
            messageIds: idsToMark,
          });
        }, 220);
      },
      {
        root,
        threshold: 0.7,
      },
    );

    unreadMessageIds.forEach((messageId) => {
      const element = messageElementsRef.current.get(messageId);

      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();

      if (readTimerRef.current !== null) {
        window.clearTimeout(readTimerRef.current);
        readTimerRef.current = null;
      }
    };
  }, [messagesStore.activeThreadId, unreadMessageIds, viewer]);

  return (
    <section className={styles.root}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Чаты</h2>
          <p className={styles.sidebarSubtitle}>
            Поддержка всегда наверху, личные диалоги — ниже
          </p>
        </div>

        <div className={styles.threadList}>
          {threads.map((thread) => {
            const isActive = thread.id === activeThread?.id;
            const hasUnread = thread.unreadCount > 0;

            return (
              <button
                key={thread.id}
                type="button"
                className={
                  isActive
                    ? styles.threadActive
                    : hasUnread
                      ? styles.threadUnread
                      : styles.thread
                }
                onClick={() => messagesStore.setActiveThread(thread.id)}
              >
                <div className={styles.threadTopRow}>
                  <span className={styles.threadTitle}>{thread.title}</span>
                  <span className={styles.threadTime}>
                    {formatTime(thread.updatedAt)}
                  </span>
                </div>

                <div className={styles.threadBottomRow}>
                  <span className={styles.threadPreview}>
                    {thread.lastMessagePreview || 'Сообщений пока нет'}
                  </span>

                  {hasUnread ? (
                    <span className={styles.unreadBadge}>{thread.unreadCount}</span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      <div className={styles.content}>
        {activeThread ? (
          <>
            <header className={styles.chatHeader}>
              <div>
                <h2 className={styles.chatTitle}>{activeThread.title}</h2>
                <p className={styles.chatSubtitle}>
                  {activeThread.kind === 'support'
                    ? 'Чат поддержки'
                    : 'Личный чат'}
                </p>
              </div>
            </header>

            <div ref={messagesAreaRef} className={styles.messagesArea}>
              {activeMessages.length > 0 ? (
                activeMessages.map((message) => {
                  const isOwnMessage = isOwnMessageForViewer(message, viewer);
                  const isUnread = isUnreadMessageForViewer(message, viewer);

                  const shouldShowSupportAgentName =
                    activeThread.kind === 'support' &&
                    message.authorRole === 'support' &&
                    Boolean(message.authorSupportAgentName);

                  return (
                    <div
                      key={message.id}
                      ref={(element) => {
                        if (element) {
                          messageElementsRef.current.set(message.id, element);
                        } else {
                          messageElementsRef.current.delete(message.id);
                        }
                      }}
                      data-message-id={message.id}
                      className={
                        isOwnMessage ? styles.messageOwn : styles.messageOther
                      }
                    >
                      <div
                        className={
                          isUnread
                            ? `${styles.messageBubble} ${styles.messageBubbleUnread}`
                            : styles.messageBubble
                        }
                      >
                        {shouldShowSupportAgentName ? (
                          <div className={styles.messageAuthor}>
                            {message.authorSupportAgentName}
                          </div>
                        ) : null}

                        <p className={styles.messageText}>{message.text}</p>

                        <span className={styles.messageTime}>
                          {formatTime(message.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className={styles.emptyMessages}>
                  В этом чате пока нет сообщений.
                </div>
              )}
            </div>

            <form
              className={styles.composer}
              onSubmit={(event) => {
                event.preventDefault();
                void messagesStore.sendActiveMessage({
                  viewer,
                });
              }}
            >
              <textarea
                className={styles.textarea}
                placeholder="Введите сообщение"
                value={draftMessage}
                onChange={(event) =>
                  messagesStore.setDraftMessage(event.target.value)
                }
                rows={4}
              />

              <div className={styles.composerFooter}>
                {error ? <span className={styles.error}>{error}</span> : <span />}
                <button
                  type="submit"
                  className={styles.sendButton}
                  disabled={loading || !draftMessage.trim()}
                >
                  Отправить
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className={styles.emptyState}>
            <h2 className={styles.emptyTitle}>Выберите чат</h2>
            <p className={styles.emptyText}>
              Здесь будут отображаться ваши диалоги с поддержкой и пользователями.
            </p>
          </div>
        )}
      </div>
    </section>
  );
});