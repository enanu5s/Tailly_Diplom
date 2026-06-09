// src/features/account-deletion/api/accountDeletionApi.mock.ts

import {
  appendMockAccountDeletionEmail,
  createSoftDeleteRecord,
  findUserIdByRestoreToken,
  getActiveSoftDeleteRecord,
  putSoftDeleteRecord,
  removeSoftDeleteRecord,
} from '@/features/auth/data/mockAccountDeletionStorage';
import {
  getMockAuthAccounts,
  hasAdminRole,
  wait,
} from '@/features/auth/data/mockAuthAccounts';

import { AccountDeletionError } from '../model/types';

import type { AccountDeletionRestorePreview } from '../model/types';

function buildAppOrigin(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.location.origin;
}

function formatRuDeadline(iso: string): string {
  const time = new Date(iso).getTime();

  if (Number.isNaN(time)) {
    return iso;
  }

  return new Date(iso).toLocaleString('ru-RU', {
    dateStyle: 'long',
    timeStyle: 'short',
  });
}

function buildRoleLabel(roles: string[]): string {
  if (roles.includes('specialist')) {
    return 'Специалист';
  }

  if (roles.includes('client')) {
    return 'Клиент';
  }

  return 'Пользователь';
}

function buildDisplayName(account: {
  firstName?: string;
  lastName?: string;
  middleName?: string;
}): string {
  const value = [
    account.lastName?.trim() ?? '',
    account.firstName?.trim() ?? '',
    account.middleName?.trim() ?? '',
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  return value || 'Пользователь';
}

export async function mockRequestAccountDeletion(payload: {
  userId: string;
  password: string;
}): Promise<{ ok: true; restoreDeadlineIso: string }> {
  await wait();

  const password = payload.password.trim();

  if (!password) {
    throw new AccountDeletionError('Введите пароль.');
  }

  const account = getMockAuthAccounts().find((item) => item.id === payload.userId);

  if (!account) {
    throw new AccountDeletionError('Аккаунт не найден.');
  }

  if (hasAdminRole(account.roles)) {
    throw new AccountDeletionError(
      'Удаление такого типа аккаунта через этот раздел недоступно.',
    );
  }

  if (!account.roles.includes('client') && !account.roles.includes('specialist')) {
    throw new AccountDeletionError('Операция недоступна для этой учётной записи.');
  }

  if (account.password !== password) {
    throw new AccountDeletionError('Неверный пароль.');
  }

  if (getActiveSoftDeleteRecord(account.id)) {
    throw new AccountDeletionError('Аккаунт уже запланирован к удалению.');
  }

  const record = createSoftDeleteRecord();

  putSoftDeleteRecord(account.id, record);

  const origin = buildAppOrigin();
  const restoreUrl = `${origin}/account/restore/${encodeURIComponent(record.token)}`;
  const deadlineLabel = formatRuDeadline(record.restoreUntil);

  const subject = 'Аккаунт Tailly запланирован к удалению';

  const html = `
    <p>Здравствуйте!</p>
    <p>Ваш аккаунт в сервисе Tailly запланирован к удалению.</p>
    <p>До <strong>${deadlineLabel}</strong> вы можете восстановить доступ, перейдя по ссылке:</p>
    <p><a href="${restoreUrl}">${restoreUrl}</a></p>
    <p>После этой даты данные будут удалены без возможности восстановления.</p>
  `.trim();

  appendMockAccountDeletionEmail({
    to: account.email,
    subject,
    html,
  });

  return { ok: true, restoreDeadlineIso: record.restoreUntil };
}

export async function mockGetAccountRestorePreview(
  token: string,
): Promise<AccountDeletionRestorePreview> {
  await wait();

  const found = findUserIdByRestoreToken(token);

  if (!found) {
    throw new AccountDeletionError(
      'Ссылка недействительна или срок восстановления истёк.',
    );
  }

  const account = getMockAuthAccounts().find((item) => item.id === found.userId);

  if (!account) {
    throw new AccountDeletionError(
      'Ссылка недействительна или срок восстановления истёк.',
    );
  }

  return {
    email: account.email,
    roleLabel: buildRoleLabel(account.roles),
    displayName: buildDisplayName(account),
    restoreDeadlineIso: found.record.restoreUntil,
  };
}

export async function mockRestoreAccountByToken(token: string): Promise<void> {
  await wait();

  const found = findUserIdByRestoreToken(token);

  if (!found) {
    throw new AccountDeletionError(
      'Ссылка недействительна или срок восстановления истёк.',
    );
  }

  removeSoftDeleteRecord(found.userId);
}
