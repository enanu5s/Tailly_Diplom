// src/features/specialists-search/data/mockSpecialistCalendar.ts
/** Генерация мок-слотов календаря для списка специалистов (свободные и занятые окна). */

import type {
  SpecialistCalendar,
  SpecialistService,
} from '@/features/specialist-profile/model/types';
import type { ServiceId } from '@/shared/config/services';

import type { SpecialistCalendarSlot } from '../model/types';

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function toIsoDateLocal(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function addDays(base: Date, days: number): Date {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

const SERVICE_ROTATION: ServiceId[] = [
  'walking',
  'boarding',
  'grooming',
  'training',
  'photoshoot',
];

/**
 * Детерминированный набор слотов на `horizonDays` вперёд от `fromDate`.
 * У каждого специалиста разный паттерн (по index), есть и available, и booked.
 */
export function buildSpecialistCalendarSlots(
  specialistIndex: number,
  fromDate: Date = new Date(),
  horizonDays = 14,
): SpecialistCalendarSlot[] {
  const slots: SpecialistCalendarSlot[] = [];
  const seed = specialistIndex <= 0 ? 11 : specialistIndex;

  for (let d = 0; d < horizonDays; d += 1) {
    const day = addDays(fromDate, d);
    const iso = toIsoDateLocal(day);
    const weekday = day.getDay();
    const mix = (seed + d * 13 + weekday * 3) % 100;

    // Не все дни с расписанием — как у реальных графиков
    if (mix % 7 === 0) {
      continue;
    }

    const svc: ServiceId = SERVICE_ROTATION[(seed + d) % SERVICE_ROTATION.length];

    // Занятое утро (бронь)
    if (mix % 4 !== 0) {
      slots.push({
        date: iso,
        startTime: '09:00',
        endTime: '11:30',
        kind: 'booked',
        serviceId: svc,
        title: 'Занято (заказ)',
      });
    }

    // Свободное окно днём
    if (mix % 3 !== 1) {
      slots.push({
        date: iso,
        startTime: '12:00',
        endTime: '14:00',
        kind: 'available',
        serviceId: 'walking',
        title: 'Свободно',
      });
    }

    // Ещё одно свободное или груминг вечером
    if (mix % 5 === 2 || mix % 5 === 4) {
      slots.push({
        date: iso,
        startTime: '16:00',
        endTime: mix % 5 === 4 ? '17:30' : '18:00',
        kind: 'available',
        serviceId: mix % 5 === 4 ? 'grooming' : 'boarding',
        title: mix % 5 === 4 ? 'Окно груминг' : 'Передержка: слот',
      });
    }

    // Иногда вечер занят
    if (mix % 11 === 3) {
      slots.push({
        date: iso,
        startTime: '18:30',
        endTime: '20:00',
        kind: 'booked',
        serviceId: 'photoshoot',
        title: 'Фотосессия (занято)',
      });
    }
  }

  return slots.sort((a, b) => {
    const c = a.date.localeCompare(b.date);
    if (c !== 0) return c;
    return a.startTime.localeCompare(b.startTime);
  });
}

function inferServiceIdFromSpecialistService(
  service: SpecialistService | undefined,
): ServiceId {
  if (!service) {
    return 'walking';
  }

  const t = `${service.id} ${service.name}`.toLowerCase();

  if (
    t.includes('walk') ||
    t.includes('прогул') ||
    t.includes('выгул') ||
    t.includes('visit')
  ) {
    return 'walking';
  }

  if (t.includes('board') || t.includes('передерж') || t.includes('присмотр')) {
    return 'boarding';
  }

  if (t.includes('groom') || t.includes('грум') || t.includes('стриж')) {
    return 'grooming';
  }

  if (t.includes('train') || t.includes('дресс') || t.includes('коррекц')) {
    return 'training';
  }

  if (t.includes('photo') || t.includes('фото')) {
    return 'photoshoot';
  }

  return 'walking';
}

function resolveSearchServiceId(
  profileServiceId: string | undefined,
  services: SpecialistService[],
): ServiceId {
  if (!profileServiceId) {
    return 'walking';
  }

  const svc = services.find((s) => s.id === profileServiceId);

  return inferServiceIdFromSpecialistService(svc);
}

/** Совпадает с отсечением прошедших слотов в `buildSlotsFromWindowsForService` (оформление заказа). */
function isWindowEndInFuture(dateIso: string, endTime: string): boolean {
  const normalizedTime = /^\d{2}:\d{2}$/.test(endTime) ? `${endTime}:00` : endTime;
  const end = new Date(`${dateIso}T${normalizedTime}`);

  return !Number.isNaN(end.getTime()) && end.getTime() > Date.now();
}

/**
 * Слоты для карточек поиска и превью — из того же календаря, что и в профиле специалиста (мок).
 */
export function calendarSlotsFromSpecialistCalendar(
  calendar: SpecialistCalendar,
  services: SpecialistService[],
): SpecialistCalendarSlot[] {
  const slots: SpecialistCalendarSlot[] = [];

  for (const window of calendar.availabilityWindows) {
    if (!isWindowEndInFuture(window.date, window.endTime)) {
      continue;
    }

    const serviceId = resolveSearchServiceId(window.serviceIds[0], services);

    slots.push({
      date: window.date,
      startTime: window.startTime,
      endTime: window.endTime,
      kind: 'available',
      serviceId,
      title: window.comment?.trim() || 'Свободно',
    });
  }

  for (const booked of calendar.bookedSlots) {
    const serviceId = resolveSearchServiceId(booked.serviceIds[0], services);

    slots.push({
      date: booked.date,
      startTime: booked.startTime,
      endTime: booked.endTime,
      kind: 'booked',
      serviceId,
      title: booked.orderId ? 'Занято (заказ)' : 'Занято',
    });
  }

  return slots.sort((a, b) => {
    const c = a.date.localeCompare(b.date);

    if (c !== 0) {
      return c;
    }

    return a.startTime.localeCompare(b.startTime);
  });
}

export function countAvailableCalendarSlots(
  slots: SpecialistCalendarSlot[] | undefined,
): number {
  return slots?.filter((s) => s.kind === 'available').length ?? 0;
}

export function getNextAvailableCalendarSlot(
  slots: SpecialistCalendarSlot[] | undefined,
): SpecialistCalendarSlot | null {
  if (!slots?.length) {
    return null;
  }
  const available = slots.filter((s) => s.kind === 'available');
  return available[0] ?? null;
}
