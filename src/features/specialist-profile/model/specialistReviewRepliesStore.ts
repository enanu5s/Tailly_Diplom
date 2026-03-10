// src/features/specialist-profile/model/specialistReviewRepliesStore.ts

import { makeAutoObservable, runInAction } from 'mobx';

import { specialistProfileService } from '../service/specialistProfileService';
import type { SpecialistReview } from './types';

type SaveReplyParams = {
    slug: string;
    review: SpecialistReview;
};

export class SpecialistReviewRepliesStore {
    editingReviewId: string | null = null;
    draftsByReviewId: Record<string, string> = {};
    errorsByReviewId: Record<string, string> = {};
    savingByReviewId: Record<string, boolean> = {};
    successByReviewId: Record<string, boolean> = {};

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    reset(): void {
        this.editingReviewId = null;
        this.draftsByReviewId = {};
        this.errorsByReviewId = {};
        this.savingByReviewId = {};
        this.successByReviewId = {};
    }

    isEditing(reviewId: string): boolean {
        return this.editingReviewId === reviewId;
    }

    isSaving(reviewId: string): boolean {
        return Boolean(this.savingByReviewId[reviewId]);
    }

    getDraft(review: SpecialistReview): string {
        const draft = this.draftsByReviewId[review.id];

        if (typeof draft === 'string') {
            return draft;
        }

        return review.specialistReply?.text ?? '';
    }

    getError(reviewId: string): string | null {
        return this.errorsByReviewId[reviewId] ?? null;
    }

    hasSuccess(reviewId: string): boolean {
        return Boolean(this.successByReviewId[reviewId]);
    }

    startEditing(review: SpecialistReview): void {
        this.editingReviewId = review.id;
        this.draftsByReviewId[review.id] = review.specialistReply?.text ?? '';
        delete this.errorsByReviewId[review.id];
        delete this.successByReviewId[review.id];
    }

    cancelEditing(reviewId: string): void {
        if (this.editingReviewId === reviewId) {
            this.editingReviewId = null;
        }

        delete this.errorsByReviewId[reviewId];
        delete this.successByReviewId[reviewId];
    }

    setDraft(reviewId: string, value: string): void {
        this.draftsByReviewId[reviewId] = value;
        delete this.errorsByReviewId[reviewId];
        delete this.successByReviewId[reviewId];
    }

    async saveReply({ slug, review }: SaveReplyParams): Promise<boolean> {
        const text = (this.draftsByReviewId[review.id] ?? review.specialistReply?.text ?? '').trim();

        if (text.length === 0) {
            this.errorsByReviewId[review.id] = 'Ответ не может быть пустым.';
            return false;
        }

        if (text.length > 2000) {
            this.errorsByReviewId[review.id] =
                'Ответ слишком длинный. Максимум 2000 символов.';
            return false;
        }

        this.savingByReviewId[review.id] = true;
        delete this.errorsByReviewId[review.id];
        delete this.successByReviewId[review.id];

        try {
            await specialistProfileService.upsertReviewReply(slug, {
                reviewId: review.id,
                text,
            });

            runInAction(() => {
                this.successByReviewId[review.id] = true;
                this.editingReviewId = null;
            });

            return true;
        } catch (error) {
            runInAction(() => {
                this.errorsByReviewId[review.id] =
                    error instanceof Error
                        ? error.message
                        : 'Не удалось сохранить ответ на отзыв.';
            });

            return false;
        } finally {
            runInAction(() => {
                this.savingByReviewId[review.id] = false;
            });
        }
    }
}

export const specialistReviewRepliesStore = new SpecialistReviewRepliesStore();