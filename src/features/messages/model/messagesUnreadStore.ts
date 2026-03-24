// src/features/messages/model/messagesUnreadStore.ts
import { makeAutoObservable, runInAction } from 'mobx';

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
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
}

export const messagesUnreadStore = new MessagesUnreadStore();
