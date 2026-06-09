// src/features/specialist-applications/model/specialistApplicationsModerationValidation.ts

import type { SpecialistApplication } from './types';

/** Минимум — час от текущего момента (согласовано с полем datetime-local min). */
export const MIN_INTERVIEW_LEAD_MS = 60 * 60 * 1000;

/** Длительность слота собеседования при проверке пересечений у одного администратора. */
export const INTERVIEW_SLOT_DURATION_MS = 60 * 60 * 1000;

/** Максимум — год вперёд (ошибка опечатки в годе). */
export const MAX_INTERVIEW_LEAD_MS = 366 * 24 * 60 * 60 * 1000;

function formatDateTimeLocalValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Нижняя граница для input[type=datetime-local] (сейчас + 1 ч). */
export function getMinInterviewDateTimeLocalString(): string {
  return formatDateTimeLocalValue(new Date(Date.now() + MIN_INTERVIEW_LEAD_MS));
}

/** Верхняя граница для input[type=datetime-local] (год вперёд). */
export function getMaxInterviewDateTimeLocalString(): string {
  return formatDateTimeLocalValue(new Date(Date.now() + MAX_INTERVIEW_LEAD_MS));
}

function normalizeReviewer(value: string): string {
  return value.trim().toLowerCase();
}

function formatInterviewWhenRu(iso: string): string {
  const d = new Date(iso);

  if (Number.isNaN(d.getTime())) {
    return iso;
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

function hasCyrillicOrLatinLetter(value: string): boolean {
  return /[a-zA-Zа-яА-ЯёЁ]/.test(value);
}

/**
 * Дата/время из поля datetime-local (локальное время браузера).
 * Возвращает текст ошибки или null, если всё ок.
 */
export function validateInterviewDateTime(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return 'Укажите дату и время собеседования.';
  }

  const d = new Date(trimmed);

  if (Number.isNaN(d.getTime())) {
    return 'Укажите корректную дату и время.';
  }

  const now = Date.now();
  const start = d.getTime();

  if (start <= now + MIN_INTERVIEW_LEAD_MS) {
    return 'Назначьте собеседование минимум на час позже текущего момента (проверьте дату и время).';
  }

  if (start > now + MAX_INTERVIEW_LEAD_MS) {
    return 'Дата слишком далеко в будущем — проверьте год (не более года от сегодняшней даты).';
  }

  return null;
}

/**
 * Пересечение слотов у одного администратора (тот же reviewedBy, другая заявка).
 */
export function findConflictingInterviewForAdmin(
  applications: SpecialistApplication[],
  adminReviewer: string,
  proposedInterviewStartIso: string,
  excludeApplicationId: string | null,
): SpecialistApplication | null {
  const adminNorm = normalizeReviewer(adminReviewer);

  if (!adminNorm) {
    return null;
  }

  const proposed = new Date(proposedInterviewStartIso);

  if (Number.isNaN(proposed.getTime())) {
    return null;
  }

  const proposedStart = proposed.getTime();
  const proposedEnd = proposedStart + INTERVIEW_SLOT_DURATION_MS;

  for (const app of applications) {
    if (excludeApplicationId !== null && app.id === excludeApplicationId) {
      continue;
    }

    if (app.status !== 'interview_assigned' || !app.interviewDate) {
      continue;
    }

    if (normalizeReviewer(app.reviewedBy ?? '') !== adminNorm) {
      continue;
    }

    const otherStartMs = new Date(app.interviewDate).getTime();

    if (Number.isNaN(otherStartMs)) {
      continue;
    }

    const otherEnd = otherStartMs + INTERVIEW_SLOT_DURATION_MS;

    if (proposedStart < otherEnd && otherStartMs < proposedEnd) {
      return app;
    }
  }

  return null;
}

export function validateAdminInterviewSlot(
  applications: SpecialistApplication[],
  adminReviewer: string,
  proposedInterviewStartIso: string,
  excludeApplicationId: string | null,
): string | null {
  const dateError = validateInterviewDateTime(proposedInterviewStartIso);

  if (dateError) {
    return dateError;
  }

  const conflict = findConflictingInterviewForAdmin(
    applications,
    adminReviewer,
    proposedInterviewStartIso,
    excludeApplicationId,
  );

  if (conflict) {
    const when = formatInterviewWhenRu(conflict.interviewDate!);

    return `В это время у вас уже запланировано собеседование — с ${conflict.fullName} (${when}). Выберите другое время так, чтобы слоты по 1 часу не пересекались.`;
  }

  return null;
}

/**
 * Комментарий при отклонении: нельзя «тыкнуть ради галочки».
 */
export function validateRejectComment(value: string): string | null {
  const t = value.trim();

  if (!t) {
    return 'Для отклонения добавьте комментарий с причиной.';
  }

  if (t.length < 15) {
    return 'Комментарий при отклонении — не короче 15 символов, кратко опишите причину.';
  }

  if (!hasCyrillicOrLatinLetter(t)) {
    return 'В комментарии должны быть буквы — нельзя только цифры и знаки препинания.';
  }

  const compact = t.replace(/\s/g, '');

  if (compact.length >= 8 && /^(.)\1+$/.test(compact)) {
    return 'Похоже на случайный набор одинаковых символов — укажите понятную причину отклонения.';
  }

  const low = t.toLowerCase();

  if (/^(test|тест|qwerty|asdf|12345|123456789|нет|ок|да|хорошо|плохо)\.?$/i.test(low)) {
    return 'Недостаточно информативный комментарий — опишите причину для кандидата.';
  }

  return null;
}

/**
 * Необязательный комментарий при одобрении/назначении: если поле заполнено — без мусора.
 */
export function validateOptionalAdminComment(value: string): string | null {
  const t = value.trim();

  if (!t) {
    return null;
  }

  if (t.length < 3) {
    return 'Если заполняете комментарий, введите не меньше 3 символов или очистите поле.';
  }

  if (t.length > 2000) {
    return 'Комментарий слишком длинный (не более 2000 символов).';
  }

  return null;
}
