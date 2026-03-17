// src/features/auth/data/mockRegister.ts

import type { City } from '../api/registerApi';

type MockRegisterState = {
  lastCode: string;
  registrationId: string;
  verificationToken: string;
  email: string;
  cities: City[];
};

const mockRegisterState: MockRegisterState = {
  lastCode: '123456',
  registrationId: 'reg_1',
  verificationToken: 'verif_1',
  email: '',
  cities: [
    { id: 'msk', name: 'Москва' },
    { id: 'spb', name: 'Санкт-Петербург' },
    { id: 'kzn', name: 'Казань' },
    { id: 'ekb', name: 'Екатеринбург' },
  ],
};

export function getMockRegisterState(): MockRegisterState {
  return mockRegisterState;
}

export function wait(delay = 400): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delay);
  });
}

export function cloneCities(): City[] {
  return JSON.parse(JSON.stringify(mockRegisterState.cities)) as City[];
}