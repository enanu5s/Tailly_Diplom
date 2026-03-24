// src/pages/specialist-order-stats/lib/computeSpecialistOrderStats.ts

import type { OrderStatus, ServiceOrder } from '@/features/orders/model/types';

export type StatsPeriod = '7d' | '30d' | '90d' | 'all';

export type SpecialistOrderStatsSettings = {
  period: StatsPeriod;
  showStatusBreakdown: boolean;
  showRevenue: boolean;
  showByService: boolean;
  showTopClients: boolean;
  showReviewsBlock: boolean;
  showCharts: boolean;
};

export const DEFAULT_SPECIALIST_ORDER_STATS_SETTINGS: SpecialistOrderStatsSettings = {
  period: '30d',
  showStatusBreakdown: true,
  showRevenue: true,
  showByService: true,
  showTopClients: true,
  showReviewsBlock: true,
  showCharts: true,
};

export const STATUS_ORDER: OrderStatus[] = [
  'pending_confirmation',
  'confirmed',
  'active',
  'completed',
  'canceled',
];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_confirmation: 'Ожидают подтверждения',
  confirmed: 'Подтверждены',
  active: 'В работе',
  completed: 'Завершены',
  canceled: 'Отменены',
};

export function getPeriodStart(period: StatsPeriod): Date | null {
  if (period === 'all') {
    return null;
  }

  const now = new Date();
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const start = new Date(now);
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);
  return start;
}

export function filterOrdersForSpecialistAndPeriod(
  orders: ServiceOrder[],
  specialistSlug: string,
  period: StatsPeriod,
): ServiceOrder[] {
  const slug = specialistSlug.trim();
  const start = getPeriodStart(period);

  return orders.filter((order) => {
    if (order.specialistSlug !== slug) {
      return false;
    }

    if (!start) {
      return true;
    }

    const created = new Date(order.createdAt);
    return !Number.isNaN(created.getTime()) && created >= start;
  });
}

export type ServiceAggregate = {
  serviceTitle: string;
  totalCount: number;
  completedCount: number;
  revenueRub: number;
};

export type ClientAggregate = {
  clientId: string;
  clientName: string;
  completedCount: number;
  revenueRub: number;
};

export type ComputedSpecialistOrderStats = {
  totalInPeriod: number;
  statusCounts: Record<OrderStatus, number>;
  completedCount: number;
  completedRevenueRub: number;
  avgCheckRub: number | null;
  byService: ServiceAggregate[];
  topClients: ClientAggregate[];
  cancellationRatePercent: number | null;
  ordersWithReview: number;
  avgRating: number | null;
};

const emptyStatusCounts = (): Record<OrderStatus, number> => ({
  pending_confirmation: 0,
  confirmed: 0,
  active: 0,
  completed: 0,
  canceled: 0,
});

export function computeSpecialistOrderStats(
  orders: ServiceOrder[],
): ComputedSpecialistOrderStats {
  const statusCounts = emptyStatusCounts();
  let completedRevenueRub = 0;
  const serviceMap = new Map<
    string,
    { total: number; completed: number; revenue: number }
  >();
  const clientMap = new Map<
    string,
    { name: string; completed: number; revenue: number }
  >();
  let ratingSum = 0;
  let ratingCount = 0;
  let ordersWithReview = 0;

  for (const order of orders) {
    statusCounts[order.status] += 1;

    const title = order.serviceTitle.trim() || 'Услуга';
    const existingService = serviceMap.get(title) ?? {
      total: 0,
      completed: 0,
      revenue: 0,
    };
    existingService.total += 1;
    if (order.status === 'completed') {
      existingService.completed += 1;
      existingService.revenue += order.price;
    }
    serviceMap.set(title, existingService);

    if (order.status === 'completed') {
      completedRevenueRub += order.price;

      const cid = order.clientId;
      const existingClient = clientMap.get(cid) ?? {
        name: order.clientName.trim() || 'Клиент',
        completed: 0,
        revenue: 0,
      };
      existingClient.completed += 1;
      existingClient.revenue += order.price;
      if (order.clientName.trim()) {
        existingClient.name = order.clientName.trim();
      }
      clientMap.set(cid, existingClient);
    }

    if (order.status === 'completed' && order.hasReview) {
      ordersWithReview += 1;
      if (typeof order.rating === 'number' && order.rating >= 1 && order.rating <= 5) {
        ratingSum += order.rating;
        ratingCount += 1;
      }
    }
  }

  const completedCount = statusCounts.completed;
  const canceledCount = statusCounts.canceled;
  const totalInPeriod = orders.length;

  const avgCheckRub =
    completedCount > 0 ? Math.round(completedRevenueRub / completedCount) : null;

  const cancellationRatePercent =
    totalInPeriod > 0 ? Math.round((canceledCount / totalInPeriod) * 1000) / 10 : null;

  const byService: ServiceAggregate[] = [...serviceMap.entries()]
    .map(([serviceTitle, v]) => ({
      serviceTitle,
      totalCount: v.total,
      completedCount: v.completed,
      revenueRub: v.revenue,
    }))
    .sort((a, b) => b.revenueRub - a.revenueRub || b.totalCount - a.totalCount);

  const topClients: ClientAggregate[] = [...clientMap.entries()]
    .map(([clientId, v]) => ({
      clientId,
      clientName: v.name,
      completedCount: v.completed,
      revenueRub: v.revenue,
    }))
    .sort((a, b) => b.revenueRub - a.revenueRub || b.completedCount - a.completedCount)
    .slice(0, 8);

  const avgRating =
    ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 100) / 100 : null;

  return {
    totalInPeriod,
    statusCounts,
    completedCount,
    completedRevenueRub,
    avgCheckRub,
    byService,
    topClients,
    cancellationRatePercent,
    ordersWithReview,
    avgRating,
  };
}
