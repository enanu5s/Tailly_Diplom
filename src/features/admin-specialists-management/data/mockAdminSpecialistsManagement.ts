//src/features/admin-specialists-management/data/mockAdminSpecialistsManagement.ts
import type {
  CreateSpecialistAccountResponse,
} from '../model/types';

import type { ManagedSpecialistMockAccount } from '@/shared/lib/mock/specialistAccountsStorage';

export function wait(delay = 300): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delay);
  });
}

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s-]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function transliterate(value: string): string {
  const map: Record<string, string> = {
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'g',
    д: 'd',
    е: 'e',
    ё: 'e',
    ж: 'zh',
    з: 'z',
    и: 'i',
    й: 'y',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    х: 'h',
    ц: 'ts',
    ч: 'ch',
    ш: 'sh',
    щ: 'sch',
    ъ: '',
    ы: 'y',
    ь: '',
    э: 'e',
    ю: 'yu',
    я: 'ya',
  };

  return value
    .toLowerCase()
    .split('')
    .map((char) => map[char] ?? char)
    .join('');
}

export function buildSpecialistSlug(
  firstName: string,
  lastName: string,
): string {
  const base = slugify(
    transliterate(`${firstName.trim()} ${lastName.trim()}`),
  );

  return base || `specialist-${Math.random().toString(36).slice(2, 8)}`;
}

export function generateTemporaryPassword(): string {
  return `Tailly-${Math.random().toString(36).slice(2, 8)}!`;
}

export function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function mapCreatedAccountToResponse(
  createdAccount: ManagedSpecialistMockAccount,
  temporaryPassword: string,
): CreateSpecialistAccountResponse {
  return {
    account: JSON.parse(
      JSON.stringify({
        ...createdAccount,
        password: undefined,
      }),
    ) as CreateSpecialistAccountResponse['account'],
    temporaryPassword,
  };
}