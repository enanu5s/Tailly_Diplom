// src/pages/specialist-calendar-edit/ui/calendarEditGuards.ts

import type { SpecialistCalendar } from '@/features/specialist-profile/model/types';

export function countAvailabilityWindowsOnDates(
  calendar: SpecialistCalendar,
  isoDates: string[],
): number {
  const set = new Set(isoDates);

  return calendar.availabilityWindows.filter((w) => set.has(w.date)).length;
}

export function countBookedSlotsOnDates(
  calendar: SpecialistCalendar,
  isoDates: string[],
): number {
  const set = new Set(isoDates);

  return calendar.bookedSlots.filter((b) => set.has(b.date)).length;
}

export function confirmLeaveUnsavedPage(): boolean {
  return window.confirm(
    'Есть несохранённые изменения в календаре. Уйти со страницы без сохранения?',
  );
}

export function confirmWeeklyReplaceExistingWindows(): boolean {
  return window.confirm(
    'Включена замена окон: уже созданные окна доступности на тех же датах будут удалены и заменены новыми. Продолжить?',
  );
}

export function confirmClearWeekdayPreset(): boolean {
  return window.confirm('Снять выбор со всех дней недели в шаблоне?');
}

export function confirmClearAvailabilityWindows(selectedDatesCount: number): boolean {
  return window.confirm(
    `Удалить все окна доступности у выбранных дат (${selectedDatesCount})? Уже сделанные клиентами записи не удаляются.`,
  );
}

export function confirmBulkReplaceWindows(): boolean {
  return window.confirm(
    'Сначала будут удалены все существующие окна на выбранных датах, затем добавлено новое окно по форме. Продолжить?',
  );
}

export function confirmRemoveAvailabilityWindow(): boolean {
  return window.confirm('Удалить это окно доступности?');
}

export function confirmDayStatusOverride(
  kind: 'day_off' | 'fully_booked',
  isoDates: string[],
  calendar: SpecialistCalendar,
): boolean {
  const windows = countAvailabilityWindowsOnDates(calendar, isoDates);
  const bookings = countBookedSlotsOnDates(calendar, isoDates);

  if (windows === 0 && bookings === 0) {
    return true;
  }

  const kindRu =
    kind === 'day_off' ? 'выходным' : 'закрытым для новых записей';

  const dayWord = isoDates.length === 1 ? 'день' : 'дни';

  let msg = `Сделать ${dayWord} «${kindRu}»? `;

  if (windows > 0) {
    msg += `Будет удалено окон доступности: ${windows}. `;
  }

  if (bookings > 0) {
    msg += `На эти даты есть записи (${bookings} интервалов) — проверьте, что клиенты в курсе. `;
  }

  msg += 'Продолжить?';

  return window.confirm(msg);
}
