// src/features/admin-auth/model/adminLoginStore.ts

import { makeAutoObservable, runInAction } from 'mobx';

import { authStore } from '@/features/auth/model/authStore';

import { AdminLoginError } from './types';
import { adminAuthService } from '../service/adminAuthService';

class AdminLoginStore {
    email = '';
    password = '';
    isSubmitting = false;
    submitError = '';
    failedAttemptsLeft: number | null = null;
    lockUntil: string | null = null;

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    setEmail(value: string): void {
        this.email = value;
    }

    setPassword(value: string): void {
        this.password = value;
    }

    resetFeedback(): void {
        this.submitError = '';
        this.failedAttemptsLeft = null;
        this.lockUntil = null;
    }

    get isLocked(): boolean {
        if (!this.lockUntil) {
            return false;
        }

        return new Date(this.lockUntil).getTime() > Date.now();
    }

    get canSubmit(): boolean {
        return !this.isSubmitting && this.email.trim().length > 0 && this.password.length > 0;
    }

    async submit(): Promise<boolean> {
        if (!this.canSubmit) {
            return false;
        }

        this.isSubmitting = true;
        this.submitError = '';

        try {
            const result = await adminAuthService.login({
                email: this.email.trim(),
                password: this.password,
            });

            authStore.setAuth(result.accessToken, result.user);

            runInAction(() => {
                this.failedAttemptsLeft = null;
                this.lockUntil = null;
            });

            return true;
        } catch (error) {
            runInAction(() => {
                if (error instanceof AdminLoginError) {
                    this.submitError = error.message;
                    this.failedAttemptsLeft = error.attemptsLeft ?? null;
                    this.lockUntil = error.lockUntil ?? null;
                } else if (error instanceof Error) {
                    this.submitError = error.message;
                } else {
                    this.submitError = 'Не удалось выполнить вход администратора.';
                }
            });

            return false;
        } finally {
            runInAction(() => {
                this.isSubmitting = false;
            });
        }
    }
}

export const adminLoginStore = new AdminLoginStore();