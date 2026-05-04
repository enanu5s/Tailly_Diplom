// src/features/admin-specialists-management/model/adminSpecialistsManagementStore.ts

import { makeAutoObservable, runInAction } from 'mobx';

import {
  createEmptySpecialistApplicationQuestionnaire,
  type SpecialistApplication,
  type SpecialistApplicationQuestionnaire,
} from '@/features/specialist-applications/model/types';

import { adminSpecialistsManagementService } from '../service/adminSpecialistsManagementService';

type CreateSpecialistForm = {
  applicationId: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName: string;
  phone: string;
  city: string;
  about: string;
  questionnaire: SpecialistApplicationQuestionnaire;
  consent: boolean;
};

function createInitialForm(): CreateSpecialistForm {
  return {
    applicationId: '',
    email: '',
    firstName: '',
    lastName: '',
    middleName: '',
    phone: '',
    city: '',
    about: '',
    questionnaire: createEmptySpecialistApplicationQuestionnaire(),
    consent: false,
  };
}

function parseFullName(fullName: string): {
  lastName: string;
  firstName: string;
  middleName: string;
} {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  return {
    lastName: parts[0] ?? '',
    firstName: parts[1] ?? '',
    middleName: parts.slice(2).join(' '),
  };
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

class AdminSpecialistsManagementStore {
  isModalOpen = false;
  isCreating = false;
  createError = '';
  createdTemporaryPassword = '';
  createdEmail = '';
  createdSpecialistSlug = '';

  form: CreateSpecialistForm = createInitialForm();

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  openForApplication(application: SpecialistApplication): void {
    const name = parseFullName(application.fullName);

    this.form = {
      applicationId: application.id,
      email: application.email,
      firstName: name.firstName,
      lastName: name.lastName,
      middleName: name.middleName,
      phone: application.phone,
      city: application.city,
      about: application.about,
      questionnaire:
        application.questionnaire ?? createEmptySpecialistApplicationQuestionnaire(),
      consent: false,
    };

    this.isModalOpen = true;
    this.createError = '';
    this.createdTemporaryPassword = '';
    this.createdEmail = '';
    this.createdSpecialistSlug = '';
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.isCreating = false;
    this.createError = '';
    this.createdTemporaryPassword = '';
    this.createdEmail = '';
    this.createdSpecialistSlug = '';
    this.form = createInitialForm();
  }

  setFormField<K extends keyof CreateSpecialistForm>(
    key: K,
    value: CreateSpecialistForm[K],
  ): void {
    this.form[key] = value;
  }

  get canSubmit(): boolean {
    return (
      !this.isCreating &&
      this.form.applicationId.trim().length > 0 &&
      isValidEmail(this.form.email) &&
      this.form.firstName.trim().length > 0 &&
      this.form.lastName.trim().length > 0 &&
      this.form.city.trim().length > 0 &&
      this.form.about.trim().length > 0 &&
      this.form.consent
    );
  }

  async createSpecialistAccount(reviewedBy: string): Promise<{
    specialistId: string;
    specialistSlug?: string;
  } | null> {
    if (!this.canSubmit) {
      return null;
    }

    runInAction(() => {
      this.isCreating = true;
      this.createError = '';
      this.createdTemporaryPassword = '';
      this.createdEmail = '';
      this.createdSpecialistSlug = '';
    });

    try {
      const result = await adminSpecialistsManagementService.createSpecialistAccount({
        applicationId: this.form.applicationId,
        email: this.form.email.trim(),
        firstName: this.form.firstName.trim(),
        lastName: this.form.lastName.trim(),
        middleName: this.form.middleName.trim() || undefined,
        phone: this.form.phone.trim() || undefined,
        city: this.form.city.trim(),
        about: this.form.about.trim(),
        profileSeed: this.form.questionnaire,
        reviewedBy,
      });

      runInAction(() => {
        this.createdTemporaryPassword = result.temporaryPassword ?? '';
        this.createdEmail = result.account.email;
        this.createdSpecialistSlug = result.account.specialistSlug ?? '';
      });

      return {
        specialistId: result.account.specialistId,
        specialistSlug: result.account.specialistSlug,
      };
    } catch (error) {
      runInAction(() => {
        this.createError =
          error instanceof Error
            ? error.message
            : 'Не удалось создать кабинет специалиста.';
      });

      return null;
    } finally {
      runInAction(() => {
        this.isCreating = false;
      });
    }
  }
}

export const adminSpecialistsManagementStore = new AdminSpecialistsManagementStore();
