// src/features/super-admin-admins-management/data/adminOrganizationOptions.ts

export const ADMIN_DEPARTMENT_OPTIONS = [
  'Администрация',
  'Поддержка',
  'Модерация',
  'Маркетинг',
  'HR',
] as const;

export const ADMIN_POSITION_OPTIONS = [
  'Главный администратор',
  'Администратор поддержки',
  'Администратор модерации',
  'Младший администратор',
  'Координатор поддержки',
] as const;

export function mergeWithCurrentOption(
  predefined: readonly string[],
  current?: string,
): string[] {
  const list = [...predefined];
  const trimmed = current?.trim();
  if (trimmed && !list.includes(trimmed)) {
    list.unshift(trimmed);
  }
  return list;
}
