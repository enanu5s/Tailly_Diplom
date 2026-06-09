// src/features/specialist-applications/model/specialistApplicationsModerationStore.ts

import { makeAutoObservable, runInAction } from 'mobx';

import {
  validateAdminInterviewSlot,
  validateOptionalAdminComment,
  validateRejectComment,
} from './specialistApplicationsModerationValidation';
import { specialistApplicationsService } from '../service/specialistApplicationsService';

import type { SpecialistApplication, SpecialistApplicationStatus } from './types';

export type SpecialistApplicationsStatusFilter = 'all' | SpecialistApplicationStatus;

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

  searchQuery = '';
  statusFilter: SpecialistApplicationsStatusFilter = 'all';

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
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    });
  }

  get filteredSortedApplications(): SpecialistApplication[] {
    const normalizedQuery = this.searchQuery.trim().toLowerCase();

    return this.sortedApplications.filter((item) => {
      if (this.statusFilter !== 'all' && item.status !== this.statusFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = [
        item.fullName,
        item.email,
        item.phone,
        item.city,
        item.about,
        item.id,
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }

  get pendingApplications(): SpecialistApplication[] {
    return this.sortedApplications.filter(
      (item) => item.status === 'pending_review' || item.status === 'interview_assigned',
    );
  }

  get processedApplications(): SpecialistApplication[] {
    return this.sortedApplications.filter(
      (item) => item.status === 'approved' || item.status === 'rejected',
    );
  }

  /** Собеседования, назначенные этим администратором (по строке reviewedBy), по времени. */
  getScheduledInterviewsForReviewer(adminKey: string): SpecialistApplication[] {
    const norm = adminKey.trim().toLowerCase();

    if (!norm) {
      return [];
    }

    return this.sortedApplications
      .filter(
        (item) =>
          item.status === 'interview_assigned' &&
          Boolean(item.interviewDate) &&
          (item.reviewedBy ?? '').trim().toLowerCase() === norm,
      )
      .sort(
        (a, b) =>
          new Date(a.interviewDate!).getTime() - new Date(b.interviewDate!).getTime(),
      );
  }

  get selectedApplication(): SpecialistApplication | null {
    if (!this.selectedApplicationId) {
      return null;
    }

    return (
      this.applications.find((item) => item.id === this.selectedApplicationId) ?? null
    );
  }

  get hasDraftChanges(): boolean {
    const selected = this.selectedApplication;

    if (!selected) {
      return false;
    }

    return (
      this.draft.interviewDate !== (selected.interviewDate ?? '') ||
      this.draft.reviewComment !== (selected.reviewComment ?? '')
    );
  }

  setSearchQuery(value: string): void {
    this.searchQuery = value;
    this.ensureSelectedInFilteredList();
  }

  setStatusFilter(value: SpecialistApplicationsStatusFilter): void {
    this.statusFilter = value;
    this.ensureSelectedInFilteredList();
  }

  ensureSelectedInFilteredList(): void {
    const list = this.filteredSortedApplications;

    if (list.length === 0) {
      this.selectedApplicationId = null;
      this.draft = createDraft();
      return;
    }

    const stillVisible =
      this.selectedApplicationId &&
      list.some((item) => item.id === this.selectedApplicationId);

    if (!stillVisible) {
      this.selectApplication(list[0]!.id);
    }
  }

  selectApplication(applicationId: string): void {
    this.selectedApplicationId = applicationId;
    this.actionError = '';

    const selected = this.applications.find((item) => item.id === applicationId) ?? null;

    this.draft = {
      interviewDate: selected?.interviewDate ?? '',
      reviewComment: selected?.reviewComment ?? '',
    };
  }

  toggleApplication(applicationId: string): void {
    if (this.selectedApplicationId === applicationId && !this.hasDraftChanges) {
      this.selectedApplicationId = null;
      this.actionError = '';
      this.draft = createDraft();
      return;
    }

    this.selectApplication(applicationId);
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
    this.ensureSelectedInFilteredList();
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
    this.ensureSelectedInFilteredList();
  }

  async load(): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.loadError = '';
    });

    try {
      const applications = await specialistApplicationsService.getApplications();

      runInAction(() => {
        this.applications = applications;

        if (applications.length > 0) {
          const nextSelectedId =
            this.selectedApplicationId &&
            applications.some((item) => item.id === this.selectedApplicationId)
              ? this.selectedApplicationId
              : (this.sortedApplications[0]?.id ?? null);

          this.selectedApplicationId = nextSelectedId;

          const selected =
            applications.find((item) => item.id === nextSelectedId) ?? null;

          this.draft = {
            interviewDate: selected?.interviewDate ?? '',
            reviewComment: selected?.reviewComment ?? '',
          };
        } else {
          this.selectedApplicationId = null;
          this.draft = createDraft();
        }

        this.ensureSelectedInFilteredList();
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

    const slotError = validateAdminInterviewSlot(
      this.applications,
      reviewedBy,
      this.draft.interviewDate,
      selected.id,
    );

    if (slotError) {
      this.actionError = slotError;
      return;
    }

    const commentError = validateOptionalAdminComment(this.draft.reviewComment);

    if (commentError) {
      this.actionError = commentError;
      return;
    }

    runInAction(() => {
      this.isAssigningInterview = true;
      this.actionError = '';
    });

    try {
      const reviewComment = this.draft.reviewComment.trim() || 'Собеседование назначено.';

      const updated = await specialistApplicationsService.assignInterview({
        applicationId: selected.id,
        interviewDate: this.draft.interviewDate,
        reviewComment,
        reviewedBy,
      });

      runInAction(() => {
        this.updateApplication(updated);
      });
    } catch (error) {
      runInAction(() => {
        this.actionError =
          error instanceof Error ? error.message : 'Не удалось назначить собеседование.';
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

    const rejectError = validateRejectComment(this.draft.reviewComment);

    if (rejectError) {
      this.actionError = rejectError;
      return;
    }

    runInAction(() => {
      this.isRejecting = true;
      this.actionError = '';
    });

    try {
      const updated = await specialistApplicationsService.rejectApplication({
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
          error instanceof Error ? error.message : 'Не удалось отклонить заявку.';
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

    const approveCommentError = validateOptionalAdminComment(this.draft.reviewComment);

    if (approveCommentError) {
      this.actionError = approveCommentError;
      return;
    }

    runInAction(() => {
      this.isApproving = true;
      this.actionError = '';
    });

    try {
      const updated = await specialistApplicationsService.approveApplication({
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
          error instanceof Error ? error.message : 'Не удалось одобрить заявку.';
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
