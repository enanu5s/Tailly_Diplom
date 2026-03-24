// src/features/messages/model/messagesStore.ts
import { makeAutoObservable, runInAction } from 'mobx';

import { messagesUnreadStore } from './messagesUnreadStore';
import { messagesService } from '../service/messagesService';

import type {
  ChatMessage,
  DraftMessageImageAttachment,
  EnsureClientThreadPayload,
  MessageReplyPreview,
  MessageThread,
  MessagesSnapshot,
  MessagesViewer,
} from './types';

function buildReplyPreview(message: ChatMessage): MessageReplyPreview {
  return {
    messageId: message.id,
    authorName:
      message.authorSupportAgentName?.trim() ||
      message.authorName.trim() ||
      'Пользователь',
    text: message.text.trim(),
    attachmentsCount: message.attachments.length,
  };
}

class MessagesStore {
  threads: MessageThread[] = [];
  messages: ChatMessage[] = [];
  activeThreadId: string | null = null;
  loading = false;
  initializedForUserId: string | null = null;
  error: string | null = null;
  draftMessage = '';
  draftAttachments: DraftMessageImageAttachment[] = [];
  attachmentsLoading = false;
  replyTo: MessageReplyPreview | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get activeThread(): MessageThread | null {
    if (!this.activeThreadId) {
      return this.threads[0] ?? null;
    }

    return (
      this.threads.find((thread) => thread.id === this.activeThreadId) ?? null
    );
  }

  get activeMessages(): ChatMessage[] {
    const activeThread = this.activeThread;

    if (!activeThread) {
      return [];
    }

    return this.messages.filter(
      (message) => message.threadId === activeThread.id,
    );
  }

  get canSendDraft(): boolean {
    return Boolean(this.draftMessage.trim()) || this.draftAttachments.length > 0;
  }

  setDraftMessage(value: string): void {
    this.draftMessage = value;
  }

  clearError(): void {
    this.error = null;
  }

  setReplyTarget(message: ChatMessage): void {
    this.replyTo = buildReplyPreview(message);
  }

  clearReplyTarget(): void {
    this.replyTo = null;
  }

  async addDraftAttachments(files: File[]): Promise<void> {
    if (files.length === 0) {
      return;
    }

    this.attachmentsLoading = true;
    this.error = null;

    try {
      const nextAttachments = await messagesService.prepareDraftImageAttachments(
        files,
        this.draftAttachments.length,
      );

      runInAction(() => {
        this.draftAttachments = [...this.draftAttachments, ...nextAttachments];
      });
    } catch (error) {
      runInAction(() => {
        this.error =
          error instanceof Error
            ? error.message
            : 'Не удалось загрузить фотографии.';
      });
    } finally {
      runInAction(() => {
        this.attachmentsLoading = false;
      });
    }
  }

  removeDraftAttachment(attachmentId: string): void {
    this.draftAttachments = this.draftAttachments.filter(
      (attachment) => attachment.id !== attachmentId,
    );
  }

  clearDraftAttachments(): void {
    this.draftAttachments = [];
  }

  setActiveThread(threadId: string): void {
    this.activeThreadId = threadId;
    this.replyTo = null;
  }

  reset(): void {
    this.threads = [];
    this.messages = [];
    this.activeThreadId = null;
    this.loading = false;
    this.initializedForUserId = null;
    this.error = null;
    this.draftMessage = '';
    this.draftAttachments = [];
    this.attachmentsLoading = false;
    this.replyTo = null;
    messagesUnreadStore.reset();
  }

  private async syncUnread(viewer: MessagesViewer): Promise<void> {
    await messagesUnreadStore.refresh(viewer);
  }

  private applySnapshot(
    viewer: MessagesViewer,
    snapshot: MessagesSnapshot,
    preferredThreadId?: string | null,
  ): void {
    this.threads = snapshot.threads;
    this.messages = snapshot.messages;
    this.initializedForUserId = viewer.userId;

    const hasPreferredThread =
      Boolean(preferredThreadId) &&
      snapshot.threads.some((thread) => thread.id === preferredThreadId);

    this.activeThreadId = hasPreferredThread
      ? preferredThreadId ?? null
      : snapshot.threads[0]?.id ?? null;
  }

  async init(viewer: MessagesViewer): Promise<void> {
    if (!viewer.userId.trim() || viewer.role === 'guest') {
      this.reset();
      return;
    }

    if (this.loading) {
      return;
    }

    if (this.initializedForUserId === viewer.userId && this.threads.length > 0) {
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      const snapshot = await messagesService.ensureSupportThread({
        viewer,
      });

      runInAction(() => {
        this.applySnapshot(viewer, snapshot, this.activeThreadId);
      });

      await this.syncUnread(viewer);
    } catch (error) {
      runInAction(() => {
        this.error =
          error instanceof Error
            ? error.message
            : 'Не удалось загрузить сообщения.';
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async ensureSpecialistThread(params: {
    viewer: MessagesViewer;
    specialistId: string;
    specialistSlug: string;
    specialistName: string;
    specialistAvatarUrl?: string;
  }): Promise<void> {
    if (!params.viewer.userId.trim() || !params.specialistId.trim()) {
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      const snapshot = await messagesService.ensureSpecialistThread({
        viewer: params.viewer,
        specialistId: params.specialistId,
        specialistSlug: params.specialistSlug,
        specialistName: params.specialistName,
        specialistAvatarUrl: params.specialistAvatarUrl,
      });

      const targetThread = snapshot.threads.find(
        (thread) =>
          thread.kind === 'specialist_direct' &&
          thread.participants.some(
            (participant) => participant.userId === params.viewer.userId,
          ) &&
          thread.participants.some(
            (participant) => participant.userId === params.specialistId,
          ),
      );

      runInAction(() => {
        this.applySnapshot(
          params.viewer,
          snapshot,
          targetThread?.id ?? null,
        );
      });

      await this.syncUnread(params.viewer);
    } catch (error) {
      runInAction(() => {
        this.error =
          error instanceof Error
            ? error.message
            : 'Не удалось открыть чат со специалистом.';
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async startChatWithSpecialist(params: {
    viewer: MessagesViewer;
    specialistId: string;
    specialistSlug: string;
    specialistName: string;
    specialistAvatarUrl?: string;
  }): Promise<void> {
    await this.ensureSpecialistThread(params);
  }

  async ensureClientThread(params: EnsureClientThreadPayload): Promise<void> {
    if (
      params.viewer.role !== 'specialist' ||
      !params.viewer.userId.trim() ||
      !params.clientId.trim()
    ) {
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      const snapshot = await messagesService.ensureClientThread(params);

      const targetThread = snapshot.threads.find(
        (thread) =>
          thread.kind === 'specialist_direct' &&
          thread.participants.some(
            (participant) => participant.userId === params.viewer.userId,
          ) &&
          thread.participants.some(
            (participant) => participant.userId === params.clientId.trim(),
          ),
      );

      runInAction(() => {
        this.applySnapshot(
          params.viewer,
          snapshot,
          targetThread?.id ?? null,
        );
      });

      await this.syncUnread(params.viewer);
    } catch (error) {
      runInAction(() => {
        this.error =
          error instanceof Error
            ? error.message
            : 'Не удалось открыть чат с клиентом.';
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async startChatWithClient(params: EnsureClientThreadPayload): Promise<void> {
    await this.ensureClientThread(params);
  }

  async markMessagesAsRead(params: {
    viewer: MessagesViewer;
    threadId: string;
    messageIds: string[];
  }): Promise<void> {
    if (
      !params.viewer.userId.trim() ||
      !params.threadId.trim() ||
      params.messageIds.length === 0
    ) {
      return;
    }

    try {
      const snapshot = await messagesService.markMessagesAsRead({
        viewer: params.viewer,
        threadId: params.threadId,
        messageIds: params.messageIds,
      });

      runInAction(() => {
        this.applySnapshot(params.viewer, snapshot, params.threadId);
      });

      await this.syncUnread(params.viewer);
    } catch (error) {
      runInAction(() => {
        this.error =
          error instanceof Error
            ? error.message
            : 'Не удалось отметить сообщения как прочитанные.';
      });
    }
  }

  async sendActiveMessage(params: { viewer: MessagesViewer }): Promise<void> {
    const text = this.draftMessage.trim();
    const activeThread = this.activeThread;
    const attachments = messagesService.stripDraftAttachmentFiles(
      this.draftAttachments,
    );
    const replyTo = this.replyTo ?? undefined;

    if (
      !params.viewer.userId.trim() ||
      !activeThread ||
      (!text && attachments.length === 0)
    ) {
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      const snapshot = await messagesService.sendMessage({
        viewer: params.viewer,
        threadId: activeThread.id,
        text,
        attachments,
        replyTo,
      });

      runInAction(() => {
        this.applySnapshot(params.viewer, snapshot, activeThread.id);
        this.draftMessage = '';
        this.draftAttachments = [];
        this.replyTo = null;
      });

      await this.syncUnread(params.viewer);
    } catch (error) {
      runInAction(() => {
        this.error =
          error instanceof Error
            ? error.message
            : 'Не удалось отправить сообщение.';
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
}

export const messagesStore = new MessagesStore();