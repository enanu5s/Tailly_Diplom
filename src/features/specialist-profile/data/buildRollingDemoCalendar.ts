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
/**
 * @param specialistIndex 1…10 — смещает окна и брони, чтобы у специалистов были разные свободные дни
 */
export function buildRollingDemoCalendar(
  specialistIndex = 1,
  now: Date = new Date(),
): SpecialistCalendar {
  const shift = (specialistIndex - 1) * 2;
  const d1 = toIsoLocal(addDays(now, 1 + shift));
  const d2 = toIsoLocal(addDays(now, 2 + shift));
  const d3 = toIsoLocal(addDays(now, 3 + (shift % 3)));
  const d4 = toIsoLocal(addDays(now, 5 + (shift % 4)));
  const d5 = toIsoLocal(addDays(now, 6 + shift));
  const dayOff = toIsoLocal(addDays(now, 8 + (specialistIndex % 5)));
  const fullyBooked = toIsoLocal(addDays(now, 11 + (specialistIndex % 4)));
  const morningOnly = toIsoLocal(addDays(now, 4 + shift));

  const walkStart = `${String(9 + (specialistIndex % 3)).padStart(2, '0')}:00`;
  const walkEnd = `${String(18 + (specialistIndex % 2)).padStart(2, '0')}:00`;
  const weekdaySet =
    specialistIndex % 3 === 0
      ? [1, 3, 5]
      : specialistIndex % 3 === 1
        ? [2, 4, 6]
        : [1, 2, 4, 5];
  const weekendSet = specialistIndex % 2 === 0 ? [0, 6] : [6];

  return {
    timezone: 'Europe/Moscow',
    dayOverrides: [
      { date: dayOff, status: 'day_off' },
      { date: fullyBooked, status: 'fully_booked' },
    ],
    bookedSlots: [
      {
        id: `booked-sp${specialistIndex}-1`,
        date: d1,
        startTime: `${String(10 + (specialistIndex % 2)).padStart(2, '0')}:00`,
        endTime: `${String(11 + (specialistIndex % 2)).padStart(2, '0')}:00`,
        serviceIds: ['walking'],
        orderId: `seed-booking-sp${specialistIndex}-1`,
        bufferAfterMinutes: 15,
      },
      ...(specialistIndex % 2 === 0
        ? [
            {
              id: `booked-sp${specialistIndex}-2`,
              date: d2,
              startTime: '14:00',
              endTime: '16:00',
              serviceIds: ['grooming'],
              orderId: `seed-booking-sp${specialistIndex}-2`,
            },
          ]
        : []),
      {
        id: `booked-sp${specialistIndex}-3`,
        date: d3,
        startTime: '13:00',
        endTime: '23:59',
        serviceIds: ['boarding'],
        orderId: `seed-booking-sp${specialistIndex}-3`,
      },
      {
        id: `booked-sp${specialistIndex}-4`,
        date: d4,
        startTime: '00:00',
        endTime: '11:00',
        serviceIds: ['boarding'],
        orderId: `seed-booking-sp${specialistIndex}-3`,
      },
    ],
    availabilityWindows: [
      {
        id: `window-sp${specialistIndex}-1`,
        date: d1,
        startTime: walkStart,
        endTime: walkEnd,
        serviceIds: ['walking', 'photoshoot', 'grooming'],
        comment: 'Основное дневное окно',
      },
      {
        id: `window-sp${specialistIndex}-2`,
        date: d2,
        startTime: '10:00',
        endTime: specialistIndex % 2 === 0 ? '17:00' : '20:00',
        serviceIds: ['walking', 'training'],
      },
      {
        id: `window-sp${specialistIndex}-3`,
        date: d5,
        startTime: '09:30',
        endTime: '18:30',
        serviceIds: ['boarding', 'training', 'photoshoot'],
      },
      {
        id: `window-sp${specialistIndex}-4`,
        date: morningOnly,
        startTime: '08:00',
        endTime: '12:00',
        serviceIds: ['walking'],
        comment: 'Только утро',
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
        id: `rule-walk-sp${specialistIndex}`,
        title: 'Выгул',
        serviceIds: ['walking'],
        startDate: firstDayOfMonthIso(now),
        startTime: walkStart,
        endTime: walkEnd,
        recurrence: {
          frequency: 'weekly',
          interval: specialistIndex % 2 === 0 ? 1 : 2,
          weekDays: weekdaySet,
        },
        isEnabled: true,
      },
      {
        id: `rule-photo-sp${specialistIndex}`,
        title: 'Фотосессия',
        serviceIds: ['photoshoot'],
        startDate: firstDayOfMonthIso(now),
        startTime: '11:00',
        endTime: '18:00',
        recurrence: {
          frequency: 'weekly',
          interval: 1,
          weekDays: weekendSet,
        },
        isEnabled: specialistIndex % 4 !== 0,
      },
      {
        id: `rule-boarding-sp${specialistIndex}`,
        title: 'Передержка',
        serviceIds: ['boarding'],
        startDate: firstDayOfMonthIso(now),
        startTime: '09:00',
        endTime: '21:00',
        recurrence: {
          frequency: specialistIndex % 3 === 0 ? 'every_n_days' : 'daily',
          interval: specialistIndex % 3 === 0 ? 2 : 1,
        },
        isEnabled: true,
      },
    ],
    availabilityOverrides: [
      {
        id: `override-sp${specialistIndex}-1`,
        targetDate: d2,
        editScope: 'single',
        sourceRuleId: `rule-walk-sp${specialistIndex}`,
        startTime: '13:00',
        endTime: '19:00',
        serviceIds: ['walking'],
        comment: 'В этот день выгул только после обеда',
      },
    ],
  };
}
