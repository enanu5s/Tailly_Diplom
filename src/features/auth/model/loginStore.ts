// src/features/auth/model/loginStore.ts

import { makeAutoObservable, runInAction } from 'mobx';

import { authService } from '../service/authService';
import { authStore } from './authStore';
import { LoginError } from './types';

class LoginStore {
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

    get canSubmit(): boolean {
        return (
            !this.isSubmitting &&
            this.email.trim().length > 0 &&
            this.password.length > 0
        );
    }

    async submit(): Promise<boolean> {
        if (!this.canSubmit) {
            return false;
        }

        runInAction(() => {
            this.isSubmitting = true;
            this.submitError = '';
        });

        try {
            const result = await authService.login({
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
                if (error instanceof LoginError) {
                    this.submitError = error.message;
                    this.failedAttemptsLeft =
                        error.attemptsLeft ?? null;
                    this.lockUntil = error.lockUntil ?? null;
                } else if (error instanceof Error) {
                    this.submitError = error.message;
                } else {
                    this.submitError = 'Не удалось выполнить вход.';
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

export const loginStore = new LoginStore();