// src/features/specialist-profile/model/specialistProfileStore.ts

import { makeAutoObservable, runInAction } from 'mobx';

import { specialistProfileService } from '../service/specialistProfileService';
import type { SpecialistProfile, SpecialistReview } from './types';

const INITIAL_VISIBLE_REVIEWS_COUNT = 3;
const REVIEWS_LOAD_STEP = 3;

export class SpecialistProfileStore {
    profile: SpecialistProfile | null = null;
    isLoading = false;
    error: string | null = null;
    visibleReviewsCount = INITIAL_VISIBLE_REVIEWS_COUNT;
    loadedSlug: string | null = null;

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    get visibleReviews(): SpecialistReview[] {
        if (!this.profile) {
            return [];
        }

        return this.profile.reviews.slice(0, this.visibleReviewsCount);
    }

    get canLoadMoreReviews(): boolean {
        if (!this.profile) {
            return false;
        }

        return this.visibleReviewsCount < this.profile.reviews.length;
    }

    async load(slug: string): Promise<void> {
        if (!slug.trim()) {
            runInAction(() => {
                this.error = 'Некорректная ссылка на профиль специалиста.';
                this.profile = null;
                this.isLoading = false;
            });

            return;
        }

        this.isLoading = true;
        this.error = null;

        try {
            const profile = await specialistProfileService.getBySlug(slug);

            runInAction(() => {
                this.profile = profile;
                this.loadedSlug = slug;
                this.visibleReviewsCount = INITIAL_VISIBLE_REVIEWS_COUNT;
            });
        } catch (error) {
            runInAction(() => {
                this.profile = null;
                this.error =
                    error instanceof Error
                        ? error.message
                        : 'Не удалось загрузить профиль специалиста.';
            });
        } finally {
            runInAction(() => {
                this.isLoading = false;
            });
        }
    }

    loadMoreReviews(): void {
        if (!this.profile) {
            return;
        }

        this.visibleReviewsCount = Math.min(
            this.visibleReviewsCount + REVIEWS_LOAD_STEP,
            this.profile.reviews.length,
        );
    }

    reset(): void {
        this.profile = null;
        this.isLoading = false;
        this.error = null;
        this.visibleReviewsCount = INITIAL_VISIBLE_REVIEWS_COUNT;
        this.loadedSlug = null;
    }
}

export const specialistProfileStore = new SpecialistProfileStore();