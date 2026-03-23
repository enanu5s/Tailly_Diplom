// src/pages/shop/ui/ShopOrderResultPage.tsx

import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import { ordersStore } from '@/features/orders/model/ordersStore';
import { canCancelProductOrder } from '@/features/orders/model/types';

import styles from './ShopOrderResultPage.module.css';

export const ShopOrderResultPage = observer(() => {
  const { orderId } = useParams<{ orderId: string }>();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'auto',
    });
  }, []);

  useEffect(() => {
    if (!orderId) {
      return;
    }

    void ordersStore.loadProductById(orderId);

    return () => {
      ordersStore.clearSelectedProductOrder();
    };
  }, [orderId]);

  const order = ordersStore.selectedProductOrder;
  const isLoading = ordersStore.selectedProductLoading;
  const error = ordersStore.selectedProductError;
  const isActionLoading = order
    ? ordersStore.actionLoadingId === order.id
    : false;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.breadcrumbs}>
          <Link to="/" className={styles.breadcrumbLink}>
            Главная
          </Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <Link to="/shop" className={styles.breadcrumbLink}>
            Магазин
          </Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>Заказ</span>
        </div>

        {isLoading ? (
          <div className={styles.stateCard}>
            <h1 className={styles.title}>Загружаем заказ</h1>
            <p className={styles.subtitle}>
              Подготавливаем информацию о заказе.
            </p>
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className={styles.stateCard}>
            <h1 className={styles.title}>Не удалось открыть заказ</h1>
            <p className={styles.subtitle}>{error}</p>

            <div className={styles.actions}>
              <Link to="/shop" className={styles.primaryLink}>
                Вернуться в магазин
              </Link>
            </div>
          </div>
        ) : null}

        {!isLoading && !error && order ? (
          <div className={styles.layout}>
            <section className={styles.mainCard}>
              <div className={styles.badge}>
                {getStatusBadgeLabel(order.status)}
              </div>

              <h1 className={styles.title}>Заказ {order.number}</h1>

              <p className={styles.subtitle}>
                {getStatusDescription(order.status)}
              </p>

              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Статус</span>
                  <span className={styles.infoValue}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Дата оформления</span>
                  <span className={styles.infoValue}>
                    {formatDateTime(order.createdAt)}
                  </span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Доставка</span>
                  <span className={styles.infoValue}>
                    {getDeliveryLabel(order.delivery?.method)}
                  </span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Оплата</span>
                  <span className={styles.infoValue}>
                    {getPaymentLabel(order.payment?.method)}
                  </span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Статус оплаты</span>
                  <span className={styles.infoValue}>
                    {getPaymentStatusLabel(order.payment?.status)}
                  </span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Получатель</span>
                  <span className={styles.infoValue}>
                    {order.recipient
                      ? `${order.recipient.fullName}, ${order.recipient.phone}`
                      : 'Не указан'}
                  </span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Адрес / точка выдачи</span>
                  <span className={styles.infoValue}>
                    {getAddressLabel(order)}
                  </span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Трекинг</span>
                  <span className={styles.infoValue}>
                    {order.delivery?.trackingNumber ?? 'Пока не назначен'}
                  </span>
                </div>
              </div>

              {order.cancelReason ? (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Причина отмены</span>
                  <span className={styles.infoValue}>{order.cancelReason}</span>
                </div>
              ) : null}

              <div className={styles.actions}>
                {canCancelProductOrder(order) ? (
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    disabled={isActionLoading}
                    onClick={() => {
                      void ordersStore.cancelProduct(order.id);
                    }}
                  >
                    {isActionLoading ? 'Отменяем...' : 'Отменить заказ'}
                  </button>
                ) : null}

                <Link to="/shop" className={styles.primaryLink}>
                  Продолжить покупки
                </Link>
              </div>
            </section>

            <aside className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>Состав заказа</h2>

              <div className={styles.summaryList}>
                {order.items.map((item, index) => (
                  <div
                    key={`${item.productId}-${item.variantId ?? 'default'}-${index}`}
                    className={styles.summaryItem}
                  >
                    <div className={styles.summaryItemMeta}>
                      <span className={styles.summaryItemTitle}>
                        {item.title}
                      </span>
                      <span className={styles.summaryItemQty}>
                        {item.quantity} шт.
                        {item.variantLabel ? ` • ${item.variantLabel}` : ''}
                      </span>
                    </div>

                    <span className={styles.summaryItemPrice}>
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className={styles.totalRow}>
                <span>Итого</span>
                <strong>{formatPrice(order.price)}</strong>
              </div>

              {order.lifecycle && order.lifecycle.length > 0 ? (
                <>
                  <h2 className={styles.summaryTitle}>История статусов</h2>
                  <div className={styles.summaryList}>
                    {order.lifecycle.map((event, index) => (
                      <div
                        key={`${event.status}-${event.changedAt}-${index}`}
                        className={styles.summaryItem}
                      >
                        <div className={styles.summaryItemMeta}>
                          <span className={styles.summaryItemTitle}>
                            {getStatusLabel(event.status)}
                          </span>
                          <span className={styles.summaryItemQty}>
                            {formatDateTime(event.changedAt)}
                          </span>
                        </div>

                        <span className={styles.summaryItemPrice}>
                          {event.comment ?? ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </aside>
          </div>
        ) : null}
      </div>
    </div>
  );
});

function formatPrice(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function getStatusBadgeLabel(value: string): string {
  switch (value) {
    case 'created':
      return 'Заказ создан';
    case 'paid':
      return 'Заказ оплачен';
    case 'shipped':
      return 'Заказ отправлен';
    case 'delivered':
      return 'Заказ доставлен';
    case 'canceled':
      return 'Заказ отменён';
    default:
      return value;
  }
}

function getStatusDescription(value: string): string {
  switch (value) {
    case 'created':
      return 'Заказ создан и ожидает обработки.';
    case 'paid':
      return 'Оплата получена. Заказ готовится к отправке.';
    case 'shipped':
      return 'Заказ уже в пути.';
    case 'delivered':
      return 'Заказ завершён и доставлен.';
    case 'canceled':
      return 'Заказ был отменён.';
    default:
      return 'Вы можете отслеживать статус заказа ниже.';
  }
}

function getStatusLabel(value: string): string {
  switch (value) {
    case 'paid':
      return 'Оплачен';
    case 'created':
      return 'Создан';
    case 'shipped':
      return 'Отправлен';
    case 'delivered':
      return 'Доставлен';
    case 'canceled':
      return 'Отменён';
    default:
      return value;
  }
}

function getDeliveryLabel(value?: string): string {
  if (value === 'pickup') {
    return 'Самовывоз';
  }

  if (value === 'courier') {
    return 'Курьер';
  }

  return 'Уточняется';
}

function getPaymentLabel(value?: string): string {
  switch (value) {
    case 'card':
      return 'Карта';
    case 'cash_on_delivery':
      return 'Наличными при получении';
    default:
      return 'Уточняется';
  }
}

function getPaymentStatusLabel(value?: string): string {
  switch (value) {
    case 'pending':
      return 'Ожидает оплаты';
    case 'paid':
      return 'Оплачено';
    case 'refunded':
      return 'Возврат';
    default:
      return 'Уточняется';
  }
}

function getAddressLabel(
  order: {
    delivery?: {
      method: 'courier' | 'pickup';
      address?: {
        city: string;
        street: string;
        house: string;
        apartment?: string;
      };
      pickupPointLabel?: string;
    };
  },
): string {
  if (order.delivery?.method === 'pickup') {
    return order.delivery.pickupPointLabel ?? 'Пункт выдачи уточняется';
  }

  if (order.delivery?.address) {
    const { city, street, house, apartment } = order.delivery.address;

    return [city, street, house, apartment ? `кв. ${apartment}` : '']
      .filter(Boolean)
      .join(', ');
  }

  return 'Адрес уточняется';
}