//src/features/orders/ui/OrdersServicesSection.tsx
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { petsStore } from '@/features/pets/model/petsStore';

import styles from './OrdersServicesSection.module.css';
import { ordersStore } from '../model/ordersStore';

import type { ServicesFilter, ServiceOrder } from '../model/types';




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
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={f.key === ordersStore.servicesFilter ? styles.filterActive : styles.filterBtn}
              onClick={() => ordersStore.setServicesFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {ordersStore.servicesError && <div className={styles.error}>{ordersStore.servicesError}</div>}
      {ordersStore.actionError && <div className={styles.error}>{ordersStore.actionError}</div>}

      {ordersStore.servicesLoading && ordersStore.serviceOrders.length === 0 ? (
        <div className={styles.state}>Загружаем заказы...</div>
      ) : ordersStore.serviceOrders.length === 0 ? (
        <div className={styles.state}>Пока нет заказов по выбранному фильтру.</div>
      ) : (
        <div className={styles.list}>
          {ordersStore.serviceOrders.map((o) => (
            <ServiceOrderCard key={o.id} order={o} />
          ))}
        </div>
      )}
    </section>
  );
});

const ServiceOrderCard = observer(({ order }: { order: ServiceOrder }) => {
  const date = formatDateTime(order.dateFrom, order.dateTo);

  const isCanceled = order.status === 'canceled';

  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className={styles.order}>
      <div className={styles.serviceTitle}>{order.serviceTitle || '—'}</div>
      <div className={styles.left}>
        <div className={styles.date}>{date}</div>

        <div className={styles.row}>
          <span className={styles.label}>Питомец:</span>
          <button
            className={styles.linkBtn}
            type="button"
            onClick={() => {
              petsStore.revealPet(order.petId);
              const el = document.getElementById('pets-section');
              el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
              // фундамент под профиль ситтера
              // позже: navigate(/sitters/${order.sitterId})
              // пока ничего не делаем, но UI кликабелен
            }}
          >
            {order.sitterName}
          </button>
        </div>

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
        <div className={styles.price}>{formatPrice(order.price, order.currency)}</div>

<button
          className={styles.secondaryBtn}
          type="button"
          disabled={ordersStore.actionLoadingId === order.id}
          onClick={() => void ordersStore.repeatService(order.id)}
        >
          {ordersStore.actionLoadingId === order.id ? '...' : 'Повторить заказ'}
        </button>

        <button
          className={order.hasReview ? styles.thanksBtn : styles.primaryBtn}
          type="button"
          disabled={isCanceled || order.hasReview || ordersStore.actionLoadingId === order.id}
          onClick={() => {
            if (isCanceled) return;

            navigate(`/profile/review/${order.id}`, {
              state: { from: location.pathname + location.search },
            });
          }}
        >
          {isCanceled ? 'Недоступно для отменённых' : order.hasReview ? 'Спасибо за отзыв!' : 'Оставить отзыв'}
        </button>
      </div>
    </div>
  );
});

function formatDateTime(fromIso: string, toIso?: string) {
  const from = new Date(fromIso);
  const base = from.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: '2-digit' });

  const t1 = from.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  if (!toIso) return `${base}, ${t1}`;

  const to = new Date(toIso);
  const t2 = to.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  return `${base}, ${t1}–${t2}`;
}

function formatPrice(value: number, currency: 'RUB') {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency }).format(value);
}

function mapServiceStatus(s: string) {
  if (s === 'upcoming') return 'Предстоящий';
  if (s === 'active') return 'Активный';
  if (s === 'completed') return 'Завершён';
  if (s === 'canceled') return 'Отменён';
  return s;
}

function renderStars(rating?: number) {
  const r = rating ?? 0;
  const full = '★'.repeat(Math.max(0, Math.min(5, r)));
  const empty = '☆'.repeat(5 - Math.max(0, Math.min(5, r)));
  return r ? `${full}${empty}` : '—';
}