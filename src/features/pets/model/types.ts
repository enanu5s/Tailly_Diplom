//src/features/pets/model/types.ts

/** Виды животных (без общего «другое» — перечислены отдельно). */
export type PetType =
  | 'dog'
  | 'cat'
  | 'bird'
  | 'rodent'
  | 'rabbit'
  | 'reptile'
  | 'fish'
  | 'amphibian';

/**
 * Масса взрослого животного, кг (диапазоны).
 * Для лёгких питомцев обычно актуальны первые категории.
 */
export type PetSize =
  | 'up_to_2kg'
  | '2_5kg'
  | '5_10kg'
  | '10_20kg'
  | 'over_20kg';

export type PetGender = 'male' | 'female';
export type PetAttitude = 'friendly' | 'neutral' | 'aggressive' | 'unknown';
export type PetHomeAlone = 'ok' | 'not_ok' | 'unknown';
export type PetVaccinated = 'yes' | 'no' | 'unknown';

export type Pet = {
  id: string;
  photoUrl?: string;
  name: string;
  type: PetType | null;
  breedId: string | null;

  ageYears: number;
  ageMonths: number;

  /** Оценочная масса взрослого животного (кг), по диапазонам */
  size: PetSize | null;

  gender: PetGender | null;
  toOtherPets: PetAttitude | null;
  toKidsUnder10: PetAttitude | null;
  staysHomeAlone: PetHomeAlone | null;
  vaccinated: PetVaccinated | null;

  notes: string;
};

export type Breed = {
  id: string;
  type: PetType;
  title: string;
};
