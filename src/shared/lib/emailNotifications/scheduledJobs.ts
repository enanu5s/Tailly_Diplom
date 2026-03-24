import { readMockServiceOrders } from '@/features/orders/data/mockOrders';
import { readMockApplications } from '@/features/specialist-applications/data/mockSpecialistApplications';

import { runScheduledInterviewEmails, runScheduledServiceOrderEmails } from './dispatch';

/** Периодическая проверка: напоминания клиенту и дайджест специалисту (mock / демо). */
export function runEmailNotificationScheduler(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const orders = readMockServiceOrders();
    runScheduledServiceOrderEmails(orders);
  } catch {
    /* ignore */
  }

  try {
    const applications = readMockApplications();
    runScheduledInterviewEmails(applications);
  } catch {
    /* ignore */
  }
}
