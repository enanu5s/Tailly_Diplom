// src/pages/specialist-order-stats/ui/SpecialistOrderStatsCharts.tsx

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import styles from './SpecialistOrderStatsCharts.module.css';
import {
  STATUS_LABELS,
  STATUS_ORDER,
  type ComputedSpecialistOrderStats,
} from '../lib/computeSpecialistOrderStats';

import type { CSSProperties, ReactElement } from 'react';

const STATUS_COLORS = [
  '#f59e0b',
  '#3b82f6',
  '#8b5cf6',
  '#22c55e',
  '#ef4444',
];

const SERVICE_BAR_COLOR = '#6366f1';

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
    fill: STATUS_COLORS[index] ?? '#94a3b8',
  })).filter((row) => row.value > 0);

  if (pieData.length === 0) {
    return null;
  }

  return (
    <div className={styles.chartWrap}>
      <h4 className={styles.chartTitle}>Диаграмма по статусам</h4>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={58}
            outerRadius={92}
            paddingAngle={2}
          >
            {pieData.map((entry) => (
              <Cell key={entry.key} fill={entry.fill} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => {
              const n =
                typeof value === 'number'
                  ? value
                  : Number(value ?? 0);
              return [`${Number.isFinite(n) ? n : 0} заказ.`, 'Количество'];
            }}
            labelFormatter={(label) => String(label)}
            contentStyle={{
              borderRadius: 10,
              border: '1px solid rgba(17, 24, 39, 0.08)',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <ul className={styles.legendList} aria-label="Легенда диаграммы">
        {pieData.map((row) => (
          <li key={row.key} className={styles.legendItem}>
            <span
              className={styles.legendSwatch}
              style={{ backgroundColor: row.fill }}
            />
            <span className={styles.legendLabel}>{row.name}</span>
            <span className={styles.legendValue}>{row.value}</span>
          </li>
        ))}
      </ul>
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
  if (byService.length === 0) {
    return null;
  }

  const rows = byService.slice(0, 10).map((row) => {
    const title = row.serviceTitle.trim() || 'Услуга';
    const short =
      title.length > 36 ? `${title.slice(0, 34).trim()}…` : title;
    return {
      key: title,
      name: short,
      fullName: title,
      revenue: row.revenueRub,
      orders: row.totalCount,
    };
  });

  const barHeight = Math.max(280, rows.length * 44 + 48);

  return (
    <div
      className={styles.serviceChartSection}
      style={
        {
          '--service-rows': rows.length,
        } as CSSProperties
      }
    >
      <h4 className={styles.chartTitle}>Выручка по услугам (завершённые)</h4>
      <div className={styles.serviceChartWrap}>
        <ResponsiveContainer width="100%" height={barHeight}>
          <BarChart
            layout="vertical"
            data={rows}
            margin={{ top: 8, right: 20, left: 8, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
            <XAxis
              type="number"
              tickFormatter={(v) => formatRub(Number(v))}
              tick={{ fontSize: 11, fill: '#6b7280' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={148}
              tick={{ fontSize: 11, fill: '#374151' }}
              interval={0}
            />
            <Tooltip
              formatter={(value, _name, item) => {
                const payload = item?.payload as
                  | { fullName?: string; orders?: number }
                  | undefined;
                const num =
                  typeof value === 'number'
                    ? value
                    : Number(value ?? 0);
                const rub = Number.isFinite(num) ? formatRub(num) : String(value ?? '');
                const ordersNote =
                  typeof payload?.orders === 'number'
                    ? ` · заказов: ${payload.orders}`
                    : '';
                return [`${rub}${ordersNote}`, 'Выручка'];
              }}
              labelFormatter={(_label, payload) => {
                const row = payload?.[0]?.payload as { fullName?: string } | undefined;
                return row?.fullName ?? '';
              }}
              contentStyle={{
                borderRadius: 10,
                border: '1px solid rgba(17, 24, 39, 0.08)',
                maxWidth: 320,
              }}
            />
            <Bar dataKey="revenue" radius={[0, 6, 6, 0]} maxBarSize={28}>
              {rows.map((row) => (
                <Cell key={row.key} fill={SERVICE_BAR_COLOR} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function OrderStatsStatusSectionLayout({
  stats,
  children,
}: {
  stats: ComputedSpecialistOrderStats;
  children: ReactElement;
}): ReactElement {
  return (
    <div className={styles.statusBlock}>
      <OrderStatusPieChart stats={stats} />
      <div>{children}</div>
    </div>
  );
}
