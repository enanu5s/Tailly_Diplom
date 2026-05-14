// src/pages/specialist-order-stats/ui/SpecialistOrderStatsPage.tsx

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import type { ServiceOrder } from '@/features/orders/model/types';
import { ordersService } from '@/features/orders/service/ordersService';

import {
  OrderServiceRevenueBarChart,
  OrderStatsStatusSectionLayout,
} from './SpecialistOrderStatsCharts';
import kpiChameleonUrl from '../assets/kpi-chameleon.png';
import styles from './SpecialistOrderStatsPage.module.css';
import { SpecialistOrderStatsPeriodSelect } from './SpecialistOrderStatsPeriodSelect';
import {
  STATUS_LABELS,
  STATUS_ORDER,
  computeSpecialistOrderStats,
  filterOrdersForSpecialistAndPeriod,
  type SpecialistOrderStatsSettings,
} from '../lib/computeSpecialistOrderStats';
import {
  loadSpecialistOrderStatsSettings,
  saveSpecialistOrderStatsSettings,
} from '../model/statsSettingsStorage';

import type { ReactElement } from 'react';

const PERIOD_OPTIONS: { value: SpecialistOrderStatsSettings['period']; label: string }[] =
  [
    { value: '7d', label: 'Последние 7 дней' },
    { value: '30d', label: 'Последние 30 дней' },
    { value: '90d', label: 'Последние 90 дней' },
    { value: 'all', label: 'За всё время' },
  ];

function formatRub(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCancellationRate(value: number | null): string {
  if (value === null) {
    return '—';
  }
  const text = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
  return `${text}%`;
}

export const SpecialistOrderStatsPage = (): ReactElement => {
  const { specialistSlug } = useParams<{ specialistSlug: string }>();
  const slug = specialistSlug?.trim() ?? '';
  const profilePath = slug ? `/specialists/${slug}` : '/';

  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<SpecialistOrderStatsSettings>(() =>
    loadSpecialistOrderStatsSettings(slug),
  );

  useEffect(() => {
    setSettings(loadSpecialistOrderStatsSettings(slug));
  }, [slug]);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void ordersService
      .getServiceOrders('all')
      .then((list) => {
        if (!cancelled) {
          setOrders(list);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Не удалось загрузить заказы для статистики',
          );
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const persistSettings = useCallback(
    (next: SpecialistOrderStatsSettings) => {
      saveSpecialistOrderStatsSettings(slug, next);
    },
    [slug],
  );

  const updateSettings = useCallback(
    (patch: Partial<SpecialistOrderStatsSettings>): void => {
      setSettings((prev) => {
        const next = { ...prev, ...patch };
        persistSettings(next);
        return next;
      });
    },
    [persistSettings],
  );

  const filteredOrders = useMemo(
    () => filterOrdersForSpecialistAndPeriod(orders, slug, settings.period),
    [orders, slug, settings.period],
  );

  const stats = useMemo(
    () => computeSpecialistOrderStats(filteredOrders),
    [filteredOrders],
  );

  const canceledCount = stats.statusCounts.canceled;

  const leftColumn =
    settings.showStatusBreakdown && settings.showCharts ? (
      <OrderStatsStatusSectionLayout stats={stats} />
    ) : settings.showStatusBreakdown && !settings.showCharts ? (
      <div className={styles.statusCardFallback}>
        <h2 className={styles.statusCardFallbackTitle}>По статусам</h2>
        {stats.totalInPeriod === 0 ? (
          <p className={styles.emptyHint}>В выбранном периоде заказов пока нет.</p>
        ) : (
          <ul className={styles.statusList}>
            {STATUS_ORDER.map((status) => (
              <li key={status} className={styles.statusRow}>
                <span>{STATUS_LABELS[status]}</span>
                <span className={styles.statusCount}>{stats.statusCounts[status]}</span>
              </li>
            ))}
            <li className={styles.statusRow}>
              <span>Процент отмен</span>
              <span className={styles.statusCount}>
                {formatCancellationRate(stats.cancellationRatePercent)}
              </span>
            </li>
          </ul>
        )}
      </div>
    ) : null;

  const rightColumn =
    settings.showByService && settings.showCharts ? (
      <OrderServiceRevenueBarChart byService={stats.byService} formatRub={formatRub} />
    ) : null;

  const chartsRowVisible = Boolean(leftColumn || rightColumn);
  const chartsColumnCount = (leftColumn ? 1 : 0) + (rightColumn ? 1 : 0);

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.toolbar}>
          <Link to={profilePath} className={styles.backPill}>
            <span className={styles.backArrow} aria-hidden />
            Назад
          </Link>
        </div>

        <h1 className={styles.title}>Статистика по заказам</h1>
        <p className={styles.subtitle}>
          Сводка по вашим заказам услуг: статусы, выручка, услуги и клиенты. Период и блоки
          на экране можно настроить — параметры сохраняются в этом браузере.
        </p>

        <div className={styles.periodRow}>
          <SpecialistOrderStatsPeriodSelect
            options={PERIOD_OPTIONS}
            value={settings.period}
            onChange={(period) => updateSettings({ period })}
          />
        </div>

        {error ? <div className={styles.errorBox}>{error}</div> : null}

        {loading ? (
          <div className={styles.loadingBox}>Загружаем данные...</div>
        ) : !slug ? (
          <p className={styles.emptyHint}>Не указан профиль специалиста.</p>
        ) : (
          <>
            <div className={styles.kpiRowWrap}>
              <div className={styles.kpiRow}>
                <div className={styles.kpiCard}>
                  <div className={styles.kpiLabel}>Количество заказов</div>
                  <div className={styles.kpiValue}>{stats.totalInPeriod}</div>
                </div>
                <div className={styles.kpiCard}>
                  <div className={styles.kpiLabel}>Отменено заказов</div>
                  <div className={styles.kpiValue}>{canceledCount}</div>
                </div>
                <div className={styles.kpiCard}>
                  <div className={styles.kpiLabel}>Прибыль за период</div>
                  <div className={styles.kpiValue}>
                    {settings.showRevenue
                      ? formatRub(stats.completedRevenueRub)
                      : '—'}
                  </div>
                </div>
                <div className={styles.kpiCard}>
                  <div className={styles.kpiLabel}>Средний чек заказа</div>
                  <div className={styles.kpiValue}>
                    {settings.showRevenue && stats.avgCheckRub !== null
                      ? formatRub(stats.avgCheckRub)
                      : '—'}
                  </div>
                </div>
              </div>
              <div className={styles.kpiRowArt} aria-hidden>
                <img
                  src={kpiChameleonUrl}
                  alt=""
                  className={styles.kpiRowArtImg}
                  width={220}
                  height={138}
                />
              </div>
            </div>

            {chartsRowVisible ? (
              <div
                className={`${styles.chartsRow}${
                  chartsColumnCount === 1 ? ` ${styles.chartsRowSingle}` : ''
                }`}
              >
                {leftColumn}
                {rightColumn}
              </div>
            ) : null}

            {settings.showByService && !settings.showCharts ? (
              <section className={styles.sectionCard}>
                <h3 className={styles.sectionTitle}>По услугам</h3>
                {stats.byService.length === 0 ? (
                  <p className={styles.emptyHint}>Нет данных по услугам.</p>
                ) : (
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Услуга</th>
                          <th className={styles.numCell}>Заказов</th>
                          <th className={styles.numCell}>Завершено</th>
                          <th className={styles.numCell}>Выручка</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.byService.map((row) => (
                          <tr key={row.serviceTitle}>
                            <td>{row.serviceTitle}</td>
                            <td className={styles.numCell}>{row.totalCount}</td>
                            <td className={styles.numCell}>{row.completedCount}</td>
                            <td className={styles.numCell}>{formatRub(row.revenueRub)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            ) : null}

          </>
        )}
      </div>
    </div>
  );
};
