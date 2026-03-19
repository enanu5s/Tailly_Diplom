// src/features/orders/ui/OrdersServicesSection.tsx

import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { ordersStore } from '../model/ordersStore';
import type {
  OrderStatus,
  ServiceOrder,
  ServicesFilter,
} from '../model/types';

import styles from './OrdersServicesSection.module.css';

import type { ReactElement } from 'react';

type ViewerRole = 'client' | 'specialist' | 'admin' | 'super_admin';

type ProfileOrdersLocationState = {
  activeTab?: string;
  highlightedOrderId?: string;
  justCreatedOrderId?: string;
};

type Props = {
  viewerRole?: ViewerRole;
};

const FILTERS: Array<{ value: ServicesFilter; label: string }> = [
  { value: 'all', label: 'Все' },
  { value: 'upcoming', label: 'Будущие' },
  { value: 'pending_confirmation', label: 'Ждут подтверждения' },
  { value: 'confirmed', label: 'Подтверждённые' },
  { value: 'active', label: 'Активные' },
  { value: 'completed', label: 'Завершённые' },
  { value: 'canceled', label: 'Отменённые' },
];

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateOnly(isoOrDate: string): string {
  const value = isoOrDate.length === 10 ? `${isoOrDate}T00:00:00` : isoOrDate;

  return new Date(value).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatStatus(status: OrderStatus): string {
  if (status === 'pending_confirmation') {
    return 'Ждёт подтверждения';
  }

  if (status === 'confirmed') {
    return 'Подтверждён';
  }

  if (status === 'active') {
    return 'Выполняется';
  }

  if (status === 'completed') {
    return 'Завершён';
  }

  if (status === 'canceled') {
    return 'Отменён';
  }

  return status;
}

function getStatusTone(status: OrderStatus): string {
  if (status === 'pending_confirmation') {
    return styles.statusPending;
  }

  if (status === 'confirmed') {
    return styles.statusConfirmed;
  }

  if (status === 'active') {
    return styles.statusActive;
  }

  if (status === 'completed') {
    return styles.statusCompleted;
  }

  if (status === 'canceled') {
    return styles.statusCanceled;
  }

  return styles.statusNeutral;
}

function formatPrice(value: number, currency: 'RUB'): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatBookingMode(mode: ServiceOrder['schedule']['mode']): string {
  if (mode === 'fixed_slot') {
    return 'Фиксированный слот';
  }

  if (mode === 'time_range') {
    return 'Произвольный интервал';
  }

  if (mode === 'multi_day_stay') {
    return 'Передержка';
  }

  if (mode === 'open_request') {
    return 'Свободный запрос';
  }

  return mode;
}

function buildOrderTimeLabel(order: ServiceOrder): string {
  if (order.schedule.mode === 'fixed_slot') {
    const start = new Date(order.schedule.startAt);
    const end = new Date(order.schedule.endAt);

    const sameDay = start.toDateString() === end.toDateString();

    if (sameDay) {
      return `${start.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })}, ${start.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      })} – ${end.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    }

    return `${formatDateTime(order.schedule.startAt)} – ${formatDateTime(order.schedule.endAt)}`;
  }

  if (order.schedule.mode === 'time_range') {
    return `${formatDateTime(order.schedule.startAt)} – ${formatDateTime(order.schedule.endAt)}`;
  }

  if (order.schedule.mode === 'multi_day_stay') {
    return `Заезд: ${formatDateTime(order.schedule.checkInAt)} • Выезд: ${formatDateTime(order.schedule.checkOutAt)}`;
  }

  if (order.schedule.requestedDate) {
    const startTime = order.schedule.requestedStartTime
      ? `, c ${order.schedule.requestedStartTime}`
      : '';
    const endTime = order.schedule.requestedEndTime
      ? ` до ${order.schedule.requestedEndTime}`
      : '';

    return `${formatDateOnly(order.schedule.requestedDate)}${startTime}${endTime}`;
  }

  return 'По согласованию со специалистом';
}

function buildOrderSecondaryLabel(order: ServiceOrder): string | null {
  if (order.schedule.mode === 'multi_day_stay') {
    return `${order.schedule.stayDays} дн.`;
  }

  if (order.schedule.mode === 'open_request') {
    return 'Время будет согласовано после подтверждения';
  }

  if (order.schedule.mode === 'time_range') {
    const start = new Date(order.schedule.startAt);
    const end = new Date(order.schedule.endAt);
    const durationMinutes = Math.max(
      0,
      Math.round((end.getTime() - start.getTime()) / (1000 * 60)),
    );

    if (!durationMinutes) {
      return null;
    }

    if (durationMinutes % 60 === 0) {
      return `${durationMinutes / 60} ч`;
    }

    return `${durationMinutes} мин`;
  }

  return null;
}

function canLeaveReview(order: ServiceOrder, viewerRole: ViewerRole): boolean {
  return (
    viewerRole === 'client' &&
    order.status === 'completed' &&
    !order.hasReview
  );
}

function canRepeat(order: ServiceOrder, viewerRole: ViewerRole): boolean {
  return viewerRole === 'client' && order.status === 'completed';
}

function canCancel(order: ServiceOrder, viewerRole: ViewerRole): boolean {
  return (
    viewerRole === 'client' &&
    (order.status === 'pending_confirmation' || order.status === 'confirmed')
  );
}

function canConfirm(order: ServiceOrder, viewerRole: ViewerRole): boolean {
  return viewerRole === 'specialist' && order.status === 'pending_confirmation';
}

function canStart(order: ServiceOrder, viewerRole: ViewerRole): boolean {
  return viewerRole === 'specialist' && order.status === 'confirmed';
}

function canComplete(order: ServiceOrder, viewerRole: ViewerRole): boolean {
  return viewerRole === 'specialist' && order.status === 'active';
}

function isRelevantProfileState(
  state: ProfileOrdersLocationState | null,
): boolean {
  if (!state) {
    return false;
  }

  return Boolean(
    state.highlightedOrderId || state.justCreatedOrderId || state.activeTab,
  );
}

export const OrdersServicesSection = observer(
  ({ viewerRole = 'client' }: Props): ReactElement => {
    const navigate = useNavigate();
    const location = useLocation();
    const locationState =
      (location.state as ProfileOrdersLocationState | null) ?? null;

    const [reviewDrafts, setReviewDrafts] = useState<Record<string, number>>({});
    const [freshOrderId, setFreshOrderId] = useState<string | null>(
      locationState?.justCreatedOrderId ?? null,
    );

    const orderRefs = useRef<Record<string, HTMLElement | null>>({});

    useEffect(() => {
      void ordersStore.loadServices();
    }, []);

    useEffect(() => {
      if (
        !locationState?.highlightedOrderId &&
        !locationState?.justCreatedOrderId
      ) {
        return;
      }

      const targetId =
        locationState.justCreatedOrderId ?? locationState.highlightedOrderId;

      if (!targetId) {
        return;
      }

      const timer = window.setTimeout(() => {
        const node = orderRefs.current[targetId];

        if (node) {
          node.scrollIntoView({
            block: 'center',
            behavior: 'smooth',
          });
        }
      }, 150);

      if (locationState.justCreatedOrderId) {
        setFreshOrderId(locationState.justCreatedOrderId);

        const clearFreshTimer = window.setTimeout(() => {
          setFreshOrderId(null);
        }, 3500);

        return () => {
          window.clearTimeout(timer);
          window.clearTimeout(clearFreshTimer);
        };
      }

      return () => {
        window.clearTimeout(timer);
      };
    }, [
      location.key,
      locationState?.highlightedOrderId,
      locationState?.justCreatedOrderId,
      ordersStore.serviceOrders.length,
    ]);

    useEffect(() => {
      if (!isRelevantProfileState(locationState)) {
        return;
      }

      navigate(location.pathname, {
        replace: true,
        state: null,
      });
    }, [location.pathname, locationState, navigate]);

    const serviceOrders = useMemo(() => {
      return ordersStore.serviceOrders;
    }, [ordersStore.serviceOrders]);

    const handleSetFilter = (filter: ServicesFilter): void => {
      ordersStore.setServicesFilter(filter);
    };

    const handleRepeat = async (orderId: string): Promise<void> => {
      await ordersStore.repeatService(orderId);

      if (ordersStore.actionError) {
        return;
      }

      navigate(`/service-booking?repeat=${encodeURIComponent(orderId)}`);
    };

    const handleLeaveReview = async (orderId: string): Promise<void> => {
      const rating = reviewDrafts[orderId];

      if (!rating) {
        return;
      }

      await ordersStore.leaveReview(orderId, rating);
    };

    return (
      <section className={styles.section}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Заказы услуг</h2>
            <p className={styles.subtitle}>
              Здесь собраны все этапы заказа: создание, подтверждение,
              выполнение, завершение, отзыв и повторный заказ.
            </p>
          </div>
        </div>

        <div className={styles.filters}>
          {FILTERS.map((filter) => {
            const isActive = ordersStore.servicesFilter === filter.value;

            return (
              <button
                key={filter.value}
                type="button"
                className={
                  isActive ? styles.filterButtonActive : styles.filterButton
                }
                onClick={() => {
                  handleSetFilter(filter.value);
                }}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {ordersStore.servicesError ? (
          <div className={styles.errorBox}>{ordersStore.servicesError}</div>
        ) : null}

        {ordersStore.actionError ? (
          <div className={styles.errorBox}>{ordersStore.actionError}</div>
        ) : null}

        {ordersStore.servicesLoading ? (
          <div className={styles.loadingBox}>Загружаем заказы...</div>
        ) : null}

        {!ordersStore.servicesLoading && serviceOrders.length === 0 ? (
          <div className={styles.emptyState}>
            По выбранному фильтру заказов пока нет.
          </div>
        ) : null}

        <div className={styles.list}>
          {serviceOrders.map((order) => {
            const loadingThisCard = ordersStore.actionLoadingId === order.id;
            const currentReviewDraft = reviewDrafts[order.id] ?? 5;
            const isFresh = freshOrderId === order.id;
            const secondaryLabel = buildOrderSecondaryLabel(order);

            return (
              <article
                key={order.id}
                ref={(node) => {
                  orderRefs.current[order.id] = node;
                }}
                className={isFresh ? styles.cardFresh : styles.card}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.cardHeaderMain}>
                    <div className={styles.orderTitleRow}>
                      <h3 className={styles.orderTitle}>{order.serviceTitle}</h3>
                      <span
                        className={`${styles.statusBadge} ${getStatusTone(order.status)}`}
                      >
                        {formatStatus(order.status)}
                      </span>
                    </div>

                    <div className={styles.metaGrid}>
                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Специалист</span>
                        <span className={styles.metaValue}>{order.sitterName}</span>
                      </div>

                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Питомец</span>
                        <span className={styles.metaValue}>{order.petName}</span>
                      </div>

                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Формат бронирования</span>
                        <span className={styles.metaValue}>
                          {formatBookingMode(order.schedule.mode)}
                        </span>
                      </div>

                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Дата и время</span>
                        <span className={styles.metaValue}>
                          {buildOrderTimeLabel(order)}
                        </span>
                      </div>

                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Формат услуги</span>
                        <span className={styles.metaValue}>
                          {order.locationLabel}
                        </span>
                      </div>

                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Стоимость</span>
                        <span className={styles.metaValue}>
                          {formatPrice(order.price, order.currency)}
                        </span>
                      </div>

                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Создан</span>
                        <span className={styles.metaValue}>
                          {formatDateTime(order.createdAt)}
                        </span>
                      </div>

                      {secondaryLabel ? (
                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>Дополнительно</span>
                          <span className={styles.metaValue}>{secondaryLabel}</span>
                        </div>
                      ) : null}
                    </div>

                    {order.comment ? (
                      <div className={styles.commentBox}>
                        <span className={styles.metaLabel}>Комментарий</span>
                        <p className={styles.commentText}>{order.comment}</p>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className={styles.timeline}>
                  {order.lifecycle.map((item, index) => (
                    <div
                      key={`${order.id}-${item.status}-${item.changedAt}-${index}`}
                      className={styles.timelineItem}
                    >
                      <span className={styles.timelineDot} />
                      <div className={styles.timelineContent}>
                        <div className={styles.timelineTitle}>
                          {formatStatus(item.status)}
                        </div>
                        <div className={styles.timelineDate}>
                          {formatDateTime(item.changedAt)}
                        </div>
                        {item.comment ? (
                          <div className={styles.timelineComment}>
                            {item.comment}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.actions}>
                  {canCancel(order, viewerRole) ? (
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      disabled={loadingThisCard}
                      onClick={() => {
                        void ordersStore.cancelService(order.id);
                      }}
                    >
                      Отменить заказ
                    </button>
                  ) : null}

                  {canConfirm(order, viewerRole) ? (
                    <button
                      type="button"
                      className={styles.primaryButton}
                      disabled={loadingThisCard}
                      onClick={() => {
                        void ordersStore.confirmService(order.id);
                      }}
                    >
                      Подтвердить
                    </button>
                  ) : null}

                  {canStart(order, viewerRole) ? (
                    <button
                      type="button"
                      className={styles.primaryButton}
                      disabled={loadingThisCard}
                      onClick={() => {
                        void ordersStore.startService(order.id);
                      }}
                    >
                      Начать выполнение
                    </button>
                  ) : null}

                  {canComplete(order, viewerRole) ? (
                    <button
                      type="button"
                      className={styles.primaryButton}
                      disabled={loadingThisCard}
                      onClick={() => {
                        void ordersStore.completeService(order.id);
                      }}
                    >
                      Завершить заказ
                    </button>
                  ) : null}

                  {canRepeat(order, viewerRole) ? (
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      disabled={loadingThisCard}
                      onClick={() => {
                        void handleRepeat(order.id);
                      }}
                    >
                      Повторить заказ
                    </button>
                  ) : null}
                </div>

                {canLeaveReview(order, viewerRole) ? (
                  <div className={styles.reviewBox}>
                    <div className={styles.reviewTitle}>Оставить отзыв</div>

                    <div className={styles.reviewControls}>
                      <label className={styles.reviewLabel}>
                        Оценка
                        <select
                          className={styles.select}
                          value={currentReviewDraft}
                          onChange={(event) => {
                            const nextValue = Number(event.target.value);

                            setReviewDrafts((prev) => ({
                              ...prev,
                              [order.id]: nextValue,
                            }));
                          }}
                        >
                          <option value={5}>5</option>
                          <option value={4}>4</option>
                          <option value={3}>3</option>
                          <option value={2}>2</option>
                          <option value={1}>1</option>
                        </select>
                      </label>

                      <button
                        type="button"
                        className={styles.primaryButton}
                        disabled={loadingThisCard}
                        onClick={() => {
                          void handleLeaveReview(order.id);
                        }}
                      >
                        Отправить отзыв
                      </button>
                    </div>
                  </div>
                ) : null}

                {order.status === 'completed' && order.hasReview ? (
                  <div className={styles.successBox}>
                    Отзыв уже оставлен
                    {order.rating ? `, оценка: ${order.rating}/5` : '.'}
                  </div>
                ) : null}

                {isFresh ? (
                  <div className={styles.freshBadge}>
                    Новый заказ успешно создан
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>
    );
  },
);