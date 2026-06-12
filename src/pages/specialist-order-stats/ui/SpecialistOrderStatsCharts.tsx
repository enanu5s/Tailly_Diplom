// src/pages/specialist-order-stats/ui/SpecialistOrderStatsCharts.tsx

import { useEffect, useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import styles from './SpecialistOrderStatsCharts.module.css';
import {
  STATUS_LABELS,
  STATUS_ORDER,
  type ComputedSpecialistOrderStats,
} from '../lib/computeSpecialistOrderStats';

import type { CSSProperties, ReactElement } from 'react';

/** Цвета сегментов в порядке STATUS_ORDER (Figma) */
const STATUS_SEGMENT_COLORS = ['#ffa232', '#ffc721', '#ccd308', '#211500', '#e20b0b'];

function formatRubAxis(value: number, compact: boolean): string {
  if (!compact) {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(value);
  }

  if (value === 0) {
    return '0';
  }

  if (value >= 1000) {
    const thousands = value / 1000;
    const text = Number.isInteger(thousands)
      ? String(thousands)
      : thousands.toFixed(1).replace('.', ',');
    return `${text} тыс.`;
  }

  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercentRu(value: number | null): string {
  if (value === null) {
    return '—';
  }
  const text = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
  return `${text}%`;
}

export function OrderStatusPieChart({
  stats,
}: {
  stats: ComputedSpecialistOrderStats;
}): ReactElement | null {
  if (stats.totalInPeriod === 0) {
    return null;
  }

  const pieData = STATUS_ORDER.map((status, index) => ({
    key: status,
    name: STATUS_LABELS[status],
    value: stats.statusCounts[status],
    fill: STATUS_SEGMENT_COLORS[index] ?? '#c7c2ba',
  })).filter((row) => row.value > 0);

  if (pieData.length === 0) {
    return null;
  }

  return (
    <div className={styles.pieWrap}>
      <ResponsiveContainer width="100%" height={258}>
        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="25%"
            outerRadius="50%"
            paddingAngle={1.5}
            stroke="#ffffff"
            strokeWidth={2}
          >
            {pieData.map((entry) => (
              <Cell key={entry.key} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v) => {
              const n = typeof v === 'number' ? v : Number(v ?? 0);
              return [`${Number.isFinite(n) ? n : 0}`, 'Заказов'];
            }}
            contentStyle={{
              borderRadius: 10,
              border: '1px solid #c7c2ba',
              fontFamily: 'Rubik, system-ui, sans-serif',
              fontSize: 13,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

type ServiceChartProps = {
  byService: ComputedSpecialistOrderStats['byService'];
  formatRub: (value: number) => string;
};

export function OrderServiceRevenueBarChart({
  byService,
  formatRub,
}: ServiceChartProps): ReactElement | null {
  const rows = useMemo(() => {
    return byService.slice(0, 10).map((row) => {
      const title = row.serviceTitle.trim() || '—';
      return {
        key: title,
        label: title,
        revenue: row.revenueRub,
        orders: row.totalCount,
      };
    });
  }, [byService]);

  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const [compactAxis, setCompactAxis] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 640px)');
    const syncCompactAxis = (): void => {
      setCompactAxis(mediaQuery.matches);
    };

    syncCompactAxis();
    mediaQuery.addEventListener('change', syncCompactAxis);
    return () => mediaQuery.removeEventListener('change', syncCompactAxis);
  }, []);

  if (rows.length === 0) {
    return null;
  }

  const maxRevenue = Math.max(...rows.map((r) => r.revenue), 1);
  const axisMax = Math.max(5000, Math.ceil(maxRevenue / 1000) * 1000);
  const tickSteps = compactAxis ? 2 : 5;
  const ticks = Array.from({ length: tickSteps + 1 }, (_, index) =>
    (axisMax / tickSteps) * index,
  );

  return (
    <div className={styles.revenuePanel}>
      <h2 className={styles.revenueTitle}>Выручка по услугам</h2>
      <div className={styles.revenueChart}>
      <div className={styles.revenuePlot}>
        <div className={styles.revenueYAxis} aria-hidden />
        <div className={styles.revenueRows}>
          {rows.map((row) => {
            const widthPct = Math.min(100, (row.revenue / axisMax) * 100);
            const active = hoverKey === row.key;

            return (
              <div
                key={row.key}
                className={styles.revenueRow}
                onPointerEnter={() => setHoverKey(row.key)}
                onPointerLeave={() => setHoverKey(null)}
              >
                <span className={styles.revenueLabel}>{row.label}</span>
                <div className={styles.revenueTrack}>
                  <div
                    className={styles.revenueBar}
                    style={{ width: `${widthPct}%` } as CSSProperties}
                  />
                </div>
                {active ? (
                  <div className={styles.revenueTooltip} role="tooltip">
                    <div className={styles.revenueTooltipTitle}>{row.label}</div>
                    <div className={styles.revenueTooltipLine}>
                      Прибыль: {formatRub(row.revenue)}
                    </div>
                    <div className={styles.revenueTooltipMeta}>
                      Заказов: {row.orders}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.revenueTicks}>
        {ticks.map((t) => (
          <span key={t} className={styles.revenueTick}>
            {formatRubAxis(t, compactAxis)}
          </span>
        ))}
      </div>
      </div>
    </div>
  );
}

export function OrderStatsStatusSectionLayout({
  stats,
}: {
  stats: ComputedSpecialistOrderStats;
}): ReactElement {
  return (
    <div className={styles.statusPanel}>
      <h2 className={styles.panelTitle}>Диаграмма по статусам</h2>

      {stats.totalInPeriod === 0 ? (
        <p className={styles.panelEmpty}>В выбранном периоде заказов пока нет.</p>
      ) : (
        <>
          <div className={styles.statusBody}>
            <OrderStatusPieChart stats={stats} />
            <div className={styles.statusLegendColumn}>
              <ul className={styles.statusLegend} aria-label="Статусы заказов">
                {STATUS_ORDER.map((status, index) => (
                  <li key={status} className={styles.statusLegendRow}>
                    <span
                      className={styles.statusSwatch}
                      style={{ background: STATUS_SEGMENT_COLORS[index] }}
                    />
                    <span className={styles.statusLegendLabel}>
                      {STATUS_LABELS[status]}
                    </span>
                    <span className={styles.statusLegendValue}>
                      {stats.statusCounts[status]}
                    </span>
                  </li>
                ))}
              </ul>
              <div className={styles.cancelRateRow}>
                <span>Процент отмен</span>
                <span>{formatPercentRu(stats.cancellationRatePercent)}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
