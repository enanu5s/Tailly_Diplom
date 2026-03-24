//src/features/pets/model/types.ts
export type PetType = 'dog' | 'cat' | 'other';
export type PetSize = 'xs' | 's' | 'm' | 'l' | 'xl';

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
