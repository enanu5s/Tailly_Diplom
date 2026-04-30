// src/features/pets/model/petsStore.ts
import { makeAutoObservable, runInAction } from 'mobx';

import { petsService } from '../service/petsService';
import type { Breed, CreatePetDto, Pet, PetType } from './types';

export class PetsStore {
  pets: Pet[] = [];
  breeds: Breed[] = [];

  loading = false;
  error: string | null = null;

  expanded = new Set<string>();
  editingId: string | null = null;
  draft: Pet | null = null;

  saveLoading = false;
  saveError: string | null = null;
  saveSuccessId: string | null = null;
  deleteLoadingId: string | null = null;
  deleteError: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async load() {
    this.loading = true;
    this.error = null;
    try {
      const [pets, breeds] = await Promise.all([
        petsService.getPets(),
        petsService.getBreeds(),
      ]);
      runInAction(() => {
        this.pets = pets;
        this.breeds = breeds;
        this.loading = false;
      });
    } catch (e) {
      runInAction(() => {
        this.error = e instanceof Error ? e.message : 'Не удалось загрузить питомцев';
        this.loading = false;
      });
    }
  }

  toggleExpand(id: string) {
    if (this.expanded.has(id)) this.expanded.delete(id);
    else this.expanded.add(id);
  }

  /** Создать нового питомца */
  startAdd() {
    const newDraft: CreatePetDto = {
      photoUrl: '',
      name: '',
      type: null,
      breedId: null,
      ageYears: 0,
      ageMonths: 0,
      size: null,
      gender: null,
      toOtherPets: null,
      toKidsUnder10: null,
      staysHomeAlone: null,
      vaccinated: null,
      notes: '',
    };

    this.draft = { ...newDraft, id: '' } as Pet;   // временный id
    this.editingId = null;                         // важно: null при создании
    this.saveError = null;
    this.saveSuccessId = null;
  }

  startEdit(id: string) {
    const p = this.pets.find((x) => x.id === id);
    if (!p) return;

    this.editingId = id;
    this.draft = JSON.parse(JSON.stringify(p)) as Pet;
    this.expanded.add(id);
    this.saveError = null;
    this.saveSuccessId = null;
  }

  cancelEdit() {
    this.editingId = null;
    this.draft = null;
    this.saveError = null;
    this.saveSuccessId = null;
  }

  setDraft<K extends keyof Pet>(key: K, value: Pet[K]) {
    if (!this.draft) return;
    (this.draft[key] as Pet[K]) = value;
  }

  setBreed(breedId: string | null) {
    if (!this.draft) return;
    this.draft.breedId = breedId;

    if (breedId) {
      const b = this.breeds.find((x) => x.id === breedId);
      if (b) this.draft.type = b.type;
    }
  }

  getBreedsForType(type: PetType | null): Breed[] {
    if (!type) return this.breeds;
    return this.breeds.filter((b) => b.type === type);
  }

  setDraftPhotoFromFile(file: File) {
    if (!this.draft) return;
    this.draft.photoUrl = URL.createObjectURL(file);
  }

  async save() {
    if (!this.draft) return;

    const name = this.draft.name.trim();
    if (!name) {
      this.saveError = 'Укажите кличку питомца';
      return;
    }
    if (this.draft.ageYears < 0 || this.draft.ageMonths < 0 || this.draft.ageMonths > 11) {
      this.saveError = 'Возраст указан некорректно';
      return;
    }

    this.saveLoading = true;
    this.saveError = null;

    try {
      let saved: Pet;

      if (!this.draft.id || this.draft.id === '') {
        // Создание
        const payload: CreatePetDto = {
          photoUrl: this.draft.photoUrl,
          name: this.draft.name,
          type: this.draft.type,
          breedId: this.draft.breedId,
          ageYears: this.draft.ageYears,
          ageMonths: this.draft.ageMonths,
          size: this.draft.size,
          gender: this.draft.gender,
          toOtherPets: this.draft.toOtherPets,
          toKidsUnder10: this.draft.toKidsUnder10,
          staysHomeAlone: this.draft.staysHomeAlone,
          vaccinated: this.draft.vaccinated,
          notes: this.draft.notes,
        };
        saved = await petsService.createPet(payload);
      } else {
        // Редактирование
        saved = await petsService.updatePet(this.draft.id, this.draft);
      }

      runInAction(() => {
        const idx = this.pets.findIndex((x) => x.id === saved.id);

        if (idx >= 0) {
          this.pets[idx] = saved;
        } else {
          this.pets = [saved, ...this.pets];
        }

        this.saveLoading = false;
        this.saveSuccessId = saved.id;
        this.editingId = null;
        this.draft = null;
      });
    } catch (e) {
      runInAction(() => {
        this.saveError = e instanceof Error ? e.message : 'Не удалось сохранить питомца';
        this.saveLoading = false;
      });
    }
  }

  async deletePet(id: string) {
    this.deleteLoadingId = id;
    this.deleteError = null;

    try {
      await petsService.deletePet(id);

      runInAction(() => {
        this.pets = this.pets.filter((p) => p.id !== id);
        this.expanded.delete(id);

        if (this.editingId === id) {
          this.cancelEdit();
        }

        this.deleteLoadingId = null;
      });
    } catch (e) {
      runInAction(() => {
        this.deleteError = e instanceof Error ? e.message : 'Не удалось удалить питомца';
        this.deleteLoadingId = null;
      });
    }
  }

  revealPet(id: string) {
    this.expanded.add(id);
  }
}

export const petsStore = new PetsStore();