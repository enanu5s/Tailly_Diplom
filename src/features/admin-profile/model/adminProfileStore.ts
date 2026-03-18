// src/features/admin-profile/model/adminProfileStore.ts
import { makeAutoObservable, runInAction } from 'mobx';

import { authStore } from '@/features/auth/model/authStore';

import { adminProfileService } from '../service/adminProfileService';
import type {
  AdminProfile,
  UpdateAdminProfilePayload,
} from './types';

type AdminProfileForm = {
  firstName: string;
  lastName: string;
  middleName: string;
  phone: string;
  position: string;
  department: string;
};

function createInitialForm(): AdminProfileForm {
  return {
    firstName: '',
    lastName: '',
    middleName: '',
    phone: '',
    position: '',
    department: '',
  };
}

function mapProfileToForm(profile: AdminProfile): AdminProfileForm {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    middleName: profile.middleName ?? '',
    phone: profile.phone ?? '',
    position: profile.position ?? '',
    department: profile.department ?? '',
  };
}

class AdminProfileStore {
  profile: AdminProfile | null = null;

  isLoading = false;
  loadError = '';

  isEditing = false;
  isSaving = false;
  saveError = '';

  form: AdminProfileForm = createInitialForm();

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get canSubmit(): boolean {
    return (
      !this.isSaving &&
      this.form.firstName.trim().length > 0 &&
      this.form.lastName.trim().length > 0
    );
  }

  setFormField<K extends keyof AdminProfileForm>(
    key: K,
    value: AdminProfileForm[K],
  ): void {
    this.form[key] = value;
  }

  async load(): Promise<void> {
    runInAction(() => {
      this.isLoading = true;
      this.loadError = '';
    });

    try {
      const profile = await adminProfileService.getProfile();

      runInAction(() => {
        this.profile = profile;
        this.form = mapProfileToForm(profile);
      });

      authStore.updateUser({
        firstName: profile.firstName,
        lastName: profile.lastName,
        middleName: profile.middleName,
        phone: profile.phone,
        adminId: profile.adminId,
        email: profile.email,
        role: profile.role,
        name: [profile.lastName, profile.firstName, profile.middleName]
          .filter(Boolean)
          .join(' ')
          .trim(),
      });
    } catch (error) {
      runInAction(() => {
        this.loadError =
          error instanceof Error
            ? error.message
            : 'Не удалось загрузить профиль администратора.';
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  startEdit(): void {
    if (!this.profile) {
      return;
    }

    this.isEditing = true;
    this.saveError = '';
    this.form = mapProfileToForm(this.profile);
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.saveError = '';
    this.form = this.profile ? mapProfileToForm(this.profile) : createInitialForm();
  }

  async save(): Promise<void> {
    if (!this.profile || !this.canSubmit) {
      return;
    }

    runInAction(() => {
      this.isSaving = true;
      this.saveError = '';
    });

    try {
      const payload: UpdateAdminProfilePayload = {
        firstName: this.form.firstName.trim(),
        lastName: this.form.lastName.trim(),
        middleName: this.form.middleName.trim() || undefined,
        phone: this.form.phone.trim() || undefined,
        position: this.form.position.trim() || undefined,
        department: this.form.department.trim() || undefined,
      };

      const updatedProfile = await adminProfileService.updateProfile(payload);

      runInAction(() => {
        this.profile = updatedProfile;
        this.form = mapProfileToForm(updatedProfile);
        this.isEditing = false;
      });

      authStore.updateUser({
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        middleName: updatedProfile.middleName,
        phone: updatedProfile.phone,
        adminId: updatedProfile.adminId,
        email: updatedProfile.email,
        role: updatedProfile.role,
        name: [
          updatedProfile.lastName,
          updatedProfile.firstName,
          updatedProfile.middleName,
        ]
          .filter(Boolean)
          .join(' ')
          .trim(),
      });
    } catch (error) {
      runInAction(() => {
        this.saveError =
          error instanceof Error
            ? error.message
            : 'Не удалось сохранить профиль администратора.';
      });
    } finally {
      runInAction(() => {
        this.isSaving = false;
      });
    }
  }

  reset(): void {
    this.profile = null;
    this.isLoading = false;
    this.loadError = '';
    this.isEditing = false;
    this.isSaving = false;
    this.saveError = '';
    this.form = createInitialForm();
  }
}

export const adminProfileStore = new AdminProfileStore();