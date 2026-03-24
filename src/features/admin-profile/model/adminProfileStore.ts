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
  birthDate: string;
};

type EmailChangePhase = 'credentials' | 'code';

function createInitialForm(): AdminProfileForm {
  return {
    firstName: '',
    lastName: '',
    middleName: '',
    phone: '',
    birthDate: '',
  };
}

function mapProfileToForm(profile: AdminProfile): AdminProfileForm {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    middleName: profile.middleName ?? '',
    phone: profile.phone ?? '',
    birthDate: profile.birthDate ?? '',
  };
}

function applyUpdatedProfileToAuth(updatedProfile: AdminProfile): void {
  authStore.updateUser({
    id: updatedProfile.id,
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
}

class AdminProfileStore {
  profile: AdminProfile | null = null;

  isLoading = false;
  loadError = '';

  isEditing = false;
  isSaving = false;
  saveError = '';

  form: AdminProfileForm = createInitialForm();

  isEmailChangeModalOpen = false;
  emailChangePhase: EmailChangePhase = 'credentials';
  emailChangeNewEmail = '';
  emailChangePassword = '';
  emailChangeCode = '';
  emailChangeError = '';
  emailChangeInfoMessage = '';
  emailChangeMockHint = '';
  isRequestingEmailChange = false;
  isConfirmingEmailChange = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isSuperAdmin(): boolean {
    return this.profile?.role === 'super_admin';
  }

  get canSubmit(): boolean {
    const base =
      !this.isSaving &&
      this.form.firstName.trim().length > 0 &&
      this.form.lastName.trim().length > 0;

    if (!base) {
      return false;
    }

    if (this.isSuperAdmin) {
      return this.form.birthDate.trim().length > 0;
    }

    return true;
  }

  get canSubmitEmailChangeRequest(): boolean {
    return (
      !this.isRequestingEmailChange &&
      this.emailChangeNewEmail.trim().includes('@') &&
      this.emailChangePassword.length > 0
    );
  }

  get canSubmitEmailChangeConfirm(): boolean {
    return (
      !this.isConfirmingEmailChange &&
      this.emailChangeCode.trim().length > 0
    );
  }

  setFormField<K extends keyof AdminProfileForm>(
    key: K,
    value: AdminProfileForm[K],
  ): void {
    this.form[key] = value;
  }

  setEmailChangeField(
    key: 'newEmail' | 'password' | 'code',
    value: string,
  ): void {
    if (key === 'newEmail') {
      this.emailChangeNewEmail = value;
    } else if (key === 'password') {
      this.emailChangePassword = value;
    } else {
      this.emailChangeCode = value;
    }
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

      applyUpdatedProfileToAuth(profile);
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
    this.form = this.profile
      ? mapProfileToForm(this.profile)
      : createInitialForm();
  }

  openEmailChangeModal(): void {
    if (!this.isSuperAdmin) {
      return;
    }

    void adminProfileService.cancelSuperAdminEmailChange();
    this.isEmailChangeModalOpen = true;
    this.emailChangePhase = 'credentials';
    this.emailChangeNewEmail = '';
    this.emailChangePassword = '';
    this.emailChangeCode = '';
    this.emailChangeError = '';
    this.emailChangeInfoMessage = '';
    this.emailChangeMockHint = '';
  }

  closeEmailChangeModal(): void {
    void adminProfileService.cancelSuperAdminEmailChange();
    this.isEmailChangeModalOpen = false;
    this.emailChangePhase = 'credentials';
    this.emailChangeNewEmail = '';
    this.emailChangePassword = '';
    this.emailChangeCode = '';
    this.emailChangeError = '';
    this.emailChangeInfoMessage = '';
    this.emailChangeMockHint = '';
  }

  backEmailChangeToCredentials(): void {
    void adminProfileService.cancelSuperAdminEmailChange();
    runInAction(() => {
      this.emailChangePhase = 'credentials';
      this.emailChangeCode = '';
      this.emailChangeError = '';
      this.emailChangeInfoMessage = '';
      this.emailChangeMockHint = '';
    });
  }

  async requestSuperAdminEmailChange(): Promise<void> {
    if (!this.canSubmitEmailChangeRequest) {
      return;
    }

    runInAction(() => {
      this.isRequestingEmailChange = true;
      this.emailChangeError = '';
      this.emailChangeInfoMessage = '';
      this.emailChangeMockHint = '';
    });

    try {
      const result = await adminProfileService.requestSuperAdminEmailChange({
        newEmail: this.emailChangeNewEmail.trim(),
        password: this.emailChangePassword,
      });

      runInAction(() => {
        this.emailChangePassword = '';
        this.emailChangePhase = 'code';
        this.emailChangeInfoMessage = result.message;
        this.emailChangeMockHint = result.mockCodeForDevelopment ?? '';
      });
    } catch (error) {
      runInAction(() => {
        this.emailChangeError =
          error instanceof Error
            ? error.message
            : 'Не удалось отправить код.';
      });
    } finally {
      runInAction(() => {
        this.isRequestingEmailChange = false;
      });
    }
  }

  async confirmSuperAdminEmailChange(): Promise<void> {
    if (!this.canSubmitEmailChangeConfirm) {
      return;
    }

    runInAction(() => {
      this.isConfirmingEmailChange = true;
      this.emailChangeError = '';
    });

    try {
      const updatedProfile =
        await adminProfileService.confirmSuperAdminEmailChange({
          code: this.emailChangeCode.trim(),
        });

      runInAction(() => {
        this.profile = updatedProfile;
        this.form = mapProfileToForm(updatedProfile);
        this.isEmailChangeModalOpen = false;
        this.emailChangePhase = 'credentials';
        this.emailChangeNewEmail = '';
        this.emailChangePassword = '';
        this.emailChangeCode = '';
        this.emailChangeError = '';
        this.emailChangeInfoMessage = '';
        this.emailChangeMockHint = '';
      });

      applyUpdatedProfileToAuth(updatedProfile);
    } catch (error) {
      runInAction(() => {
        this.emailChangeError =
          error instanceof Error
            ? error.message
            : 'Не удалось подтвердить смену email.';
      });
    } finally {
      runInAction(() => {
        this.isConfirmingEmailChange = false;
      });
    }
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
      };

      if (this.profile.role === 'super_admin') {
        payload.birthDate = this.form.birthDate.trim();
      }

      const updatedProfile = await adminProfileService.updateProfile(payload);

      runInAction(() => {
        this.profile = updatedProfile;
        this.form = mapProfileToForm(updatedProfile);
        this.isEditing = false;
      });

      applyUpdatedProfileToAuth(updatedProfile);
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
    void adminProfileService.cancelSuperAdminEmailChange();
    this.profile = null;
    this.isLoading = false;
    this.loadError = '';
    this.isEditing = false;
    this.isSaving = false;
    this.saveError = '';
    this.form = createInitialForm();
    this.isEmailChangeModalOpen = false;
    this.emailChangePhase = 'credentials';
    this.emailChangeNewEmail = '';
    this.emailChangePassword = '';
    this.emailChangeCode = '';
    this.emailChangeError = '';
    this.emailChangeInfoMessage = '';
    this.emailChangeMockHint = '';
    this.isRequestingEmailChange = false;
    this.isConfirmingEmailChange = false;
  }
}

export const adminProfileStore = new AdminProfileStore();
