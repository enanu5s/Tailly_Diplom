// src/features/orders/ui/OrdersServicesSection.tsx

import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { useAuth } from '@/features/auth/model/useAuth';
import { messagesStore } from '@/features/messages/model/messagesStore';
import { getMessagesViewerFromUser } from '@/features/messages/model/messagesViewer';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';
import { PaginationNav } from '@/shared/ui/pagination-nav';

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

type OrdersPresentation = 'default' | 'specialistOrders';

type Props = {
  viewerRole?: ViewerRole;
  /** Specialist profile orders: hero on page, two-column cards, “Популярные темы”. */
  presentation?: OrdersPresentation;
};

/** Как в каталоге магазина (`limit: 12`), чтобы пагинация вела себя предсказуемо. */
const SPECIALIST_ORDERS_PAGE_SIZE = 12;
const ORDERS_LIST_SCROLL_BREAKPOINT = 980;
const ORDERS_LIST_CARD_GAP = 20;
const ORDERS_LIST_NEXT_CARD_PEEK_RATIO = 0.28;

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
    return 'В работе';
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
  const cancellable =
    order.status === 'pending_confirmation' || order.status === 'confirmed';

  if (!cancellable) {
    return false;
  }

  return viewerRole === 'client' || viewerRole === 'specialist';
}

function specialistOrdersActionsClass(status: OrderStatus): string {
  if (status === 'completed' || status === 'canceled') {
    return styles.actionsSpecialistLayoutTerminal;
  }

  if (status === 'active') {
    return styles.actionsSpecialistLayoutActive;
  }

  if (status === 'pending_confirmation' || status === 'confirmed') {
    return styles.actionsSpecialistLayoutPreActive;
  }

  return '';
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
  ({ viewerRole = 'client', presentation = 'default' }: Props): ReactElement => {
    const isSpecialistViewer = viewerRole === 'specialist';
    const isSpecialistOrdersPresentation =
      presentation === 'specialistOrders' && isSpecialistViewer;
    const navigate = useAppNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const locationState = (location.state as ProfileOrdersLocationState | null) ?? null;

    const [freshOrderId, setFreshOrderId] = useState<string | null>(
      locationState?.justCreatedOrderId ?? null,
    );

    const [ordersListPage, setOrdersListPage] = useState(1);

    const orderRefs = useRef<Record<string, HTMLElement | null>>({});
    const listScrollRef = useRef<HTMLDivElement | null>(null);
    const serviceOrdersLength = ordersStore.serviceOrders.length;

    const updateOrdersListScrollHeight = useCallback(() => {
      const listScrollEl = listScrollRef.current;

      if (!listScrollEl || isSpecialistOrdersPresentation) {
        return;
      }

      const isCompactList = window.matchMedia(
        `(max-width: ${ORDERS_LIST_SCROLL_BREAKPOINT}px)`,
      ).matches;

      if (!isCompactList) {
        listScrollEl.style.removeProperty('--orders-list-max-height');
        return;
      }

      const firstCard = listScrollEl.querySelector('article');

      if (!firstCard) {
        listScrollEl.style.removeProperty('--orders-list-max-height');
        return;
      }

      const cardHeight = firstCard.getBoundingClientRect().height;
      const maxHeight =
        cardHeight +
        ORDERS_LIST_CARD_GAP +
        cardHeight * ORDERS_LIST_NEXT_CARD_PEEK_RATIO;

      listScrollEl.style.setProperty(
        '--orders-list-max-height',
        `${Math.round(maxHeight)}px`,
      );
    }, [isSpecialistOrdersPresentation]);

    useEffect(() => {
      void ordersStore.loadServices();
    }, []);

    useEffect(() => {
      if (!isSpecialistOrdersPresentation) {
        return;
      }

      setOrdersListPage(1);
    }, [ordersStore.servicesFilter, isSpecialistOrdersPresentation]);

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

    const specialistOrderTotalPages = Math.max(
      1,
      Math.ceil(serviceOrders.length / SPECIALIST_ORDERS_PAGE_SIZE),
    );

    const ordersPageSafe = Math.min(
      Math.max(1, ordersListPage),
      specialistOrderTotalPages,
    );

    useEffect(() => {
      if (!isSpecialistOrdersPresentation || ordersStore.servicesLoading) {
        return;
      }

      const targetId =
        locationState?.highlightedOrderId ?? locationState?.justCreatedOrderId;

      if (!targetId) {
        return;
      }

      const idx = serviceOrders.findIndex((o) => o.id === targetId);

      if (idx < 0) {
        return;
      }

      setOrdersListPage(Math.floor(idx / SPECIALIST_ORDERS_PAGE_SIZE) + 1);
    }, [
      isSpecialistOrdersPresentation,
      ordersStore.servicesLoading,
      location.key,
      locationState?.highlightedOrderId,
      locationState?.justCreatedOrderId,
      serviceOrders,
    ]);

    const visibleServiceOrders = useMemo(() => {
      if (!isSpecialistOrdersPresentation) {
        return serviceOrders;
      }

      const start = (ordersPageSafe - 1) * SPECIALIST_ORDERS_PAGE_SIZE;

      return serviceOrders.slice(start, start + SPECIALIST_ORDERS_PAGE_SIZE);
    }, [isSpecialistOrdersPresentation, serviceOrders, ordersPageSafe]);

    useEffect(() => {
      updateOrdersListScrollHeight();

      const listScrollEl = listScrollRef.current;

      if (!listScrollEl || isSpecialistOrdersPresentation) {
        return;
      }

      const mediaQuery = window.matchMedia(
        `(max-width: ${ORDERS_LIST_SCROLL_BREAKPOINT}px)`,
      );
      const handleLayoutChange = () => {
        updateOrdersListScrollHeight();
      };

      mediaQuery.addEventListener('change', handleLayoutChange);
      window.addEventListener('resize', handleLayoutChange);

      let resizeObserver: ResizeObserver | undefined;

      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(handleLayoutChange);
        resizeObserver.observe(listScrollEl);
      }

      return () => {
        mediaQuery.removeEventListener('change', handleLayoutChange);
        window.removeEventListener('resize', handleLayoutChange);
        resizeObserver?.disconnect();
      };
    }, [
      isSpecialistOrdersPresentation,
      ordersStore.servicesLoading,
      ordersStore.servicesFilter,
      updateOrdersListScrollHeight,
      visibleServiceOrders.length,
    ]);

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
      <section
        className={
          isSpecialistOrdersPresentation ? `${styles.section} ${styles.sectionSpecialistOrders}` : styles.section
        }
      >
        {!isSpecialistOrdersPresentation ? (
          <div className={styles.header}>
            <div>
              <h2 className={styles.title}>
                {isSpecialistViewer ? 'Заказы клиентов' : 'Заказы услуг специалистов'}
              </h2>
            </div>
          </div>
        ) : null}

        <div className={styles.filtersBlock}>
          {isSpecialistOrdersPresentation ? (
            <p className={styles.filtersLabel}>Сортировка заказов</p>
          ) : null}
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

        <div
          ref={listScrollRef}
          className={
            isSpecialistOrdersPresentation ? styles.listPlain : styles.listScroll
          }
        >
          <div
            className={
              isSpecialistOrdersPresentation ? `${styles.list} ${styles.listGrid}` : styles.list
            }
          >
            {visibleServiceOrders.map((order) => {
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
                              <span className={styles.metaValue}>{order.clientName}</span>
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

                  <div
                    className={
                      isSpecialistOrdersPresentation
                        ? `${styles.actions} ${specialistOrdersActionsClass(order.status)}`
                        : styles.actions
                    }
                  >
                    {isSpecialistOrdersPresentation ? (
                      <>
                        {order.status === 'completed' || order.status === 'canceled' ? (
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
                        ) : null}

                        {order.status === 'active' ? (
                          <>
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
                          </>
                        ) : null}

                        {order.status === 'pending_confirmation' ||
                        order.status === 'confirmed' ? (
                          <>
                            {canCancel(order, viewerRole) ? (
                              <button
                                type="button"
                                className={`${styles.secondaryButton} ${styles.dangerButton}`}
                                disabled={loadingThisCard}
                                onClick={() => {
                                  void ordersStore.cancelService(order.id);
                                }}
                              >
                                Отменить заказ
                              </button>
                            ) : null}
                            <div className={styles.actionsSpecialistRightCluster}>
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
                            </div>
                          </>
                        ) : null}
                      </>
                    ) : (
                      <>
                        {canCancel(order, viewerRole) ? (
                          <button
                            type="button"
                            className={`${styles.secondaryButton} ${styles.dangerButton}`}
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
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {isSpecialistOrdersPresentation &&
        !ordersStore.servicesLoading &&
        specialistOrderTotalPages > 1 ? (
          <div className={styles.paginationWrap}>
            <PaginationNav
              page={ordersPageSafe}
              totalPages={specialistOrderTotalPages}
              onPageChange={setOrdersListPage}
              ariaLabel="Пагинация списка заказов"
            />
          </div>
        ) : null}
      </section>
    );
  },
);
