// src/features/specialist-profile/data/buildRollingDemoCalendar.ts
/** Демо-календарь специалиста: даты привязаны к текущему месяцу (удобный просмотр без «пустого» месяца). */

import type { SpecialistCalendar } from '../model/types';

function isoInCurrentMonth(day: number, ref: Date): string {
  const y = ref.getFullYear();
  const m = ref.getMonth() + 1;
  const last = new Date(y, m, 0).getDate();
  const d = Math.min(Math.max(1, day), last);

  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function firstDayOfMonthIso(ref: Date): string {
  const y = ref.getFullYear();
  const m = ref.getMonth() + 1;

  return `${y}-${String(m).padStart(2, '0')}-01`;
}

/**
 * Календарь по умолчанию для основного демо-специалиста (Мария Иванова).
 * Совпадает по смыслу с прежним сидом на март 2026, но дни 20–28 — в «текущем» месяце.
 */
export function buildRollingDemoCalendar(now: Date = new Date()): SpecialistCalendar {
  return {
    timezone: 'Europe/Moscow',
    dayOverrides: [
      { date: isoInCurrentMonth(25, now), status: 'day_off' },
      { date: isoInCurrentMonth(28, now), status: 'fully_booked' },
    ],
    bookedSlots: [
      {
        id: 'booked-1',
        date: isoInCurrentMonth(20, now),
        startTime: '10:00',
        endTime: '11:00',
        serviceIds: ['service-walk-1'],
        orderId: 'seed-booking-1',
        bufferAfterMinutes: 15,
      },
      {
        id: 'booked-2',
        date: isoInCurrentMonth(20, now),
        startTime: '14:00',
        endTime: '15:30',
        serviceIds: ['service-photo-1'],
        orderId: 'seed-booking-2',
        bufferBeforeMinutes: 15,
        bufferAfterMinutes: 30,
      },
      {
        id: 'booked-3',
        date: isoInCurrentMonth(22, now),
        startTime: '13:00',
        endTime: '23:59',
        serviceIds: ['service-boarding-1'],
        orderId: 'seed-booking-3',
      },
      {
        id: 'booked-4',
        date: isoInCurrentMonth(23, now),
        startTime: '00:00',
        endTime: '11:00',
        serviceIds: ['service-boarding-1'],
        orderId: 'seed-booking-3',
      },
    ],
    availabilityWindows: [
      {
        id: 'window-1',
        date: isoInCurrentMonth(20, now),
        startTime: '09:00',
        endTime: '21:00',
        serviceIds: ['service-walk-1', 'service-photo-1', 'service-visit-1'],
        comment: 'Основное дневное окно',
      },
      {
        id: 'window-2',
        date: isoInCurrentMonth(21, now),
        startTime: '10:00',
        endTime: '19:00',
        serviceIds: ['service-walk-1', 'service-photo-1', 'service-visit-1'],
      },
      {
        id: 'window-3',
        date: isoInCurrentMonth(22, now),
        startTime: '10:00',
        endTime: '20:00',
        serviceIds: ['service-boarding-1', 'service-consult-1'],
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
        title: 'Прогулки по будням',
        serviceIds: ['service-walk-1'],
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
        title: 'Фотосессии по выходным',
        serviceIds: ['service-photo-1'],
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
        title: 'Передержка ежедневно',
        serviceIds: ['service-boarding-1'],
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
        targetDate: isoInCurrentMonth(24, now),
        editScope: 'single',
        sourceRuleId: 'rule-walk-weekdays',
        startTime: '13:00',
        endTime: '19:00',
        serviceIds: ['service-walk-1'],
        comment: 'В этот день прогулки только после обеда',
      },
    ],
  };
}
