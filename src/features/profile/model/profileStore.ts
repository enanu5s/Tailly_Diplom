//src/features/profile/model/profileStore.ts

import { makeAutoObservable, runInAction } from 'mobx';

import { profileService } from '../service/profileService';

import type { UserProfile } from './types';

export class ProfileStore {
  profile: UserProfile | null = null;
  loading = false;
  error: string | null = null;

  editing = false;

  draftFirstName = '';
  draftLastName = '';
  draftMiddleName = '';
  draftAvatarUrl = '';

  draftCity = '';
  draftPhone = '';

  saveLoading = false;
  saveError: string | null = null;
  saveSuccess = false;

  constructor() {
    makeAutoObservable(this);
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      const profile = await profileService.getProfile();

      runInAction(() => {
        this.profile = profile;

        this.draftFirstName = profile.firstName;
        this.draftLastName = profile.lastName;
        this.draftMiddleName = profile.middleName ?? '';
        this.draftAvatarUrl = profile.avatarUrl ?? '';

        this.draftCity = profile.city;
        this.draftPhone = profile.phone;

        this.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error =
          error instanceof Error ? error.message : 'Не удалось загрузить профиль';
        this.loading = false;
      });
    }
  }

  startEdit(): void {
    if (!this.profile) {
      return;
    }

    this.editing = true;
    this.saveError = null;
    this.saveSuccess = false;

    this.draftFirstName = this.profile.firstName;
    this.draftLastName = this.profile.lastName;
    this.draftMiddleName = this.profile.middleName ?? '';
    this.draftAvatarUrl = this.profile.avatarUrl ?? '';

    this.draftCity = this.profile.city;
    this.draftPhone = this.profile.phone;
  }

  cancelEdit(): void {
    if (!this.profile) {
      return;
    }

    this.editing = false;
    this.saveError = null;
    this.saveSuccess = false;

    this.draftFirstName = this.profile.firstName;
    this.draftLastName = this.profile.lastName;
    this.draftMiddleName = this.profile.middleName ?? '';
    this.draftAvatarUrl = this.profile.avatarUrl ?? '';

    this.draftCity = this.profile.city;
    this.draftPhone = this.profile.phone;
  }

  setDraftFirstName(value: string): void {
    this.draftFirstName = value;
  }

  setDraftLastName(value: string): void {
    this.draftLastName = value;
  }

  setDraftMiddleName(value: string): void {
    this.draftMiddleName = value;
  }

  setAvatarFromFile(file: File): void {
    const url = URL.createObjectURL(file);
    this.draftAvatarUrl = url;
  }

  setDraftCity(value: string): void {
    this.draftCity = value;
  }

  setDraftPhone(value: string): void {
    this.draftPhone = value;
  }

  async save(): Promise<void> {
    if (!this.profile) {
      return;
    }

    const firstName = this.draftFirstName.trim();
    const lastName = this.draftLastName.trim();
    const middleName = this.draftMiddleName.trim();
    const avatarUrl = this.draftAvatarUrl.trim();

    const city = this.draftCity.trim();
    const phone = this.draftPhone.trim();

    if (!lastName) {
      this.saveError = 'Укажите фамилию';
      return;
    }

    if (!firstName) {
      this.saveError = 'Укажите имя';
      return;
    }

    if (!city) {
      this.saveError = 'Укажите город';
      return;
    }

    if (!phone) {
      this.saveError = 'Укажите телефон';
      return;
    }

    this.saveLoading = true;
    this.saveError = null;
    this.saveSuccess = false;

    try {
      const [updatedMain, updatedContacts] = await Promise.all([
        profileService.updateMain({
          firstName,
          lastName,
          middleName: middleName || undefined,
          avatarUrl: avatarUrl || undefined,
        }),
        profileService.updateContacts({ city, phone }),
      ]);

      const merged: UserProfile = {
        ...updatedContacts,
        firstName: updatedMain.firstName,
        lastName: updatedMain.lastName,
        middleName: updatedMain.middleName,
        avatarUrl: updatedMain.avatarUrl,
      };

      runInAction(() => {
        this.profile = merged;

        this.draftFirstName = merged.firstName;
        this.draftLastName = merged.lastName;
        this.draftMiddleName = merged.middleName ?? '';
        this.draftAvatarUrl = merged.avatarUrl ?? '';
        this.draftCity = merged.city;
        this.draftPhone = merged.phone;

        this.editing = false;
        this.saveLoading = false;
        this.saveSuccess = true;
      });
    } catch (error) {
      runInAction(() => {
        this.saveError =
          error instanceof Error ? error.message : 'Не удалось сохранить данные';
        this.saveLoading = false;
      });
    }
  }
}

export const profileStore = new ProfileStore();
