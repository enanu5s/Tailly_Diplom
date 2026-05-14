// src/features/specialist-profile/data/buildRollingDemoCalendar.ts
/** Демо-календарь: окна и брони на датах относительно «сегодня», чтобы слоты для записи не оказывались в прошлом. */

import type { SpecialistCalendar } from '../model/types';

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function toIsoLocal(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function addDays(ref: Date, days: number): Date {
  const next = new Date(ref);
  next.setDate(next.getDate() + days);
  return next;
}

function firstDayOfMonthIso(ref: Date): string {
  const y = ref.getFullYear();
  const m = ref.getMonth() + 1;

  return `${y}-${String(m).padStart(2, '0')}-01`;
}

/**
 * Календарь по умолчанию для демо-специалистов.
 * Окна доступности на ближайшие дни (завтра и далее), чтобы `buildSlotsFromWindowsForService`
 * не отбрасывал все слоты как прошедшие.
 */
export function buildRollingDemoCalendar(now: Date = new Date()): SpecialistCalendar {
  const d1 = toIsoLocal(addDays(now, 1));
  const d2 = toIsoLocal(addDays(now, 2));
  const d3 = toIsoLocal(addDays(now, 3));
  const d4 = toIsoLocal(addDays(now, 4));
  const dayOff = toIsoLocal(addDays(now, 7));
  const fullyBooked = toIsoLocal(addDays(now, 10));

  return {
    timezone: 'Europe/Moscow',
    dayOverrides: [
      { date: dayOff, status: 'day_off' },
      { date: fullyBooked, status: 'fully_booked' },
    ],
    bookedSlots: [
      {
        id: 'booked-1',
        date: d1,
        startTime: '10:00',
        endTime: '11:00',
        serviceIds: ['walking'],
        orderId: 'seed-booking-1',
        bufferAfterMinutes: 15,
      },
      {
        id: 'booked-2',
        date: d1,
        startTime: '14:00',
        endTime: '15:30',
        serviceIds: ['photoshoot'],
        orderId: 'seed-booking-2',
        bufferBeforeMinutes: 15,
        bufferAfterMinutes: 30,
      },
      {
        id: 'booked-3',
        date: d3,
        startTime: '13:00',
        endTime: '23:59',
        serviceIds: ['boarding'],
        orderId: 'seed-booking-3',
      },
      {
        id: 'booked-4',
        date: d4,
        startTime: '00:00',
        endTime: '11:00',
        serviceIds: ['boarding'],
        orderId: 'seed-booking-3',
      },
    ],
    availabilityWindows: [
      {
        id: 'window-1',
        date: d1,
        startTime: '09:00',
        endTime: '21:00',
        serviceIds: ['walking', 'photoshoot', 'grooming'],
        comment: 'Основное дневное окно',
      },
      {
        id: 'window-2',
        date: d2,
        startTime: '10:00',
        endTime: '19:00',
        serviceIds: ['walking', 'photoshoot', 'grooming'],
      },
      {
        id: 'window-3',
        date: d3,
        startTime: '10:00',
        endTime: '20:00',
        serviceIds: ['boarding', 'training'],
      },
    ],
    bookingSettings: {
      dayStartTime: '09:00',
      dayEndTime: '21:00',
      slotStepMinutes: 30,
      defaultDurationMinutes: 60,
    },
    availabilityRules: [
      {
        id: 'rule-walk-weekdays',
        title: 'Выгул',
        serviceIds: ['walking'],
        startDate: firstDayOfMonthIso(now),
        startTime: '09:00',
        endTime: '20:00',
        recurrence: {
          frequency: 'weekly',
          interval: 1,
          weekDays: [1, 2, 3, 4, 5],
        },
        isEnabled: true,
      },
      {
        id: 'rule-photo-weekend',
        title: 'Фотосессия',
        serviceIds: ['photoshoot'],
        startDate: firstDayOfMonthIso(now),
        startTime: '11:00',
        endTime: '18:00',
        recurrence: {
          frequency: 'weekly',
          interval: 1,
          weekDays: [0, 6],
        },
        isEnabled: true,
      },
      {
        id: 'rule-boarding-daily',
        title: 'Передержка',
        serviceIds: ['boarding'],
        startDate: firstDayOfMonthIso(now),
        startTime: '09:00',
        endTime: '21:00',
        recurrence: {
          frequency: 'daily',
          interval: 1,
        },
        isEnabled: true,
      },
    ],
    availabilityOverrides: [
      {
        id: 'override-1',
        targetDate: d2,
        editScope: 'single',
        sourceRuleId: 'rule-walk-weekdays',
        startTime: '13:00',
        endTime: '19:00',
        serviceIds: ['walking'],
        comment: 'В этот день выгул только после обеда',
      },
    ],
  };
}
