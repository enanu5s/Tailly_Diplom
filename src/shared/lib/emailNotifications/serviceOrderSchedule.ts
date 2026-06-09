import type { ServiceOrder } from '@/features/orders/model/types';

/** Ближайший момент начала услуги по заказу (для напоминаний). */
export function getServiceOrderStartInstant(order: ServiceOrder): Date | null {
  const s = order.schedule;

  try {
    switch (s.mode) {
      case 'fixed_slot':
      case 'time_range':
        return new Date(s.startAt);
      case 'multi_day_stay':
        return new Date(s.checkInAt);
      case 'open_request': {
        if (s.requestedDate && s.requestedStartTime) {
          const iso = `${s.requestedDate}T${s.requestedStartTime}:00`;
          const d = new Date(iso);
          if (!Number.isNaN(d.getTime())) {
            return d;
          }
        }
        return new Date(order.dateFrom);
      }
      default:
        return null;
    }
  } catch {
    return null;
  }
}

export function formatServiceOrderWhen(order: ServiceOrder): string {
  const start = getServiceOrderStartInstant(order);
  if (start && !Number.isNaN(start.getTime())) {
    return start.toLocaleString('ru-RU', {
      dateStyle: 'long',
      timeStyle: 'short',
    });
  }
  return order.dateFrom;
}
