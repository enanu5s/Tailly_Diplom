import { makeAutoObservable, runInAction } from 'mobx';

import { profileService } from '../service/profileService';

import type { UserProfile } from './types';

export class ProfileStore {
  profile: UserProfile | null = null;
  loading = false;
  error: string | null = null;

  editing = false;

  // drafts: main
  draftFirstName = '';
  draftLastName = '';
  draftAvatarUrl = '';

  // drafts: contacts
  draftCity = '';
  draftPhone = '';

  saveLoading = false;
  saveError: string | null = null;
  saveSuccess = false;

  constructor() {
    makeAutoObservable(this);
  }

  async load() {
    this.loading = true;
    this.error = null;
    try {
      const p = await profileService.getProfile();
      runInAction(() => {
        this.profile = p;

        this.draftFirstName = p.firstName;
        this.draftLastName = p.lastName;
        this.draftAvatarUrl = p.avatarUrl ?? '';

        this.draftCity = p.city;
        this.draftPhone = p.phone;

        this.loading = false;
      });
    } catch (e) {
      runInAction(() => {
        this.error = e instanceof Error ? e.message : 'Не удалось загрузить профиль';
        this.loading = false;
      });
    }
  }

  startEdit() {
    if (!this.profile) return;
    this.editing = true;
    this.saveError = null;
    this.saveSuccess = false;

    this.draftFirstName = this.profile.firstName;
    this.draftLastName = this.profile.lastName;
    this.draftAvatarUrl = this.profile.avatarUrl ?? '';

    this.draftCity = this.profile.city;
    this.draftPhone = this.profile.phone;
  }

  cancelEdit() {
    if (!this.profile) return;
    this.editing = false;
    this.saveError = null;
    this.saveSuccess = false;

    this.draftFirstName = this.profile.firstName;
    this.draftLastName = this.profile.lastName;
    this.draftAvatarUrl = this.profile.avatarUrl ?? '';

    this.draftCity = this.profile.city;
    this.draftPhone = this.profile.phone;
  }

  setDraftFirstName(v: string) {
    this.draftFirstName = v;
  }
  setDraftLastName(v: string) {
    this.draftLastName = v;
  }

  // локальный preview, потом backend заменит на upload
  setAvatarFromFile(file: File) {
    const url = URL.createObjectURL(file);
    this.draftAvatarUrl = url;
  }

  setDraftCity(v: string) {
    this.draftCity = v;
  }
  setDraftPhone(v: string) {
    this.draftPhone = v;
  }

  async save() {
    if (!this.profile) return;

    const firstName = this.draftFirstName.trim();
    const lastName = this.draftLastName.trim();
    const avatarUrl = (this.draftAvatarUrl ?? '').trim();

    const city = this.draftCity.trim();
    const phone = this.draftPhone.trim();

    if (!firstName) {
      this.saveError = 'Укажите имя';
      return;
    }
    if (!lastName) {
      this.saveError = 'Укажите фамилию';
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
        profileService.updateMain({ firstName, lastName, avatarUrl }),
        profileService.updateContacts({ city, phone }),
      ]);

      // собираем итоговый профиль (contacts+main)
      const merged: UserProfile = {
        ...updatedContacts,
        firstName: updatedMain.firstName,
        lastName: updatedMain.lastName,
        avatarUrl: updatedMain.avatarUrl,
      };

      runInAction(() => {
        this.profile = merged;
        this.editing = false;
        this.saveLoading = false;
        this.saveSuccess = true;
      });
    } catch (e) {
      runInAction(() => {
        this.saveError = e instanceof Error ? e.message : 'Не удалось сохранить данные';
        this.saveLoading = false;
      });
    }
  }
}

export const profileStore = new ProfileStore();