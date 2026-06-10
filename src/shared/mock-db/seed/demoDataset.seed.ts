// src/shared/mock-db/seed/demoDataset.seed.ts
/** Утилиты для slug/displayName специалистов. Данные аккаунтов — в accounts.seed.ts */

import { SPECIALIST_ACCOUNT_META } from './accounts.seed';

export {
  DEMO_CLIENT_PASSWORD as DEMO_CLIENT_SPECIALIST_PASSWORD,
  DEMO_ADMIN_PASSWORD as DEMO_ADMIN_PANEL_PASSWORD,
  DEMO_SUPER_ADMIN_PASSWORD as DEMO_SUPER_ADMIN_PANEL_PASSWORD,
} from './accounts.seed';

export type DemoSpecialistSpec = {
  index: number;
  firstName: string;
  lastName: string;
  city: string;
  about: string;
};

export function buildDemoSpecialistSpecs(): DemoSpecialistSpec[] {
  return SPECIALIST_ACCOUNT_META.slice(1).map((s, i) => ({
    index: i + 2,
    firstName: s.firstName,
    lastName: s.lastName,
    city: s.city,
    about: 'Демо-специалист платформы Тейлли.',
  }));
}

export function specialistDemoSlug(last: string, first: string, index: number): string {
  const ru = `${last}-${first}`;
  const lat = ru.toLowerCase().replace(/ё/g, 'e').replace(/\s+/g, '-');
  const ascii = lat
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return ascii || `specialist-demo-${index}`;
}

export function getDemoSpecialistDisplayNameForProfileId(id: string): string {
  const meta = SPECIALIST_ACCOUNT_META.find((s) => s.id === id);
  if (!meta) {
    return id;
  }

  return `${meta.firstName} ${meta.lastName.charAt(0)}.`;
}
