// src/shared/mock-db/seed/demoDataset.seed.ts
/** Общие демо-пароли и списки аккаунтов для расширенного mock-набора данных */

import type { MockAdminAccount } from '@/features/admin-auth/data/mockAdminAccounts';
import type { MockAuthAccount } from '@/features/auth/data/mockAuthAccounts';
import type { Pet } from '@/features/pets/model/types';
import type { UserProfile } from '@/features/profile/model/types';
import type { ManagedAdmin } from '@/features/super-admin-admins-management/model/types';
import type { ManagedSpecialistMockAccount } from '@/shared/lib/mock/specialistAccountsStorage';

/** Пароль для клиентов и специалистов (вход через /login) */
export const DEMO_CLIENT_SPECIALIST_PASSWORD = '123456';

/** Пароль для входа в админ-панель (страница логина администратора) */
export const DEMO_ADMIN_PANEL_PASSWORD = 'Admin123!';

/** Пароль главного администратора (админ-панель и общий /login с ролью super_admin) */
export const DEMO_SUPER_ADMIN_PANEL_PASSWORD = 'SuperAdmin123!';

const FIRST_NAMES = [
  'Алексей',
  'Ольга',
  'Дмитрий',
  'Светлана',
  'Игорь',
  'Наталья',
  'Павел',
  'Татьяна',
  'Сергей',
  'Юлия',
  'Андрей',
  'Екатерина',
  'Виктор',
  'Алина',
  'Роман',
  'Марина',
  'Константин',
  'Вера',
];

const LAST_NAMES = [
  'Козлов',
  'Новикова',
  'Соколов',
  'Волкова',
  'Лебедев',
  'Морозова',
  'Орлов',
  'Павлова',
  'Семёнов',
  'Егорова',
  'Николаев',
  'Зайцева',
  'Белов',
  'Комарова',
  'Фёдоров',
  'Андреева',
];

const CITIES = [
  'Москва',
  'Санкт-Петербург',
  'Казань',
  'Нижний Новгород',
  'Екатеринбург',
  'Краснодар',
];

export type DemoSpecialistSpec = {
  index: number;
  firstName: string;
  lastName: string;
  city: string;
  about: string;
};

export function specialistDemoSlug(spec: DemoSpecialistSpec): string {
  return slugify(spec.lastName, spec.firstName, spec.index);
}

function slugify(last: string, first: string, index: number): string {
  const ru = last + '-' + first;
  const lat = ru.toLowerCase().replace(/ё/g, 'e').replace(/\s+/g, '-');
  const ascii = lat
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return ascii || `specialist-demo-${index}`;
}

/** Клиенты client-2 … client-20 (client-1 уже в базовом сиде) */
export function buildExtraClientAccounts(): MockAuthAccount[] {
  const out: MockAuthAccount[] = [];

  for (let i = 2; i <= 20; i += 1) {
    const fn = FIRST_NAMES[(i - 2) % FIRST_NAMES.length];
    const ln = LAST_NAMES[(i - 2) % LAST_NAMES.length];
    const n = i.toString().padStart(2, '0');

    out.push({
      id: `client-${i}`,
      email: `client${n}@tailly.local`,
      password: DEMO_CLIENT_SPECIALIST_PASSWORD,
      roles: ['client'],
      firstName: fn,
      lastName: ln,
      phone: `+7 (900) ${100 + i}-${10 + i}-${20 + i}`,
      isBlocked: false,
    });
  }

  return out;
}

const ABOUT_SNIPPETS = [
  'Работаю с собаками и кошками, аккуратный подход к кормлению и прогулкам.',
  'Опыт передержки и выгула, фотоотчёты каждый день.',
  'Спокойно нахожу контакт с тревожными питомцами.',
  'Могу дать лекарства по расписанию владельца.',
  'Принимаю мелких животных и средних собак.',
];

export function buildDemoSpecialistSpecs(): DemoSpecialistSpec[] {
  const specs: DemoSpecialistSpec[] = [];

  for (let k = 2; k <= 14; k += 1) {
    const fn = FIRST_NAMES[(k + 3) % FIRST_NAMES.length];
    const ln = LAST_NAMES[(k + 5) % LAST_NAMES.length];
    const city = CITIES[(k - 2) % CITIES.length];

    specs.push({
      index: k,
      firstName: fn,
      lastName: ln,
      city,
      about: ABOUT_SNIPPETS[(k - 2) % ABOUT_SNIPPETS.length],
    });
  }

  return specs;
}

/**
 * Краткое имя для UI (как в поиске специалистов и карточках списка).
 * Совпадает с форматом в `features/specialists-search/data/mockSpecialists.ts`.
 */
export function getDemoSpecialistDisplayNameForProfileId(id: string): string {
  const trimmed = id.trim();
  if (trimmed === 'specialist-1') {
    return 'Мария И.';
  }

  const match = /^specialist-(\d+)$/.exec(trimmed);
  if (!match) {
    return trimmed;
  }

  const index = Number(match[1]);
  const specs = buildDemoSpecialistSpecs();
  const spec = specs.find((s) => s.index === index);
  if (!spec) {
    return trimmed;
  }

  const lastInitial = spec.lastName.charAt(0);
  return `${spec.firstName} ${lastInitial}.`;
}

export function buildExtraSpecialistAuthAccounts(
  specs: DemoSpecialistSpec[],
): MockAuthAccount[] {
  return specs.map((s) => {
    const id = `specialist-${s.index}`;
    const slug = specialistDemoSlug(s);
    const n = s.index.toString().padStart(2, '0');

    return {
      id,
      email: `specialist${n}@tailly.local`,
      password: DEMO_CLIENT_SPECIALIST_PASSWORD,
      roles: ['client', 'specialist'] as MockAuthAccount['roles'],
      firstName: s.firstName,
      lastName: s.lastName,
      middleName: '',
      phone: `+7 (901) ${200 + s.index}-${30 + s.index}-${40 + s.index}`,
      specialistId: id,
      specialistSlug: slug,
      isBlocked: false,
    };
  });
}

const PET_NAMES = ['Барсик', 'Мурзик', 'Шарик', 'Рыжик', 'Снежок', 'Пушок'];

/** Профили и питомцы для client-2 … client-20 */
export function buildExtraClientProfilesAndPets(): {
  profiles: Record<string, UserProfile>;
  petsByUserId: Record<string, Pet[]>;
} {
  const profiles: Record<string, UserProfile> = {};
  const petsByUserId: Record<string, Pet[]> = {};

  for (let i = 2; i <= 20; i += 1) {
    const fn = FIRST_NAMES[(i - 2) % FIRST_NAMES.length];
    const ln = LAST_NAMES[(i - 2) % LAST_NAMES.length];
    const city = CITIES[(i - 2) % CITIES.length];
    const id = `client-${i}`;
    const n = i.toString().padStart(2, '0');

    profiles[id] = {
      id,
      firstName: fn,
      lastName: ln,
      middleName: undefined,
      city,
      phone: `+7 (900) ${100 + i}-${10 + i}-${20 + i}`,
      email: `client${n}@tailly.local`,
      avatarUrl: i % 3 === 0 ? '/images/profile-avatar.png' : undefined,
    };

    const dogPet: Pet = {
      id: `${id}-pet-dog`,
      name: PET_NAMES[(i + 1) % PET_NAMES.length],
      type: 'dog',
      breedId: 'b-dog-1',
      ageYears: 2 + (i % 8),
      ageMonths: i % 11,
      size: i % 2 === 0 ? '2_5kg' : 'up_to_2kg',
      gender: 'male',
      toOtherPets: 'friendly',
      toKidsUnder10: 'neutral',
      staysHomeAlone: 'ok',
      vaccinated: 'yes',
      notes: 'Демо-питомец для тестов списка заказов и профиля.',
      photoUrl: '/images/pet-dog.png',
    };

    const catPet: Pet = {
      id: `${id}-pet-cat`,
      name: PET_NAMES[i % PET_NAMES.length],
      type: 'cat',
      breedId: 'b-cat-1',
      ageYears: 1 + (i % 6),
      ageMonths: 0,
      size: 'up_to_2kg',
      gender: 'female',
      toOtherPets: 'neutral',
      toKidsUnder10: 'friendly',
      staysHomeAlone: 'ok',
      vaccinated: 'yes',
      notes: 'Спокойный кот, демо-данные.',
      photoUrl: undefined,
    };

    petsByUserId[id] = i % 2 === 0 ? [dogPet, catPet] : [dogPet];
  }

  return { profiles, petsByUserId };
}

const ADMIN_FIRST_NAMES = [
  'Олег',
  'Ирина',
  'Павел',
  'Светлана',
  'Никита',
  'Елена',
  'Максим',
  'Дарья',
  'Артём',
  'Полина',
  'Борис',
];

const ADMIN_LAST_NAMES = [
  'Кузнецов',
  'Волкова',
  'Степанов',
  'Новикова',
  'Михайлов',
  'Соколова',
  'Егоров',
  'Лебедева',
  'Орлов',
  'Морозова',
  'Фёдоров',
];

/** Админы admin-2 … admin-12 (admin-1 и суперадмин — в базовом сиде) */
export function buildExtraAdminAuthAccounts(): MockAuthAccount[] {
  const rows: MockAuthAccount[] = [];

  for (let i = 2; i <= 12; i += 1) {
    const fn = ADMIN_FIRST_NAMES[(i - 2) % ADMIN_FIRST_NAMES.length];
    const ln = ADMIN_LAST_NAMES[(i - 2) % ADMIN_LAST_NAMES.length];
    const n = i.toString().padStart(2, '0');

    rows.push({
      id: `admin-${i}`,
      email: `admin${n}@tailly.local`,
      password: DEMO_ADMIN_PANEL_PASSWORD,
      roles: ['admin'],
      firstName: fn,
      lastName: ln,
      phone: `+7 (902) ${10 + i}-${20 + i}-${30 + i}`,
      adminId: `admin-${i}`,
      isBlocked: false,
    });
  }

  return rows;
}

export function buildExtraManagedAdmins(): ManagedAdmin[] {
  const rows: ManagedAdmin[] = [];

  for (let i = 2; i <= 12; i += 1) {
    const fn = ADMIN_FIRST_NAMES[(i - 2) % ADMIN_FIRST_NAMES.length];
    const ln = ADMIN_LAST_NAMES[(i - 2) % ADMIN_LAST_NAMES.length];
    const n = i.toString().padStart(2, '0');
    const day = String(Math.min(28, 10 + (i % 17))).padStart(2, '0');
    const month = String(Math.min(12, 1 + (i % 11))).padStart(2, '0');
    const birthYear = 1985 + (i % 12);

    rows.push({
      id: `admin-${i}`,
      adminId: `admin-${i}`,
      email: `admin${n}@tailly.local`,
      firstName: fn,
      lastName: ln,
      middleName: 'Андреевич',
      birthDate: `${birthYear}-${month}-${day}`,
      phone: `+7 (902) ${10 + i}-${20 + i}-${30 + i}`,
      position: 'Администратор поддержки',
      department: 'Поддержка',
      status: 'active',
      role: 'admin',
      createdAt: `2026-02-${day}T11:00:00.000Z`,
      createdBy: 'super-admin-1',
      lastLoginAt: i % 3 === 0 ? `2026-03-${day}T08:00:00.000Z` : null,
    });
  }

  return rows;
}

export function buildExtraMockAdminPanelAccounts(): MockAdminAccount[] {
  const rows: MockAdminAccount[] = [];

  for (let i = 2; i <= 12; i += 1) {
    const fn = ADMIN_FIRST_NAMES[(i - 2) % ADMIN_FIRST_NAMES.length];
    const ln = ADMIN_LAST_NAMES[(i - 2) % ADMIN_LAST_NAMES.length];
    const n = i.toString().padStart(2, '0');

    rows.push({
      id: `admin-${i}`,
      adminId: `admin-${i}`,
      email: `admin${n}@tailly.local`,
      password: DEMO_ADMIN_PANEL_PASSWORD,
      role: 'admin',
      firstName: fn,
      lastName: ln,
      middleName: 'Андреевич',
      phone: `+7 (902) ${10 + i}-${20 + i}-${30 + i}`,
      isBlocked: false,
    });
  }

  return rows;
}

export function buildExtraManagedSpecialists(
  specs: DemoSpecialistSpec[],
): ManagedSpecialistMockAccount[] {
  const base = '2026-02-01T10:00:00.000Z';

  return specs.map((s) => {
    const id = `specialist-${s.index}`;
    const slug = specialistDemoSlug(s);
    const n = s.index.toString().padStart(2, '0');

    return {
      id,
      email: `specialist${n}@tailly.local`,
      password: DEMO_CLIENT_SPECIALIST_PASSWORD,
      role: 'specialist',
      firstName: s.firstName,
      lastName: s.lastName,
      middleName: '',
      phone: `+7 (901) ${200 + s.index}-${30 + s.index}-${40 + s.index}`,
      city: s.city,
      about: s.about,
      specialistId: id,
      specialistSlug: slug,
      applicationId: undefined,
      createdAt: base,
      createdBy: 'system',
      isBlocked: false,
      blockReason: undefined,
      blockedUntil: undefined,
      isPermanentBlock: false,
    };
  });
}
