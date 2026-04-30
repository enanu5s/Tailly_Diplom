// src/features/orders/ui/OrdersServicesSection.tsx

import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { useAuth } from '@/features/auth/model/useAuth';
import { messagesStore } from '@/features/messages/model/messagesStore';
import { getMessagesViewerFromUser } from '@/features/messages/model/messagesViewer';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import styles from './OrdersServicesSection.module.css';
import { ordersStore } from '../model/ordersStore';

import type { OrderStatus, ServiceOrder, ServicesFilter } from '../model/types';
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

function formatCompactDateTime(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
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

function buildOrderStartLabel(order: ServiceOrder): string {
  if (order.schedule.mode === 'fixed_slot' || order.schedule.mode === 'time_range') {
    return formatCompactDateTime(order.schedule.startAt);
  }

  if (order.schedule.mode === 'multi_day_stay') {
    return formatCompactDateTime(order.schedule.checkInAt);
  }

  return buildOrderTimeLabel(order);
}

function buildOrderEndLabel(order: ServiceOrder): string {
  if (order.schedule.mode === 'fixed_slot' || order.schedule.mode === 'time_range') {
    return formatCompactDateTime(order.schedule.endAt);
  }

  if (order.schedule.mode === 'multi_day_stay') {
    return formatCompactDateTime(order.schedule.checkOutAt);
  }

  return 'По согласованию';
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

function isRelevantProfileState(state: ProfileOrdersLocationState | null): boolean {
  if (!state) {
    return false;
  }

  return Boolean(state.highlightedOrderId || state.justCreatedOrderId || state.activeTab);
}

export const OrdersServicesSection = observer(
  ({ viewerRole = 'client' }: Props): ReactElement => {
    const isSpecialistViewer = viewerRole === 'specialist';
    const navigate = useAppNavigate();
    const location = useLocation();
    const { specialistSlug: specialistSlugParam } = useParams<{
      specialistSlug?: string;
    }>();
    const { user } = useAuth();
    const specialistSlug = specialistSlugParam?.trim() ?? '';
    const locationState = (location.state as ProfileOrdersLocationState | null) ?? null;

    const [freshOrderId, setFreshOrderId] = useState<string | null>(
      locationState?.justCreatedOrderId ?? null,
    );

    const orderRefs = useRef<Record<string, HTMLElement | null>>({});
    const serviceOrdersLength = ordersStore.serviceOrders.length;

    useEffect(() => {
      void ordersStore.loadServices();
    }, []);

    useEffect(() => {
      if (!locationState?.highlightedOrderId && !locationState?.justCreatedOrderId) {
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
      serviceOrdersLength,
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

    const serviceOrders = ordersStore.serviceOrders;

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

    const openSpecialistProfile = (specialistSlugValue: string): void => {
      navigate(`/specialists/${specialistSlugValue}`, {
        state: {
          from: `${location.pathname}${location.search}`,
        },
      });
    };

    const openClientProfile = (order: ServiceOrder): void => {
      const slug = specialistSlug || order.specialistSlug;
      const clientKey = order.clientSlug || order.clientId;
      if (!slug || !clientKey) {
        return;
      }

      navigate(`/specialists/${slug}/clients/${encodeURIComponent(clientKey)}`, {
        state: {
          from: `${location.pathname}${location.search}`,
        },
      });
    };

    const handleContactClient = async (order: ServiceOrder): Promise<void> => {
      if (!user?.id) {
        return;
      }

      await messagesStore.startChatWithClient({
        viewer: getMessagesViewerFromUser(user),
        clientId: order.clientId,
        clientName: order.clientName,
      });

      navigate('/messages');
    };

    return (
      <section className={styles.section}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>
              {isSpecialistViewer ? 'Заказы клиентов' : 'Заказы услуг специалистов'}
            </h2>
          </div>
        </div>

        <div className={styles.filters}>
          {FILTERS.map((filter) => {
            const isActive = ordersStore.servicesFilter === filter.value;

            return (
              <button
                key={filter.value}
                type="button"
                className={isActive ? styles.filterButtonActive : styles.filterButton}
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
          <div className={styles.emptyState}>По выбранному фильтру заказов пока нет.</div>
        ) : null}

        <div className={styles.listScroll}>
          <div className={styles.list}>
            {serviceOrders.map((order) => {
              const loadingThisCard = ordersStore.actionLoadingId === order.id;
              const isFresh = freshOrderId === order.id;
              const startLabel = buildOrderStartLabel(order);
              const isLongStartLabel = startLabel.length > 26;

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
                        <span
                          className={`${styles.statusBadge} ${getStatusTone(order.status)}`}
                        >
                          {formatStatus(order.status)}
                        </span>
                        <span className={styles.createdBadge}>
                          {formatCompactDateTime(order.createdAt)}
                        </span>
                        <h3 className={styles.orderTitle}>{order.serviceTitle}</h3>
                      </div>

                      {isFresh ? (
                        <div className={styles.freshBanner} role="status">
                          Новый заказ успешно создан
                        </div>
                      ) : null}

                      <div className={styles.metaGrid}>
                        {isSpecialistViewer ? (
                          <>
                            <div
                              className={`${styles.metaItem} ${styles.metaOrderNumber}`}
                            >
                              <span className={styles.metaLabel}>Номер заказа</span>
                              <span className={styles.metaValue}>{order.id}</span>
                            </div>
                            <div className={`${styles.metaItem} ${styles.metaPerson}`}>
                              <span className={styles.metaLabel}>Клиент:</span>
                              <button
                                type="button"
                                className={styles.inlineLinkButton}
                                onClick={() => {
                                  openClientProfile(order);
                                }}
                              >
                                {order.clientName}
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className={`${styles.metaItem} ${styles.metaPerson}`}>
                            <span className={styles.metaLabel}>Специалист:</span>
                            <button
                              type="button"
                              className={styles.inlineLinkButton}
                              onClick={() => {
                                openSpecialistProfile(order.specialistSlug);
                              }}
                            >
                              {order.sitterName}
                            </button>
                          </div>
                        )}

                        <div className={`${styles.metaItem} ${styles.metaPet}`}>
                          <span className={styles.metaLabel}>Питомец:</span>
                          <span className={styles.metaValue}>{order.petName}</span>
                        </div>

                        <div className={`${styles.metaItem} ${styles.metaStart}`}>
                          <span className={styles.metaLabel}>Начало услуги:</span>
                          <span className={styles.metaValue}>{startLabel}</span>
                        </div>

                        <div
                          className={`${styles.metaItem} ${styles.metaEnd} ${
                            isLongStartLabel ? styles.metaEndAfterWrappedStart : ''
                          }`}
                        >
                          <span className={styles.metaLabel}>Конец услуги:</span>
                          <span className={styles.metaValue}>
                            {buildOrderEndLabel(order)}
                          </span>
                        </div>

                        <div className={`${styles.metaItem} ${styles.metaPrice}`}>
                          <span className={styles.metaLabel}>Стоимость:</span>
                          <span className={styles.metaValue}>
                            {formatPrice(order.price, order.currency)}
                          </span>
                        </div>

                        <div className={`${styles.metaItem} ${styles.metaFormat}`}>
                          <span className={styles.metaLabel}>Формат услуги:</span>
                          <span className={styles.metaValue}>{order.locationLabel}</span>
                        </div>
                      </div>

                      {order.comment ? (
                        <div className={styles.commentBox}>
                          <span className={styles.metaLabel}>
                            Подробности услуги (комментарий):
                          </span>
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
                            <div className={styles.timelineComment}>{item.comment}</div>
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

                    {!isSpecialistViewer ? (
                      <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={() => {
                          openSpecialistProfile(order.specialistSlug);
                        }}
                      >
                        Перейти в профиль специалиста
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          className={styles.primaryButton}
                          onClick={() => {
                            openClientProfile(order);
                          }}
                        >
                          Профиль клиента
                        </button>
                        <button
                          type="button"
                          className={styles.secondaryButton}
                          disabled={!user?.id}
                          onClick={() => {
                            void handleContactClient(order);
                          }}
                        >
                          Связаться
                        </button>
                      </>
                    )}

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
                </article>
              );
            })}
          </div>
        </div>
      </section>
    );
  },
);
