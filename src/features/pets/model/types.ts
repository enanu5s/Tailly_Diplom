//src/features/pets/model/types.ts

/** Виды животных */
export type PetType =
  | 'dog'
  | 'cat'
  | 'bird'
  | 'rodent'
  | 'rabbit'
  | 'reptile'
  | 'fish'
  | 'amphibian';

/** Масса взрослого животного */
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
  id: string;                    // ← теперь обязательно (для редактирования)
  photoUrl: string;              // ← обязательно
  name: string;
  type: PetType | null;
  breedId: string | null;

  ageYears: number;
  ageMonths: number;

  size: PetSize | null;
  gender: PetGender | null;
  toOtherPets: PetAttitude | null;
  toKidsUnder10: PetAttitude | null;
  staysHomeAlone: PetHomeAlone | null;
  vaccinated: PetVaccinated | null;

  notes: string;
};

/** Тип для создания (без id) */
export type CreatePetDto = Omit<Pet, 'id'>;

export type Breed = {
  id: string;
  type: PetType;
  title: string;
};