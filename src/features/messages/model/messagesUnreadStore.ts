// src/features/messages/model/messagesUnreadStore.ts
import { makeAutoObservable, runInAction } from 'mobx';

import { HttpError } from '@/shared/api/http';

import { messagesService } from '../service/messagesService';

import type { MessagesViewer } from './types';

class MessagesUnreadStore {
  unreadMessagesCount = 0;
  unreadThreadsCount = 0;
  loading = false;
  initializedForUserId: string | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  reset(): void {
    this.unreadMessagesCount = 0;
    this.unreadThreadsCount = 0;
    this.loading = false;
    this.initializedForUserId = null;
  }

  async refresh(viewer: MessagesViewer): Promise<void> {
    if (!viewer.userId.trim() || viewer.role === 'guest') {
      this.reset();
      return;
    }

    this.loading = true;

    try {
      const summary = await messagesService.getUnreadSummary(viewer);

      runInAction(() => {
        this.unreadMessagesCount = summary.unreadMessagesCount;
        this.unreadThreadsCount = summary.unreadThreadsCount;
        this.initializedForUserId = viewer.userId;
      });
    } catch (error) {
      if (error instanceof HttpError && (error.status === 404 || error.status === 401)) {
        console.warn('[messagesUnreadStore.refresh] fallback to zero unread:', error);

        runInAction(() => {
          this.unreadMessagesCount = 0;
          this.unreadThreadsCount = 0;
          this.initializedForUserId = viewer.userId;
        });

        return;
      }

      throw error;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
}

export const messagesUnreadStore = new MessagesUnreadStore();