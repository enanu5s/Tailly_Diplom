// src/features/specialist-profile/model/calendarUtils.ts

import type { SpecialistCalendar, SpecialistCalendarDayStatus } from './types';

export type CalendarMonthDay = {
  isoDate: string | null;
  dayNumber: number | null;
  status: SpecialistCalendarDayStatus | null;
  isCurrentMonth: boolean;
  /** Есть окна доступности (при статусе «свободно» это видно только по этому флагу) */
  hasAvailabilityWindows?: boolean;
};

type DateBookingSummary = {
  totalAvailabilityMinutes: number;
  bookedMinutes: number;
  availabilityWindowsCount: number;
  bookedSlotsCount: number;
  status: SpecialistCalendarDayStatus;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isValidIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidTime(value: string): boolean {
  return /^\d{2}:\d{2}$/.test(value);
}

function parseTimeToMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function calculateIntervalMinutes(startTime: string, endTime: string): number {
  if (!isValidTime(startTime) || !isValidTime(endTime)) {
    return 0;
  }

  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);

  return end > start ? end - start : 0;
}

function calculateOverlapMinutes(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): number {
  if (
    !isValidTime(startA) ||
    !isValidTime(endA) ||
    !isValidTime(startB) ||
    !isValidTime(endB)
  ) {
    return 0;
  }

  const aStart = parseTimeToMinutes(startA);
  const aEnd = parseTimeToMinutes(endA);
  const bStart = parseTimeToMinutes(startB);
  const bEnd = parseTimeToMinutes(endB);

  const overlapStart = Math.max(aStart, bStart);
  const overlapEnd = Math.min(aEnd, bEnd);

  return overlapEnd > overlapStart ? overlapEnd - overlapStart : 0;
}

function getManualOverrideStatus(
  calendar: SpecialistCalendar,
  isoDate: string,
): Exclude<SpecialistCalendarDayStatus, 'partially_booked'> | null {
  const override = calendar.dayOverrides.find((item) => item.date === isoDate);
  return override?.status ?? null;
}

function getAvailabilityWindowsForDate(calendar: SpecialistCalendar, isoDate: string) {
  return calendar.availabilityWindows.filter((item) => item.date === isoDate);
}

function getBookedSlotsForDate(calendar: SpecialistCalendar, isoDate: string) {
  return calendar.bookedSlots.filter((item) => item.date === isoDate);
}

export const CALENDAR_WEEKDAY_LABELS = [
  'Пн',
  'Вт',
  'Ср',
  'Чт',
  'Пт',
  'Сб',
  'Вс',
] as const;

export const CALENDAR_STATUS_LABELS: Record<SpecialistCalendarDayStatus, string> = {
  available: 'Свободно',
  partially_booked: 'Частично занято',
  fully_booked: 'Занято',
  day_off: 'Выходной',
};

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function formatMonthLabel(date: Date): string {
  return new Intl.DateTimeFormat('ru-RU', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function isValidTimeRange(startTime: string, endTime: string): boolean {
  if (!isValidTime(startTime) || !isValidTime(endTime)) {
    return false;
  }

  return parseTimeToMinutes(endTime) > parseTimeToMinutes(startTime);
}

export function getDateBookingSummary(
  calendar: SpecialistCalendar,
  isoDate: string,
): DateBookingSummary {
  const manualStatus = getManualOverrideStatus(calendar, isoDate);

  if (manualStatus === 'day_off') {
    return {
      totalAvailabilityMinutes: 0,
      bookedMinutes: 0,
      availabilityWindowsCount: 0,
      bookedSlotsCount: 0,
      status: 'day_off',
    };
  }

  if (manualStatus === 'fully_booked') {
    const bookedSlots = getBookedSlotsForDate(calendar, isoDate);

    return {
      totalAvailabilityMinutes: 0,
      bookedMinutes: bookedSlots.reduce((sum, item) => {
        return sum + calculateIntervalMinutes(item.startTime, item.endTime);
      }, 0),
      availabilityWindowsCount: 0,
      bookedSlotsCount: bookedSlots.length,
      status: 'fully_booked',
    };
  }

  const availabilityWindows = getAvailabilityWindowsForDate(calendar, isoDate);
  const bookedSlots = getBookedSlotsForDate(calendar, isoDate);

  const totalAvailabilityMinutes = availabilityWindows.reduce((sum, item) => {
    return sum + calculateIntervalMinutes(item.startTime, item.endTime);
  }, 0);

  const bookedMinutes = availabilityWindows.reduce((sum, windowItem) => {
    const overlapForWindow = bookedSlots.reduce((slotSum, slotItem) => {
      return (
        slotSum +
        calculateOverlapMinutes(
          windowItem.startTime,
          windowItem.endTime,
          slotItem.startTime,
          slotItem.endTime,
        )
      );
    }, 0);

    return sum + overlapForWindow;
  }, 0);

  if (availabilityWindows.length === 0) {
    return {
      totalAvailabilityMinutes: 0,
      bookedMinutes: 0,
      availabilityWindowsCount: 0,
      bookedSlotsCount: bookedSlots.length,
      status: bookedSlots.length > 0 ? 'partially_booked' : 'available',
    };
  }

  if (bookedMinutes <= 0) {
    return {
      totalAvailabilityMinutes,
      bookedMinutes: 0,
      availabilityWindowsCount: availabilityWindows.length,
      bookedSlotsCount: bookedSlots.length,
      status: 'available',
    };
  }

  if (bookedMinutes >= totalAvailabilityMinutes) {
    return {
      totalAvailabilityMinutes,
      bookedMinutes,
      availabilityWindowsCount: availabilityWindows.length,
      bookedSlotsCount: bookedSlots.length,
      status: 'fully_booked',
    };
  }

  return {
    totalAvailabilityMinutes,
    bookedMinutes,
    availabilityWindowsCount: availabilityWindows.length,
    bookedSlotsCount: bookedSlots.length,
    status: 'partially_booked',
  };
}

export function getCalendarDayStatus(
  calendar: SpecialistCalendar,
  isoDate: string,
): SpecialistCalendarDayStatus {
  const manualStatus = getManualOverrideStatus(calendar, isoDate);

  if (manualStatus === 'day_off' || manualStatus === 'fully_booked') {
    return manualStatus;
  }

  return getDateBookingSummary(calendar, isoDate).status;
}

export function buildCalendarMonthDays(
  currentMonth: Date,
  calendar: SpecialistCalendar,
): {
  days: CalendarMonthDay[];
} {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const firstWeekday = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = lastDayOfMonth.getDate();

  const result: CalendarMonthDay[] = [];

  for (let index = 0; index < firstWeekday; index += 1) {
    result.push({
      isoDate: null,
      dayNumber: null,
      status: null,
      isCurrentMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const isoDate = toIsoDate(date);
    const hasAvailabilityWindows =
      getAvailabilityWindowsForDate(calendar, isoDate).length > 0;

    result.push({
      isoDate,
      dayNumber: day,
      status: getCalendarDayStatus(calendar, isoDate),
      isCurrentMonth: true,
      hasAvailabilityWindows,
    });
  }

  while (result.length % 7 !== 0) {
    result.push({
      isoDate: null,
      dayNumber: null,
      status: null,
      isCurrentMonth: false,
    });
  }

  return {
    days: result,
  };
}

export function parseCalendarDate(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();

  return isValidIsoDate(trimmed) ? trimmed : null;
}

export function parseCalendarTime(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();

  return isValidTime(trimmed) ? trimmed : null;
}

export function isCalendarEntity(value: unknown): value is SpecialistCalendar {
  if (!isRecord(value)) {
    return false;
  }

  return (
    Array.isArray(value.dayOverrides) &&
    Array.isArray(value.bookedSlots) &&
    Array.isArray(value.availabilityWindows)
  );
}
