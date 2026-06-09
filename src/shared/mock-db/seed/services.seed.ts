// src/shared/mock-db/seed/services.seed.ts
/** Шаблон услуг специалиста (допустимые названия: выгул, передержка, груминг, тренировка, фотосессия). */

import type { SpecialistService } from '@/features/specialist-profile/model/types';

export const SEED_SPECIALIST_SERVICE_TEMPLATES: SpecialistService[] = [
  {
    id: 'walking',
    name: 'Выгул',
    locationLabel: 'На улице рядом с домом клиента',
    description: 'Выгул на улице рядом с домом клиента, длительность 60 минут.',
    price: 900,
    priceUnit: 'walk',
    bookingPolicy: {
      mode: 'fixed_slot',
      duration: {
        defaultDurationMinutes: 60,
        minDurationMinutes: 30,
        maxDurationMinutes: 90,
        durationStepMinutes: 30,
      },
      buffer: {
        hasBufferBefore: false,
        bufferBeforeMinutes: 0,
        hasBufferAfter: true,
        bufferAfterMinutes: 15,
      },
      compatibility: { canOverlapWithOtherServices: false, compatibleServiceIds: [] },
      advance: { minAdvanceMinutes: 120, maxAdvanceDays: 30 },
      allowsClientComment: true,
      requiresSpecialistConfirmation: true,
    },
  },
  {
    id: 'boarding',
    name: 'Передержка',
    locationLabel: 'У специалиста дома',
    description: 'Передержка у специалиста или у клиента. Срок: от 1 до 30 дней.',
    price: 1200,
    priceUnit: 'day',
    bookingPolicy: {
      mode: 'multi_day_stay',
      duration: {
        defaultDurationMinutes: 0,
        minDurationMinutes: 0,
        maxDurationMinutes: 0,
        durationStepMinutes: 0,
      },
      buffer: {
        hasBufferBefore: false,
        bufferBeforeMinutes: 0,
        hasBufferAfter: false,
        bufferAfterMinutes: 0,
      },
      compatibility: { canOverlapWithOtherServices: true, compatibleServiceIds: ['training'] },
      advance: { minAdvanceMinutes: 1440, maxAdvanceDays: 90 },
      multiDay: {
        allowsMultiDayBooking: true,
        minStayDays: 1,
        maxStayDays: 30,
        checkInTime: '13:00',
        checkOutTime: '11:00',
      },
      allowsClientComment: true,
      requiresSpecialistConfirmation: true,
    },
  },
  {
    id: 'grooming',
    name: 'Груминг',
    locationLabel: 'У вас или в зоне груминга',
    description: 'Купание, уход за шерстью и базовая гигиена.',
    price: 1800,
    priceUnit: 'service',
    bookingPolicy: {
      mode: 'fixed_slot',
      duration: {
        defaultDurationMinutes: 90,
        minDurationMinutes: 60,
        maxDurationMinutes: 120,
        durationStepMinutes: 30,
      },
      buffer: {
        hasBufferBefore: false,
        bufferBeforeMinutes: 0,
        hasBufferAfter: true,
        bufferAfterMinutes: 15,
      },
      compatibility: { canOverlapWithOtherServices: false, compatibleServiceIds: [] },
      advance: { minAdvanceMinutes: 180, maxAdvanceDays: 21 },
      allowsClientComment: true,
      requiresSpecialistConfirmation: true,
    },
  },
  {
    id: 'training',
    name: 'Тренировка',
    locationLabel: 'У вас или онлайн',
    description: 'Работа с поведением и базовыми командами.',
    price: 800,
    priceUnit: 'service',
    bookingPolicy: {
      mode: 'open_request',
      duration: {
        defaultDurationMinutes: 45,
        minDurationMinutes: 30,
        maxDurationMinutes: 60,
        durationStepMinutes: 15,
      },
      buffer: {
        hasBufferBefore: false,
        bufferBeforeMinutes: 0,
        hasBufferAfter: false,
        bufferAfterMinutes: 0,
      },
      compatibility: { canOverlapWithOtherServices: true, compatibleServiceIds: ['boarding'] },
      advance: { minAdvanceMinutes: 60, maxAdvanceDays: 30 },
      allowsClientComment: true,
      requiresSpecialistConfirmation: true,
    },
  },
  {
    id: 'photoshoot',
    name: 'Фотосессия',
    locationLabel: 'На улице или дома у клиента',
    description: 'Фотосессия на улице или дома у клиента.',
    price: 2500,
    priceUnit: 'service',
    bookingPolicy: {
      mode: 'time_range',
      duration: {
        defaultDurationMinutes: 120,
        minDurationMinutes: 90,
        maxDurationMinutes: 240,
        durationStepMinutes: 30,
      },
      buffer: {
        hasBufferBefore: true,
        bufferBeforeMinutes: 15,
        hasBufferAfter: true,
        bufferAfterMinutes: 30,
      },
      compatibility: { canOverlapWithOtherServices: false, compatibleServiceIds: [] },
      advance: { minAdvanceMinutes: 360, maxAdvanceDays: 45 },
      allowsClientComment: true,
      requiresSpecialistConfirmation: true,
    },
  },
];

function cloneServices(): SpecialistService[] {
  return JSON.parse(JSON.stringify(SEED_SPECIALIST_SERVICE_TEMPLATES)) as SpecialistService[];
}

/** Услуги с индивидуальными ценами по индексу специалиста. */
export function buildSpecialistServices(specialistIndex: number): SpecialistService[] {
  const services = cloneServices();
  const factor = 1 + (specialistIndex % 5) * 0.05;

  return services.map((s) => ({
    ...s,
    price: Math.round(s.price * factor),
  }));
}
