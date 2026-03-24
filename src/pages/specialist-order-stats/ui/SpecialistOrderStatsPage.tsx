// src/pages/specialist-order-stats/ui/SpecialistOrderStatsPage.tsx

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import type { ServiceOrder } from '@/features/orders/model/types';
import { ordersService } from '@/features/orders/service/ordersService';

import {
  OrderServiceRevenueBarChart,
  OrderStatsStatusSectionLayout,
} from './SpecialistOrderStatsCharts';
import styles from './SpecialistOrderStatsPage.module.css';
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

export const SpecialistOrderStatsPage = (): ReactElement => {
  const { specialistSlug } = useParams<{ specialistSlug: string }>();
  const slug = specialistSlug?.trim() ?? '';
  const profilePath = slug ? `/specialists/${slug}` : '/';
  const ordersPath = slug ? `/specialists/${slug}/orders` : '/';

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

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb}>
          <Link to={profilePath} className={styles.backLink}>
            ← Профиль специалиста
          </Link>
          <Link to={ordersPath} className={styles.backLink}>
            Заказы клиентов
          </Link>
        </nav>

        <header className={styles.header}>
          <h1 className={styles.title}>Статистика по заказам</h1>
          <p className={styles.subtitle}>
            Сводка по вашим заказам услуг: статусы, выручка, услуги и клиенты. Период и
            блоки на экране можно настроить — параметры сохраняются в этом браузере.
          </p>
        </header>

        <section className={styles.settingsCard} aria-labelledby="stats-settings-title">
          <h2 id="stats-settings-title" className={styles.settingsTitle}>
            Настройка отображения
          </h2>
          <div className={styles.settingsGrid}>
            <div>
              <label className={styles.fieldLabel} htmlFor="stats-period">
                Период
              </label>
              <select
                id="stats-period"
                className={styles.select}
                value={settings.period}
                onChange={(e) => {
                  const value = e.target.value as SpecialistOrderStatsSettings['period'];
                  updateSettings({ period: value });
                }}
              >
                {PERIOD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className={styles.fieldLabel}>Блоки на странице</span>
              <div className={styles.checkboxList}>
                <label className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={settings.showStatusBreakdown}
                    onChange={(e) => {
                      updateSettings({ showStatusBreakdown: e.target.checked });
                    }}
                  />
                  <span>Распределение по статусам</span>
                </label>
                <label className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={settings.showRevenue}
                    onChange={(e) => {
                      updateSettings({ showRevenue: e.target.checked });
                    }}
                  />
                  <span>Выручка и средний чек</span>
                </label>
                <label className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={settings.showByService}
                    onChange={(e) => {
                      updateSettings({ showByService: e.target.checked });
                    }}
                  />
                  <span>По услугам</span>
                </label>
                <label className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={settings.showTopClients}
                    onChange={(e) => {
                      updateSettings({ showTopClients: e.target.checked });
                    }}
                  />
                  <span>Топ клиентов</span>
                </label>
                <label className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={settings.showReviewsBlock}
                    onChange={(e) => {
                      updateSettings({ showReviewsBlock: e.target.checked });
                    }}
                  />
                  <span>Отзывы за период</span>
                </label>
                <label className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={settings.showCharts}
                    onChange={(e) => {
                      updateSettings({ showCharts: e.target.checked });
                    }}
                  />
                  <span>Диаграммы</span>
                </label>
              </div>
            </div>
          </div>
          <p className={styles.settingsHint}>
            Настройки хранятся локально и не синхронизируются между устройствами.
          </p>
        </section>

        {error ? <div className={styles.errorBox}>{error}</div> : null}

        {loading ? (
          <div className={styles.loadingBox}>Загружаем данные...</div>
        ) : !slug ? (
          <p className={styles.emptyHint}>Не указан профиль специалиста.</p>
        ) : (
          <>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryCard}>
                <div className={styles.summaryValue}>{stats.totalInPeriod}</div>
                <div className={styles.summaryLabel}>Заказов в выбранном периоде</div>
              </div>
              <div className={styles.summaryCard}>
                <div className={styles.summaryValue}>{stats.completedCount}</div>
                <div className={styles.summaryLabel}>Завершено</div>
              </div>
              {settings.showRevenue ? (
                <>
                  <div className={styles.summaryCard}>
                    <div className={styles.summaryValue}>
                      {formatRub(stats.completedRevenueRub)}
                    </div>
                    <div className={styles.summaryLabel}>Выручка по завершённым</div>
                  </div>
                  <div className={styles.summaryCard}>
                    <div className={styles.summaryValue}>
                      {stats.avgCheckRub !== null ? formatRub(stats.avgCheckRub) : '—'}
                    </div>
                    <div className={styles.summaryLabel}>Средний чек</div>
                  </div>
                </>
              ) : null}
            </div>

            {settings.showStatusBreakdown ? (
              <section className={styles.sectionCard}>
                <h3 className={styles.sectionTitle}>По статусам</h3>
                {stats.totalInPeriod === 0 ? (
                  <p className={styles.emptyHint}>
                    В выбранном периоде заказов пока нет.
                  </p>
                ) : settings.showCharts ? (
                  <OrderStatsStatusSectionLayout stats={stats}>
                    <ul className={styles.statusList}>
                      {STATUS_ORDER.map((status) => (
                        <li key={status} className={styles.statusRow}>
                          <span>{STATUS_LABELS[status]}</span>
                          <span className={styles.statusCount}>
                            {stats.statusCounts[status]}
                          </span>
                        </li>
                      ))}
                      <li className={styles.statusRow}>
                        <span>Доля отмен от всех заказов в периоде</span>
                        <span className={styles.statusCount}>
                          {stats.cancellationRatePercent !== null
                            ? `${stats.cancellationRatePercent}%`
                            : '—'}
                        </span>
                      </li>
                    </ul>
                  </OrderStatsStatusSectionLayout>
                ) : (
                  <ul className={styles.statusList}>
                    {STATUS_ORDER.map((status) => (
                      <li key={status} className={styles.statusRow}>
                        <span>{STATUS_LABELS[status]}</span>
                        <span className={styles.statusCount}>
                          {stats.statusCounts[status]}
                        </span>
                      </li>
                    ))}
                    <li className={styles.statusRow}>
                      <span>Доля отмен от всех заказов в периоде</span>
                      <span className={styles.statusCount}>
                        {stats.cancellationRatePercent !== null
                          ? `${stats.cancellationRatePercent}%`
                          : '—'}
                      </span>
                    </li>
                  </ul>
                )}
              </section>
            ) : null}

            {settings.showReviewsBlock ? (
              <section className={styles.sectionCard}>
                <h3 className={styles.sectionTitle}>Отзывы</h3>
                {stats.completedCount === 0 ? (
                  <p className={styles.emptyHint}>
                    Нет завершённых заказов в периоде — оценки не считаются.
                  </p>
                ) : (
                  <ul className={styles.statusList}>
                    <li className={styles.statusRow}>
                      <span>Завершённых заказов с отзывом</span>
                      <span className={styles.statusCount}>{stats.ordersWithReview}</span>
                    </li>
                    <li className={styles.statusRow}>
                      <span>Средняя оценка (по завершённым с оценкой)</span>
                      <span className={styles.statusCount}>
                        {stats.avgRating !== null ? stats.avgRating.toFixed(2) : '—'}
                      </span>
                    </li>
                  </ul>
                )}
              </section>
            ) : null}

            {settings.showByService ? (
              <section className={styles.sectionCard}>
                <h3 className={styles.sectionTitle}>По услугам</h3>
                {stats.byService.length === 0 ? (
                  <p className={styles.emptyHint}>Нет данных по услугам.</p>
                ) : (
                  <>
                    {settings.showCharts ? (
                      <OrderServiceRevenueBarChart
                        byService={stats.byService}
                        formatRub={formatRub}
                      />
                    ) : null}
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
                              <td className={styles.numCell}>
                                {formatRub(row.revenueRub)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </section>
            ) : null}

            {settings.showTopClients ? (
              <section className={styles.sectionCard}>
                <h3 className={styles.sectionTitle}>Клиенты по выручке</h3>
                {stats.topClients.length === 0 ? (
                  <p className={styles.emptyHint}>
                    Нет завершённых заказов — список клиентов пуст.
                  </p>
                ) : (
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Клиент</th>
                          <th className={styles.numCell}>Визитов</th>
                          <th className={styles.numCell}>Выручка</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.topClients.map((row) => (
                          <tr key={row.clientId}>
                            <td>
                              <Link
                                className={styles.clientLink}
                                to={`/specialists/${slug}/clients/${row.clientId}`}
                              >
                                {row.clientName}
                              </Link>
                            </td>
                            <td className={styles.numCell}>{row.completedCount}</td>
                            <td className={styles.numCell}>
                              {formatRub(row.revenueRub)}
                            </td>
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
