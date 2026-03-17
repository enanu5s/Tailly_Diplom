//src/features/profileSecurity/emailChangeFlow/model/emailChangeFlowStore.ts
import { makeAutoObservable, runInAction } from 'mobx';

import { profileStore } from '@/features/profile/model/profileStore';

import { securityService } from '../../service/securityService';

import type { EmailChangeFlowState } from './types';

const LS_KEY = 'tailly:flow:email-change';

function loadFromLs(): EmailChangeFlowState | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as EmailChangeFlowState;
  } catch {
    return null;
  }
}

function saveToLs(state: EmailChangeFlowState) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function clearLs() {
  try {
    localStorage.removeItem(LS_KEY);
  } catch {
    // ignore
  }
}

export class EmailChangeFlowStore {
  state: EmailChangeFlowState = {
    step: 'request',
    requestId: null,
    maskedOldEmail: null,
  };

  loading = false;
  error: string | null = null;

  confirmLoading = false;
  confirmError: string | null = null;
  success = false;

  constructor() {
    makeAutoObservable(this);

    const saved = loadFromLs();
    if (saved) this.state = saved;
  }

  private setState(next: EmailChangeFlowState) {
    this.state = next;
    saveToLs(next);
  }

  resetFlow() {
    this.state = { step: 'request', requestId: null, maskedOldEmail: null };
    this.loading = false;
    this.error = null;
    this.confirmLoading = false;
    this.confirmError = null;
    this.success = false;
    clearLs();
  }

  async requestCode() {
    this.loading = true;
    this.error = null;
    try {
      const res = await securityService.requestEmailChangeCode();
      runInAction(() => {
        this.setState({ step: 'confirm', requestId: res.requestId, maskedOldEmail: res.maskedOldEmail });
        this.loading = false;
      });
    } catch (e) {
      runInAction(() => {
        this.error = e instanceof Error ? e.message : 'Не удалось отправить код';
        this.loading = false;
      });
    }
  }

  async confirm(payload: { code: string; newEmail: string }) {
    if (!this.state.requestId) {
      this.confirmError = 'Сначала запросите код';
      return;
    }

    const code = payload.code.trim();
    const newEmail = payload.newEmail.trim();

    if (code.length < 4) {
      this.confirmError = 'Введите код подтверждения';
      return;
    }
    if (!newEmail || !newEmail.includes('@')) {
      this.confirmError = 'Введите корректную почту';
      return;
    }

    this.confirmLoading = true;
    this.confirmError = null;

    try {
      await securityService.confirmEmailChange({ requestId: this.state.requestId, code, newEmail });
      runInAction(() => {
        this.success = true;
        this.setState({ ...this.state, step: 'done' });
        this.confirmLoading = false;

        // обновим email в профиле, если он загружен
        if (profileStore.profile) {
          profileStore.profile = { ...profileStore.profile, email: newEmail };
        }
      });
    } catch (e) {
      runInAction(() => {
        this.confirmError = e instanceof Error ? e.message : 'Не удалось подтвердить смену почты';
        this.confirmLoading = false;
      });
    }
  }
}

export const emailChangeFlowStore = new EmailChangeFlowStore();