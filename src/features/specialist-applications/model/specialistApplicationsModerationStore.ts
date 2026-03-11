// src/features/specialist-applications/model/specialistApplicationsModerationStore.ts

import { makeAutoObservable, runInAction } from 'mobx';

import { specialistApplicationsService } from '../service/specialistApplicationsService';
import type { SpecialistApplication } from './types';

type ModerationDraft = {
    interviewDate: string;
    reviewComment: string;
};

function createDraft(): ModerationDraft {
    return {
        interviewDate: '',
        reviewComment: '',
    };
}

class SpecialistApplicationsModerationStore {
    applications: SpecialistApplication[] = [];
    isLoading = false;
    loadError = '';

    selectedApplicationId: string | null = null;

    draft: ModerationDraft = createDraft();

    isAssigningInterview = false;
    isRejecting = false;
    isApproving = false;
    actionError = '';

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    get sortedApplications(): SpecialistApplication[] {
        return [...this.applications].sort((left, right) => {
            return (
                new Date(right.createdAt).getTime() -
                new Date(left.createdAt).getTime()
            );
        });
    }

    get pendingApplications(): SpecialistApplication[] {
        return this.sortedApplications.filter(
            (item) =>
                item.status === 'pending_review' ||
                item.status === 'interview_assigned',
        );
    }

    get processedApplications(): SpecialistApplication[] {
        return this.sortedApplications.filter(
            (item) =>
                item.status === 'approved' || item.status === 'rejected',
        );
    }

    get selectedApplication(): SpecialistApplication | null {
        if (!this.selectedApplicationId) {
            return this.pendingApplications[0] ?? this.sortedApplications[0] ?? null;
        }

        return (
            this.applications.find(
                (item) => item.id === this.selectedApplicationId,
            ) ?? null
        );
    }

    selectApplication(applicationId: string): void {
        this.selectedApplicationId = applicationId;
        this.actionError = '';

        const selected =
            this.applications.find((item) => item.id === applicationId) ?? null;

        this.draft = {
            interviewDate: selected?.interviewDate ?? '',
            reviewComment: selected?.reviewComment ?? '',
        };
    }

    setDraftField<K extends keyof ModerationDraft>(
        key: K,
        value: ModerationDraft[K],
    ): void {
        this.draft[key] = value;
    }

    updateApplication(updated: SpecialistApplication): void {
        this.applications = this.applications.map((item) =>
            item.id === updated.id ? updated : item,
        );
        this.selectApplication(updated.id);
    }

    patchCreatedSpecialistAccount(params: {
        applicationId: string;
        specialistId: string;
        specialistSlug?: string;
    }): void {
        this.applications = this.applications.map((item) => {
            if (item.id !== params.applicationId) {
                return item;
            }

            return {
                ...item,
                createdSpecialistId: params.specialistId,
                createdSpecialistSlug: params.specialistSlug ?? null,
                specialistAccountCreatedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
        });

        this.selectApplication(params.applicationId);
    }

    async load(): Promise<void> {
        runInAction(() => {
            this.isLoading = true;
            this.loadError = '';
        });

        try {
            const applications =
                await specialistApplicationsService.getApplications();

            runInAction(() => {
                this.applications = applications;


                if (applications.length > 0) {
                    const nextSelectedId =
                        this.selectedApplicationId &&
                            applications.some(
                                (item) => item.id === this.selectedApplicationId,
                            )
                            ? this.selectedApplicationId
                            : applications[0]?.id ?? null;

                    this.selectedApplicationId = nextSelectedId;

                    const selected =
                        applications.find(
                            (item) => item.id === nextSelectedId,
                        ) ?? null;

                    this.draft = {
                        interviewDate: selected?.interviewDate ?? '',
                        reviewComment: selected?.reviewComment ?? '',
                    };
                } else {
                    this.selectedApplicationId = null;
                    this.draft = createDraft();
                }
            });
        } catch (error) {
            runInAction(() => {
                this.loadError =
                    error instanceof Error
                        ? error.message
                        : 'Не удалось загрузить заявки специалистов.';
            });
        } finally {
            runInAction(() => {
                this.isLoading = false;
            });
        }
    }

    async assignInterview(reviewedBy: string): Promise<void> {
        const selected = this.selectedApplication;

        if (!selected) {
            return;
        }

        if (!this.draft.interviewDate.trim()) {
            this.actionError = 'Укажи дату и время собеседования.';
            return;
        }

        runInAction(() => {
            this.isAssigningInterview = true;
            this.actionError = '';
        });

        try {
            const updated =
                await specialistApplicationsService.assignInterview({
                    applicationId: selected.id,
                    interviewDate: this.draft.interviewDate,
                    reviewComment: this.draft.reviewComment.trim() || undefined,
                    reviewedBy,
                });

            runInAction(() => {
                this.updateApplication(updated);
            });
        } catch (error) {
            runInAction(() => {
                this.actionError =
                    error instanceof Error
                        ? error.message
                        : 'Не удалось назначить собеседование.';
            });
        } finally {
            runInAction(() => {
                this.isAssigningInterview = false;
            });
        }
    }

    async rejectSelected(reviewedBy: string): Promise<void> {
        const selected = this.selectedApplication;

        if (!selected) {
            return;
        }

        if (!this.draft.reviewComment.trim()) {
            this.actionError = 'Для отклонения добавь комментарий.';
            return;
        }

        runInAction(() => {
            this.isRejecting = true;
            this.actionError = '';
        });

        try {
            const updated =
                await specialistApplicationsService.rejectApplication({
                    applicationId: selected.id,
                    reviewComment: this.draft.reviewComment.trim(),
                    reviewedBy,
                });

            runInAction(() => {
                this.updateApplication(updated);
            });
        } catch (error) {
            runInAction(() => {
                this.actionError =
                    error instanceof Error
                        ? error.message
                        : 'Не удалось отклонить заявку.';
            });
        } finally {
            runInAction(() => {
                this.isRejecting = false;
            });
        }
    }

    async approveSelected(reviewedBy: string): Promise<void> {
        const selected = this.selectedApplication;

        if (!selected) {
            return;
        }


        runInAction(() => {
            this.isApproving = true;
            this.actionError = '';
        });

        try {
            const updated =
                await specialistApplicationsService.approveApplication({
                    applicationId: selected.id,
                    reviewComment: this.draft.reviewComment.trim() || undefined,
                    reviewedBy,
                });

            runInAction(() => {
                this.updateApplication(updated);
            });
        } catch (error) {
            runInAction(() => {
                this.actionError =
                    error instanceof Error
                        ? error.message
                        : 'Не удалось одобрить заявку.';
            });
        } finally {
            runInAction(() => {
                this.isApproving = false;
            });
        }
    }
}

export const specialistApplicationsModerationStore =
    new SpecialistApplicationsModerationStore();