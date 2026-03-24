// src/pages/specialist-order-stats/model/statsSettingsStorage.ts

import {
  DEFAULT_SPECIALIST_ORDER_STATS_SETTINGS,
  type SpecialistOrderStatsSettings,
} from '../lib/computeSpecialistOrderStats';

const STORAGE_KEY_PREFIX = 'tailly.specialistOrderStats.settings.v1';

function isStatsPeriod(value: unknown): value is SpecialistOrderStatsSettings['period'] {
  return value === '7d' || value === '30d' || value === '90d' || value === 'all';
}

function mergeSettings(raw: unknown): SpecialistOrderStatsSettings {
  if (typeof raw !== 'object' || raw === null) {
    return { ...DEFAULT_SPECIALIST_ORDER_STATS_SETTINGS };
  }

  const o = raw as Record<string, unknown>;

  return {
    period: isStatsPeriod(o.period)
      ? o.period
      : DEFAULT_SPECIALIST_ORDER_STATS_SETTINGS.period,
    showStatusBreakdown:
      typeof o.showStatusBreakdown === 'boolean'
        ? o.showStatusBreakdown
        : DEFAULT_SPECIALIST_ORDER_STATS_SETTINGS.showStatusBreakdown,
    showRevenue:
      typeof o.showRevenue === 'boolean'
        ? o.showRevenue
        : DEFAULT_SPECIALIST_ORDER_STATS_SETTINGS.showRevenue,
    showByService:
      typeof o.showByService === 'boolean'
        ? o.showByService
        : DEFAULT_SPECIALIST_ORDER_STATS_SETTINGS.showByService,
    showTopClients:
      typeof o.showTopClients === 'boolean'
        ? o.showTopClients
        : DEFAULT_SPECIALIST_ORDER_STATS_SETTINGS.showTopClients,
    showReviewsBlock:
      typeof o.showReviewsBlock === 'boolean'
        ? o.showReviewsBlock
        : DEFAULT_SPECIALIST_ORDER_STATS_SETTINGS.showReviewsBlock,
    showCharts:
      typeof o.showCharts === 'boolean'
        ? o.showCharts
        : DEFAULT_SPECIALIST_ORDER_STATS_SETTINGS.showCharts,
  };
}

export function loadSpecialistOrderStatsSettings(
  specialistSlug: string,
): SpecialistOrderStatsSettings {
  const slug = specialistSlug.trim();
  if (!slug || typeof window === 'undefined') {
    return { ...DEFAULT_SPECIALIST_ORDER_STATS_SETTINGS };
  }

  try {
    const raw = window.localStorage.getItem(`${STORAGE_KEY_PREFIX}:${slug}`);
    if (!raw) {
      return { ...DEFAULT_SPECIALIST_ORDER_STATS_SETTINGS };
    }
    return mergeSettings(JSON.parse(raw) as unknown);
  } catch {
    return { ...DEFAULT_SPECIALIST_ORDER_STATS_SETTINGS };
  }
}

export function saveSpecialistOrderStatsSettings(
  specialistSlug: string,
  settings: SpecialistOrderStatsSettings,
): void {
  const slug = specialistSlug.trim();
  if (!slug || typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(
      `${STORAGE_KEY_PREFIX}:${slug}`,
      JSON.stringify(settings),
    );
  } catch {
    /* ignore quota / private mode */
  }
}
