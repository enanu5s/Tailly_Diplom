// src/features/orders/ui/OrdersServicesSection.tsx

import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { petsStore } from '@/features/pets/model/petsStore';

import styles from './OrdersServicesSection.module.css';
import { ordersStore } from '../model/ordersStore';
import type { ServiceOrder, ServicesFilter } from '../model/types';

const FILTERS: Array<{ key: ServicesFilter; label: string }> = [
  { key: 'all', label: 'Все' },
  { key: 'upcoming', label: 'Предстоящие' },
  { key: 'active', label: 'Активные' },
  { key: 'completed', label: 'Завершённые' },
  { key: 'canceled', label: 'Отменённые' },
];

export const OrdersServicesSection = observer(() => {
  useEffect(() => {
    void ordersStore.loadServices();
  }, []);

  return (
    <section className={styles.card}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>Мои заказы (услуги)</h2>

        <div className={styles.filters}>
          {FILTERS.map((filter) => (
            <button
              key={filter.key}
              type="button"
              className={
                filter.key === ordersStore.servicesFilter
                  ? styles.filterActive
                  : styles.filterBtn
              }
              onClick={() => {
                ordersStore.setServicesFilter(filter.key);
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {ordersStore.servicesError ? (
        <div className={styles.error}>{ordersStore.servicesError}</div>
      ) : null}

      {ordersStore.actionError ? (
        <div className={styles.error}>{ordersStore.actionError}</div>
      ) : null}

      {ordersStore.servicesLoading && ordersStore.serviceOrders.length === 0 ? (
        <div className={styles.state}>Загружаем заказы...</div>
      ) : ordersStore.serviceOrders.length === 0 ? (
        <div className={styles.state}>
          Пока нет заказов по выбранному фильтру.
        </div>
      ) : (
        <div className={styles.list}>
          {ordersStore.serviceOrders.map((order) => (
            <ServiceOrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </section>
  );
});

const ServiceOrderCard = observer(({ order }: { order: ServiceOrder }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isCanceled = order.status === 'canceled';
  const isCompleted = order.status === 'completed';
  const canComplete =
    order.status === 'upcoming' || order.status === 'active';
  const canLeaveReview = isCompleted && !order.hasReview;
  const isActionLoading = ordersStore.actionLoadingId === order.id;

  return (
    <div className={styles.order}>
      <div className={styles.left}>
        <div className={styles.serviceTitle}>{order.serviceTitle || '—'}</div>
        <div className={styles.date}>
          {formatDateTime(order.dateFrom, order.dateTo)}
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Питомец:</span>
          <button
            className={styles.linkBtn}
            type="button"
            onClick={() => {
              petsStore.revealPet(order.petId);
              const element = document.getElementById('pets-section');
              element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            {order.petName}
          </button>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Петситтер:</span>
          <button
            className={styles.linkBtn}
            type="button"
            onClick={() => {
              navigate(`/specialists/${order.specialistSlug}`);
            }}
          >
            {order.sitterName}
          </button>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Формат:</span>
          <span className={styles.metaText}>{order.locationLabel}</span>
        </div>

        {order.comment ? (
          <div className={styles.row}>
            <span className={styles.label}>Комментарий:</span>
            <span className={styles.metaText}>{order.comment}</span>
          </div>
        ) : null}

        <div className={styles.row}>
          <span className={styles.label}>Статус:</span>
          <span className={styles.status}>{mapServiceStatus(order.status)}</span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Оценка:</span>
          <span className={styles.stars}>{renderStars(order.rating)}</span>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.price}>
          {formatPrice(order.price, order.currency)}
        </div>

        {canComplete ? (
          <button
            className={styles.primaryBtn}
            type="button"
            disabled={isActionLoading}
            onClick={() => {
              void ordersStore.completeService(order.id);
            }}
          >
            {isActionLoading ? '...' : 'Завершить заказ'}
          </button>
        ) : (
          <button
            className={styles.secondaryBtn}
            type="button"
            disabled={isActionLoading}
            onClick={() => {
              navigate(`/orders/create?repeat=${encodeURIComponent(order.id)}`);
            }}
          >
            {isActionLoading ? '...' : 'Повторить заказ'}
          </button>
        )}

        <button
          className={order.hasReview ? styles.thanksBtn : styles.secondaryBtn}
          type="button"
          disabled={!canLeaveReview || isActionLoading || isCanceled}
          onClick={() => {
            if (!canLeaveReview) {
              return;
            }

            navigate(`/profile/review/${order.id}`, {
              state: { from: location.pathname + location.search },
            });
          }}
        >
          {isCanceled
            ? 'Недоступно для отменённых'
            : order.hasReview
              ? 'Спасибо за отзыв!'
              : isCompleted
                ? 'Оставить отзыв'
                : 'Сначала завершите заказ'}
        </button>
      </div>
    </div>
  );
});

function formatDateTime(fromIso: string, toIso?: string): string {
  const from = new Date(fromIso);
  const base = from.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  });
  const start = from.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (!toIso) {
    return `${base}, ${start}`;
  }

  const to = new Date(toIso);
  const end = to.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${base}, ${start}–${end}`;
}

function formatPrice(value: number, currency: 'RUB'): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
  }).format(value);
}

function mapServiceStatus(status: string): string {
  if (status === 'upcoming') {
    return 'Предстоящий';
  }

  if (status === 'active') {
    return 'Активный';
  }

  if (status === 'completed') {
    return 'Завершён';
  }

  if (status === 'canceled') {
    return 'Отменён';
  }

  return status;
}

function renderStars(rating?: number): string {
  const safeRating = Math.max(0, Math.min(5, rating ?? 0));
  const full = '★'.repeat(safeRating);
  const empty = '☆'.repeat(5 - safeRating);

  return full + empty;
}