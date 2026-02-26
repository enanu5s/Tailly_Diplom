//src/features/pets/model/petsStore.ts
import { makeAutoObservable, runInAction } from 'mobx';
import type { Breed, Pet, PetType } from './types';
import { petsService } from '../service/petsService';

function newPetId() {
  return `p-${Math.random().toString(16).slice(2)}`;
}

export class PetsStore {
  pets: Pet[] = [];
  breeds: Breed[] = [];

  loading = false;
  error: string | null = null;

  expanded = new Set<string>(); // раскрыта ли доп. инфа
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
      const [pets, breeds] = await Promise.all([petsService.getPets(), petsService.getBreeds()]);
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

  startAdd() {
    const pet: Pet = {
      id: newPetId(),
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
    this.editingId = pet.id;
    this.draft = pet;
    this.saveError = null;
    this.saveSuccessId = null;
  }

  startEdit(id: string) {
    const p = this.pets.find((x) => x.id === id);
    if (!p) return;
    this.editingId = id;
    this.draft = JSON.parse(JSON.stringify(p)) as Pet;
    this.saveError = null;
    this.saveSuccessId = null;
  }

  cancelEdit() {
    this.editingId = null;
    this.draft = null;
    this.saveError = null;
  }

  setDraft<K extends keyof Pet>(key: K, value: Pet[K]) {
    if (!this.draft) return;
    (this.draft[key] as Pet[K]) = value;
  }

  // если выбрали породу — проставляем тип *//
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

  // фото: локальный preview, потом backend заменит на upload *//
  setDraftPhotoFromFile(file: File) {
    if (!this.draft) return;
    const url = URL.createObjectURL(file);
    this.draft.photoUrl = url;
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
      const payload: Pet = JSON.parse(JSON.stringify(this.draft));
      const saved = await petsService.upsertPet(payload);
      runInAction(() => {
        const idx = this.pets.findIndex((x) => x.id === saved.id);
        if (idx >= 0) this.pets[idx] = saved;
        else this.pets = [saved, ...this.pets];

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
          this.editingId = null;
          this.draft = null;
          this.saveError = null;
          this.saveSuccessId = null;
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

  /** для клика из заказа: раскрыть карточку питомца */
  revealPet(id: string) {
    this.expanded.add(id);
  }
}

export const petsStore = new PetsStore();