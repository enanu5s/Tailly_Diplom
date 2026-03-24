// src/features/messages/ui/MessagesSection.tsx
import { observer } from 'mobx-react-lite';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

import { useAuth } from '@/features/auth/model/useAuth';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import styles from './MessagesSection.module.css';
import { messagesStore } from '../model/messagesStore';
import { getMessagesViewerFromUser } from '../model/messagesViewer';

import type { ChatMessage, MessageImageAttachment } from '../model/types';

type LightboxState = {
  attachments: MessageImageAttachment[];
  activeIndex: number;
};

type PointerStartState = {
  messageId: string;
  x: number;
  y: number;
};

type HighlightState = {
  messageId: string;
  token: number;
};

const MOBILE_SWIPE_MIN_DISTANCE = 72;
const MOBILE_SWIPE_MAX_VERTICAL_SHIFT = 36;
const HIGHLIGHT_DURATION_MS = 1800;
const DESKTOP_DOUBLE_CLICK_MAX_WIDTH = 1024;

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

function formatThreadPreview(preview: string): string {
  const normalizedPreview = preview.trim();
  return normalizedPreview || 'Сообщений пока нет';
}

function formatAttachmentCounter(count: number): string {
  if (count === 1) {
    return '1 фото';
  }

  return `${count} фото`;
}

function formatReplyPreviewText(message: {
  text?: string;
  attachmentsCount?: number;
}): string {
  const text = message.text?.trim() ?? '';
  const attachmentsCount = message.attachmentsCount ?? 0;

  if (text && attachmentsCount > 0) {
    return `${text} · Фото: ${attachmentsCount}`;
  }

  if (text) {
    return text;
  }

  if (attachmentsCount === 1) {
    return 'Фото';
  }

  if (attachmentsCount > 1) {
    return `Фото: ${attachmentsCount}`;
  }

  return 'Сообщение';
}

function isTouchLikeViewport(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia('(pointer: coarse)').matches;
}

export const MessagesSection = observer(() => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useAppNavigate();
  const location = useLocation();

  const messagesAreaRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const composerRef = useRef<HTMLFormElement | null>(null);
  const previousThreadIdRef = useRef<string | null>(null);
  const previousMessagesLengthRef = useRef(0);
  const messageElementsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const firstUnreadMessageIdRef = useRef<string | null>(null);
  const pendingReadIdsRef = useRef<Set<string>>(new Set());
  const readTimerRef = useRef<number | null>(null);
  const highlightTimerRef = useRef<number | null>(null);
  const pointerStartRef = useRef<PointerStartState | null>(null);

  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const [highlightedMessage, setHighlightedMessage] = useState<HighlightState | null>(
    null,
  );
  const [showScrollToBottomButton, setShowScrollToBottomButton] = useState(false);
  const [search, setSearch] = useState('');

  const viewer = useMemo(() => getMessagesViewerFromUser(user), [user]);

  const specialistIntent = useMemo(() => {
    const specialistId = searchParams.get('specialistId')?.trim() ?? '';
    const specialistSlug = searchParams.get('specialistSlug')?.trim() ?? '';
    const specialistName = searchParams.get('specialistName')?.trim() ?? '';
    const specialistAvatarUrl = searchParams.get('specialistAvatarUrl')?.trim() ?? '';

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

  const clientIntent = useMemo(() => {
    const clientId = searchParams.get('clientId')?.trim() ?? '';
    const clientName = searchParams.get('clientName')?.trim() ?? '';
    const clientAvatarUrl = searchParams.get('clientAvatarUrl')?.trim() ?? '';

    if (!clientId || !clientName) {
      return null;
    }

    return {
      clientId,
      clientName,
      clientAvatarUrl: clientAvatarUrl || undefined,
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
    if (!viewer.userId || !clientIntent || viewer.role !== 'specialist') {
      return;
    }

    void messagesStore
      .ensureClientThread({
        viewer,
        clientId: clientIntent.clientId,
        clientName: clientIntent.clientName,
        clientAvatarUrl: clientIntent.clientAvatarUrl,
      })
      .finally(() => {
        navigate(
          {
            pathname: location.pathname,
          },
          { replace: true },
        );
      });
  }, [clientIntent, location.pathname, navigate, viewer]);

  useEffect(() => {
    if (!viewer.userId || !specialistIntent) {
      return;
    }

    if (viewer.role === 'specialist' && clientIntent) {
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
  }, [clientIntent, location.pathname, navigate, specialistIntent, viewer]);

  const {
    threads,
    activeThread,
    activeThreadId,
    activeMessages,
    loading,
    error,
    draftMessage,
    draftAttachments,
    attachmentsLoading,
    canSendDraft,
    replyTo,
  } = messagesStore;

  const filteredThreads = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const supportThread = threads.find((thread) => thread.kind === 'support');
    const otherThreads = threads.filter((thread) => thread.kind !== 'support');

    const filteredOthers = normalizedSearch
      ? otherThreads.filter((thread) =>
          thread.title.toLowerCase().includes(normalizedSearch),
        )
      : otherThreads;

    return supportThread ? [supportThread, ...filteredOthers] : filteredOthers;
  }, [search, threads]);

  const activeLightboxAttachment = useMemo(() => {
    if (!lightbox) {
      return null;
    }

    return lightbox.attachments[lightbox.activeIndex] ?? null;
  }, [lightbox]);

  const unreadMessageIds = useMemo(() => {
    return activeMessages
      .filter((message) => isUnreadMessageForViewer(message, viewer))
      .map((message) => message.id);
  }, [activeMessages, viewer]);

  useEffect(() => {
    firstUnreadMessageIdRef.current = unreadMessageIds[0] ?? null;
  }, [unreadMessageIds]);

  useEffect(() => {
    const previousThreadId = previousThreadIdRef.current;
    const isThreadChanged = activeThreadId !== previousThreadId;

    if (!isThreadChanged) {
      return;
    }

    previousThreadIdRef.current = activeThreadId;
    previousMessagesLengthRef.current = activeMessages.length;
    pendingReadIdsRef.current.clear();
    pointerStartRef.current = null;
    setLightbox(null);
    setHighlightedMessage(null);

    if (readTimerRef.current !== null) {
      window.clearTimeout(readTimerRef.current);
      readTimerRef.current = null;
    }

    if (highlightTimerRef.current !== null) {
      window.clearTimeout(highlightTimerRef.current);
      highlightTimerRef.current = null;
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
  }, [activeThreadId, activeMessages.length]);

  useEffect(() => {
    const element = messagesAreaRef.current;

    if (!element || !activeThreadId) {
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
  }, [activeMessages, viewer, activeThreadId]);

  useEffect(() => {
    const root = messagesAreaRef.current;

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

        visibleUnreadIds.forEach((messageId) => pendingReadIdsRef.current.add(messageId));

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
  }, [activeThreadId, unreadMessageIds, viewer]);

  useEffect(() => {
    const root = messagesAreaRef.current;

    if (!root) {
      return;
    }

    const handleScroll = (): void => {
      const distanceToBottom = root.scrollHeight - root.scrollTop - root.clientHeight;

      setShowScrollToBottomButton(distanceToBottom > 200);
    };

    handleScroll();
    root.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      root.removeEventListener('scroll', handleScroll);
    };
  }, [activeThreadId, activeMessages.length]);

  useEffect(() => {
    if (!lightbox) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setLightbox(null);
        return;
      }

      if (event.key === 'ArrowLeft') {
        setLightbox((current) => {
          if (!current) {
            return current;
          }

          const nextIndex =
            current.activeIndex > 0
              ? current.activeIndex - 1
              : current.attachments.length - 1;

          return {
            ...current,
            activeIndex: nextIndex,
          };
        });
        return;
      }

      if (event.key === 'ArrowRight') {
        setLightbox((current) => {
          if (!current) {
            return current;
          }

          const nextIndex =
            current.activeIndex < current.attachments.length - 1
              ? current.activeIndex + 1
              : 0;

          return {
            ...current,
            activeIndex: nextIndex,
          };
        });
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightbox]);

  useEffect(() => {
    return () => {
      if (highlightTimerRef.current !== null) {
        window.clearTimeout(highlightTimerRef.current);
      }
    };
  }, []);

  const openLightbox = (
    attachments: MessageImageAttachment[],
    activeIndex: number,
  ): void => {
    if (attachments.length === 0) {
      return;
    }

    setLightbox({
      attachments,
      activeIndex,
    });
  };

  const closeLightbox = (): void => {
    setLightbox(null);
  };

  const showPreviousLightboxImage = (): void => {
    setLightbox((current) => {
      if (!current) {
        return current;
      }

      const nextIndex =
        current.activeIndex > 0
          ? current.activeIndex - 1
          : current.attachments.length - 1;

      return {
        ...current,
        activeIndex: nextIndex,
      };
    });
  };

  const showNextLightboxImage = (): void => {
    setLightbox((current) => {
      if (!current) {
        return current;
      }

      const nextIndex =
        current.activeIndex < current.attachments.length - 1
          ? current.activeIndex + 1
          : 0;

      return {
        ...current,
        activeIndex: nextIndex,
      };
    });
  };

  const scrollToMessageById = (
    messageId: string,
    options?: { highlight?: boolean; smooth?: boolean },
  ): void => {
    const element = messageElementsRef.current.get(messageId);
    const container = messagesAreaRef.current;

    if (!element || !container) {
      return;
    }

    const top = Math.max(element.offsetTop - 16, 0);

    container.scrollTo({
      top,
      behavior: options?.smooth === false ? 'auto' : 'smooth',
    });

    if (options?.highlight) {
      const token = Date.now();

      setHighlightedMessage({
        messageId,
        token,
      });

      if (highlightTimerRef.current !== null) {
        window.clearTimeout(highlightTimerRef.current);
      }

      highlightTimerRef.current = window.setTimeout(() => {
        setHighlightedMessage((current) => {
          if (!current || current.token !== token) {
            return current;
          }

          return null;
        });
      }, HIGHLIGHT_DURATION_MS);
    }
  };

  const handleReplySelect = (message: ChatMessage): void => {
    messagesStore.setReplyTarget(message);

    requestAnimationFrame(() => {
      composerRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  };

  const handleReplyPreviewClick = (): void => {
    if (!replyTo) {
      return;
    }

    scrollToMessageById(replyTo.messageId, {
      highlight: true,
    });
  };

  const handleSentReplyClick = (messageId: string): void => {
    scrollToMessageById(messageId, {
      highlight: true,
    });
  };

  const handleSend = (): void => {
    if (!canSendDraft || loading || attachmentsLoading) {
      return;
    }

    void messagesStore.sendActiveMessage({
      viewer,
    });
  };

  const handleMessagePointerDown = (
    event: ReactPointerEvent<HTMLDivElement>,
    messageId: string,
  ): void => {
    if (!isTouchLikeViewport()) {
      return;
    }

    pointerStartRef.current = {
      messageId,
      x: event.clientX,
      y: event.clientY,
    };
  };

  const handleMessagePointerUp = (
    event: ReactPointerEvent<HTMLDivElement>,
    message: ChatMessage,
  ): void => {
    if (!isTouchLikeViewport()) {
      return;
    }

    const start = pointerStartRef.current;
    pointerStartRef.current = null;

    if (!start || start.messageId !== message.id) {
      return;
    }

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;

    if (
      deltaX <= -MOBILE_SWIPE_MIN_DISTANCE &&
      Math.abs(deltaY) <= MOBILE_SWIPE_MAX_VERTICAL_SHIFT
    ) {
      handleReplySelect(message);
    }
  };

  return (
    <>
      <section className={styles.root}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h2 className={styles.sidebarTitle}>Чаты</h2>
            <p className={styles.sidebarSubtitle}>
              Поддержка всегда наверху, личные диалоги — ниже
            </p>

            <input
              type="text"
              className={styles.searchInput}
              placeholder="Поиск по ФИО"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className={styles.threadList}>
            {filteredThreads.length > 0 ? (
              filteredThreads.map((thread) => {
                const isActive = thread.id === activeThread?.id;
                const hasUnread = thread.unreadCount > 0;

                return (
                  <button
                    key={thread.id}
                    type="button"
                    className={[
                      isActive
                        ? styles.threadActive
                        : hasUnread
                          ? styles.threadUnread
                          : styles.thread,
                      thread.kind === 'support' ? styles.threadSupport : '',
                    ].join(' ')}
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
                        {formatThreadPreview(thread.lastMessagePreview)}
                      </span>

                      {hasUnread ? (
                        <span className={styles.unreadBadge}>{thread.unreadCount}</span>
                      ) : null}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className={styles.noThreadsFound}>
                По вашему запросу чаты не найдены.
              </div>
            )}
          </div>
        </aside>

        <div className={styles.content}>
          {activeThread ? (
            <>
              <header className={styles.chatHeader}>
                <div>
                  <h2 className={styles.chatTitle}>{activeThread.title}</h2>
                  <p className={styles.chatSubtitle}>
                    {activeThread.kind === 'support' ? 'Чат поддержки' : 'Личный чат'}
                  </p>
                </div>
              </header>

              <div className={styles.messagesViewport}>
                <div ref={messagesAreaRef} className={styles.messagesArea}>
                  {activeMessages.length > 0 ? (
                    activeMessages.map((message) => {
                      const isOwnMessage = isOwnMessageForViewer(message, viewer);
                      const isUnread = isUnreadMessageForViewer(message, viewer);

                      const shouldShowSupportAgentName =
                        activeThread.kind === 'support' &&
                        message.authorRole === 'support' &&
                        Boolean(message.authorSupportAgentName);

                      const isHighlighted = highlightedMessage?.messageId === message.id;

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
                          onDoubleClick={() => {
                            if (
                              typeof window !== 'undefined' &&
                              window.innerWidth > DESKTOP_DOUBLE_CLICK_MAX_WIDTH
                            ) {
                              handleReplySelect(message);
                            }
                          }}
                          onPointerDown={(event) =>
                            handleMessagePointerDown(event, message.id)
                          }
                          onPointerUp={(event) => handleMessagePointerUp(event, message)}
                        >
                          <div
                            className={
                              isHighlighted
                                ? `${styles.messageBubble} ${styles.messageBubbleHighlighted}`
                                : isUnread
                                  ? `${styles.messageBubble} ${styles.messageBubbleUnread}`
                                  : styles.messageBubble
                            }
                          >
                            {shouldShowSupportAgentName ? (
                              <div className={styles.messageAuthor}>
                                {message.authorSupportAgentName}
                              </div>
                            ) : null}

                            {message.replyTo ? (
                              <button
                                type="button"
                                className={styles.replyReference}
                                onClick={() =>
                                  handleSentReplyClick(message.replyTo!.messageId)
                                }
                              >
                                <span className={styles.replyReferenceAuthor}>
                                  {message.replyTo.authorName}
                                </span>
                                <span className={styles.replyReferenceText}>
                                  {formatReplyPreviewText(message.replyTo)}
                                </span>
                              </button>
                            ) : null}

                            {message.attachments.length > 0 ? (
                              <div
                                className={
                                  message.attachments.length === 1
                                    ? styles.attachmentsSingle
                                    : styles.attachmentsGrid
                                }
                              >
                                {message.attachments.map((attachment, index) => (
                                  <button
                                    key={attachment.id}
                                    type="button"
                                    className={styles.attachmentButton}
                                    onClick={() =>
                                      openLightbox(message.attachments, index)
                                    }
                                    aria-label={`Открыть фото ${attachment.name}`}
                                  >
                                    <img
                                      className={styles.attachmentImage}
                                      src={attachment.thumbnailUrl || attachment.url}
                                      alt={attachment.name}
                                      loading="lazy"
                                    />
                                  </button>
                                ))}
                              </div>
                            ) : null}

                            {message.text ? (
                              <p className={styles.messageText}>{message.text}</p>
                            ) : null}

                            <div className={styles.messageMeta}>
                              <span className={styles.messageTime}>
                                {formatTime(message.createdAt)}
                              </span>

                              <button
                                type="button"
                                className={styles.replyAction}
                                onClick={() => handleReplySelect(message)}
                                aria-label="Ответить на сообщение"
                              >
                                Ответить
                              </button>
                            </div>
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

                {showScrollToBottomButton ? (
                  <button
                    type="button"
                    className={styles.scrollToBottomButton}
                    onClick={() => {
                      const target = messagesAreaRef.current;

                      if (!target) {
                        return;
                      }

                      scrollToBottom(target);
                    }}
                    aria-label="Перейти к последним сообщениям"
                  >
                    ↓
                  </button>
                ) : null}
              </div>

              <form
                ref={composerRef}
                className={styles.composer}
                onSubmit={(event) => {
                  event.preventDefault();
                  handleSend();
                }}
              >
                {replyTo ? (
                  <div className={styles.replyComposerBar}>
                    <button
                      type="button"
                      className={styles.replyComposerContent}
                      onClick={handleReplyPreviewClick}
                    >
                      <span className={styles.replyComposerAuthor}>
                        Ответ на: {replyTo.authorName}
                      </span>
                      <span className={styles.replyComposerText}>
                        {formatReplyPreviewText(replyTo)}
                      </span>
                    </button>

                    <button
                      type="button"
                      className={styles.replyComposerClose}
                      onClick={() => messagesStore.clearReplyTarget()}
                      aria-label="Отменить ответ"
                    >
                      ×
                    </button>
                  </div>
                ) : null}

                {draftAttachments.length > 0 ? (
                  <div className={styles.draftAttachments}>
                    {draftAttachments.map((attachment) => (
                      <div key={attachment.id} className={styles.draftAttachmentCard}>
                        <img
                          className={styles.draftAttachmentImage}
                          src={attachment.thumbnailUrl || attachment.url}
                          alt={attachment.name}
                        />
                        <button
                          type="button"
                          className={styles.removeAttachmentButton}
                          onClick={() =>
                            messagesStore.removeDraftAttachment(attachment.id)
                          }
                          aria-label={`Удалить ${attachment.name}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}

                <textarea
                  className={styles.textarea}
                  placeholder="Введите сообщение"
                  value={draftMessage}
                  onChange={(event) => messagesStore.setDraftMessage(event.target.value)}
                  onKeyDown={(event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
                    if (
                      event.key === 'Enter' &&
                      !event.shiftKey &&
                      !event.nativeEvent.isComposing
                    ) {
                      event.preventDefault();
                      handleSend();
                    }
                  }}
                  rows={4}
                />

                <input
                  ref={fileInputRef}
                  className={styles.hiddenInput}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(event) => {
                    const files = Array.from(event.target.files ?? []);
                    void messagesStore.addDraftAttachments(files);
                    event.target.value = '';
                  }}
                />

                <div className={styles.composerFooter}>
                  <div className={styles.composerActions}>
                    <button
                      type="button"
                      className={styles.attachButton}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={loading || attachmentsLoading}
                    >
                      {attachmentsLoading ? 'Загрузка...' : 'Добавить фото'}
                    </button>

                    {draftAttachments.length > 0 ? (
                      <span className={styles.attachmentsCounter}>
                        {formatAttachmentCounter(draftAttachments.length)}
                      </span>
                    ) : null}
                  </div>

                  {error ? <span className={styles.error}>{error}</span> : <span />}

                  <button
                    type="submit"
                    className={styles.sendButton}
                    disabled={loading || attachmentsLoading || !canSendDraft}
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

      {lightbox && activeLightboxAttachment ? (
        <div
          className={styles.lightboxOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="Просмотр фото"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeLightbox();
            }
          }}
        >
          <div className={styles.lightboxContent}>
            <button
              type="button"
              className={styles.lightboxCloseButton}
              onClick={closeLightbox}
              aria-label="Закрыть просмотр"
            >
              ×
            </button>

            {lightbox.attachments.length > 1 ? (
              <button
                type="button"
                className={`${styles.lightboxNavButton} ${styles.lightboxNavButtonLeft}`}
                onClick={showPreviousLightboxImage}
                aria-label="Предыдущее фото"
              >
                ‹
              </button>
            ) : null}

            <img
              className={styles.lightboxImage}
              src={activeLightboxAttachment.url}
              alt={activeLightboxAttachment.name}
            />

            {lightbox.attachments.length > 1 ? (
              <button
                type="button"
                className={`${styles.lightboxNavButton} ${styles.lightboxNavButtonRight}`}
                onClick={showNextLightboxImage}
                aria-label="Следующее фото"
              >
                ›
              </button>
            ) : null}

            <div className={styles.lightboxFooter}>
              <span className={styles.lightboxFileName}>
                {activeLightboxAttachment.name}
              </span>

              {lightbox.attachments.length > 1 ? (
                <span className={styles.lightboxCounter}>
                  {lightbox.activeIndex + 1} / {lightbox.attachments.length}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
});
