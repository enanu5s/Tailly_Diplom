// src/pages/shop/ui/ShopOrderResultPage.tsx

import { observer } from 'mobx-react-lite';
import { useEffect, useState, type JSX } from 'react';
import { Link, useParams } from 'react-router-dom';

import { ordersStore } from '@/features/orders/model/ordersStore';
import { canCancelProductOrder } from '@/features/orders/model/types';

import styles from './ShopOrderResultPage.module.css';

type ProductOrderStatus = 'created' | 'paid' | 'shipped' | 'delivered' | 'canceled';
const ORDER_STATUS_AUTO_REFRESH_MS = 90_000;

type DeliveryMethod = 'courier' | 'pickup';

type ProductOrderView = {
  id: string;
  number: string;
  status: ProductOrderStatus;
  createdAt: string;
  price: number;
  cancelReason?: string;
  canceledAt?: string;
  canBeCancelled?: boolean;
  recipient?: {
    fullName: string;
    phone: string;
  };
  delivery?: {
    method: DeliveryMethod;
    address?: {
      city: string;
      street: string;
      house: string;
      apartment?: string;
    };
    pickupPointLabel?: string;
    trackingNumber?: string;
  };
  payment?: {
    method?: string;
    status?: string;
  };
  items: Array<{
    productId: string;
    variantId?: string;
    title: string;
    quantity: number;
    price: number;
    variantLabel?: string;
  }>;
  lifecycle?: Array<{
    status: string;
    changedAt: string;
    comment?: string;
  }>;
};

type StatusStep = {
  key: ProductOrderStatus;
  label: string;
  date?: string;
};

export const ShopOrderResultPage = observer(() => {
  const { orderId } = useParams<{ orderId: string }>();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

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

  const order = ordersStore.selectedProductOrder as ProductOrderView | null;
  const isLoading = ordersStore.selectedProductLoading;
  const error = ordersStore.selectedProductError;
  const isActionLoading = order ? ordersStore.actionLoadingId === order.id : false;

  useEffect(() => {
    if (!orderId || isLoading || error || !order) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void ordersStore.syncSelectedProductOrderStatus();
    }, ORDER_STATUS_AUTO_REFRESH_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [orderId, isLoading, error, order]);

  useEffect(() => {
    if (!isCancelModalOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsCancelModalOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isCancelModalOpen]);

  const handleRequestCancel = (): void => {
    setIsCancelModalOpen(true);
  };

  const handleCloseCancelModal = (): void => {
    if (isActionLoading) {
      return;
    }

    setIsCancelModalOpen(false);
  };

  const handleConfirmCancel = async (): Promise<void> => {
    if (!order) {
      return;
    }

    await ordersStore.cancelProduct(order.id);

    if (ordersStore.selectedProductOrder?.status === 'canceled') {
      setIsCancelModalOpen(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.blur} />

      <div className={styles.container}>
        {isLoading ? (
          <section className={styles.stateCard}>
            <h1 className={styles.pageTitle}>Загружаем заказ</h1>
            <p className={styles.stateText}>Подготавливаем информацию о заказе.</p>
          </section>
        ) : null}

        {!isLoading && error ? (
          <section className={styles.stateCard}>
            <h1 className={styles.pageTitle}>Не удалось открыть заказ</h1>
            <p className={styles.stateText}>{error}</p>

            <Link to="/shop" className={styles.primaryLink}>
              Вернуться в магазин
            </Link>
          </section>
        ) : null}

        {!isLoading && !error && order ? (
          <>
            <h1 className={styles.pageTitle}>Детали заказа</h1>

            <div className={styles.layout}>
              <div className={styles.leftColumn}>
                <section className={styles.detailsCard}>
                  <div className={styles.detailsHeader}>
                    <h2 className={styles.cardTitle}>Заказ №{order.number}</h2>
                    <span className={styles.dateBadge}>
                      {formatCompactDateTime(order.createdAt)}
                    </span>
                  </div>

                  <div className={styles.detailsGrid}>
                    <InfoBlock label="Получатель" value={getRecipientLabel(order)} />
                    <InfoBlock
                      label="Доставка"
                      value={getDeliveryPeriodLabel(order)}
                    />
                    <InfoBlock label="Адрес" value={getAddressLabel(order)} />
                    <InfoBlock
                      label="Оплата"
                      value={getPaymentLabel(order.payment?.method)}
                    />
                  </div>

                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.cancelButton}
                      disabled={
                        order.status === 'canceled' ||
                        isActionLoading ||
                        !canCancelProductOrder(order)
                      }
                      onClick={handleRequestCancel}
                    >
                      {order.status === 'canceled'
                        ? 'Заказ отменен'
                        : isActionLoading
                          ? 'Отменяем...'
                          : 'Отменить заказ'}
                    </button>

                    <Link to="/shop" className={styles.primaryLink}>
                      Продолжить покупки
                    </Link>
                  </div>
                </section>

                <section className={styles.statusCard}>
                  <h2 className={styles.cardTitle}>Статус заказа</h2>

                  <OrderStatusTimeline order={order} />
                </section>
              </div>

              <aside className={styles.summaryCard}>
                <h2 className={styles.cardTitle}>Ваш заказ</h2>

                <div className={styles.summaryList}>
                  {order.items.map((item, index) => (
                    <div
                      key={`${item.productId}-${item.variantId ?? 'default'}-${index}`}
                      className={styles.summaryItem}
                    >
                      <div className={styles.summaryMeta}>
                        <span className={styles.summaryName}>{item.title}</span>
                        <span className={styles.summaryQuantity}>
                          {item.quantity} шт.
                        </span>
                      </div>

                      <span className={styles.summaryPrice}>
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className={styles.summaryDivider} />

                <div className={styles.summaryRow}>
                  <span>Количество товаров</span>
                  <strong>{getTotalItems(order)} шт.</strong>
                </div>

                <div className={styles.summaryRow}>
                  <span>Итоговая сумма</span>
                  <strong className={styles.totalPrice}>{formatPrice(order.price)}</strong>
                </div>
              </aside>
            </div>

            {isCancelModalOpen ? (
              <div
                className={styles.cancelModalOverlay}
                onClick={handleCloseCancelModal}
                role="presentation"
              >
                <section
                  className={styles.cancelModal}
                  onClick={(event) => event.stopPropagation()}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="cancel-order-title"
                >
                  <button
                    type="button"
                    className={styles.cancelModalClose}
                    onClick={handleCloseCancelModal}
                    aria-label="Закрыть окно"
                  >
                    <span className={styles.cancelModalCloseIcon} />
                  </button>

                  <h2 id="cancel-order-title" className={styles.cancelModalTitle}>
                    Отмена заказа
                  </h2>
                  <p className={styles.cancelModalText}>
                    Вы уверены, что хотите отменить заказ?
                  </p>

                  {ordersStore.actionError ? (
                    <p className={styles.cancelModalError}>{ordersStore.actionError}</p>
                  ) : null}

                  <button
                    type="button"
                    className={styles.cancelModalConfirm}
                    disabled={isActionLoading}
                    onClick={() => {
                      void handleConfirmCancel();
                    }}
                  >
                    {isActionLoading ? 'Отменяем...' : 'Отменить заказ'}
                  </button>
                </section>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </main>
  );
});

function InfoBlock(props: { label: string; value: string }): JSX.Element {
  return (
    <div className={styles.infoBlock}>
      <span className={styles.infoLabel}>{props.label}</span>
      <span className={styles.infoValue}>{props.value}</span>
    </div>
  );
}

function OrderStatusTimeline(props: { order: ProductOrderView }): JSX.Element {
  const steps = getStatusSteps(props.order);
  const currentIndex = getCurrentStepIndex(props.order, steps);
  const progressWidth = steps.length > 1 ? `${(currentIndex / (steps.length - 1)) * 100}%` : '0%';

  return (
    <div className={styles.timeline}>
      <div className={styles.timelineLine}>
        <div className={styles.timelineProgress} style={{ width: progressWidth }} />
      </div>

      <div className={styles.timelineSteps}>
        {steps.map((step, index) => {
          const isActive = index <= currentIndex;

          return (
            <div key={step.key} className={styles.timelineStep}>
              <span
                className={
                  isActive ? styles.timelineDotActive : styles.timelineDotInactive
                }
              />

              <span
                className={
                  isActive ? styles.timelineLabelActive : styles.timelineLabelInactive
                }
              >
                {step.label}
              </span>

              {step.date ? (
                <span className={styles.timelineDate}>
                  {formatDateTime(step.date)}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getStatusSteps(order: ProductOrderView): StatusStep[] {
  const isPickup = order.delivery?.method === 'pickup';
  const baseStatuses: ProductOrderStatus[] = ['created', 'paid', 'shipped', 'delivered'];

  const steps: StatusStep[] = baseStatuses.map((status) => ({
    key: status,
    label: getStatusLabel(status, isPickup),
    date: status === 'created' ? getLifecycleDate(order, status) ?? order.createdAt : getLifecycleDate(order, status),
  }));

  if (order.status === 'canceled') {
    const reachedCount = getReachedBaseStatusesCount(order, baseStatuses);
    const truncated = steps.slice(0, reachedCount);

    truncated.push({
      key: 'canceled',
      label: 'Отменён',
      date: getLifecycleDate(order, 'canceled') ?? order.canceledAt,
    });

    return truncated;
  }

  return steps;
}

function getLifecycleDate(order: ProductOrderView, status: string): string | undefined {
  return order.lifecycle?.find((event) => event.status === status)?.changedAt;
}

function getStatusLabel(status: ProductOrderStatus, isPickup: boolean): string {
  if (status === 'created') {
    return 'Создан';
  }
  if (status === 'paid') {
    return 'Собран и проверен';
  }
  if (status === 'shipped') {
    return isPickup ? 'Передан в СДЭК' : 'Передан курьеру';
  }
  if (status === 'delivered') {
    return 'Получен';
  }
  return 'Отменён';
}

function getReachedBaseStatusesCount(
  order: ProductOrderView,
  baseStatuses: ProductOrderStatus[],
): number {
  const reached = baseStatuses.filter((status) => {
    if (status === 'created') {
      return true;
    }
    return Boolean(getLifecycleDate(order, status));
  });

  return Math.max(1, reached.length);
}

function getCurrentStepIndex(order: ProductOrderView, steps: StatusStep[]): number {
  if (steps.length <= 1) {
    return 0;
  }

  if (order.status === 'canceled') {
    return steps.length - 1;
  }

  const statusToStep: Record<ProductOrderStatus, number> = {
    created: 0,
    paid: 1,
    shipped: 2,
    delivered: 3,
    canceled: 0,
  };

  return Math.min(statusToStep[order.status], steps.length - 1);
}

function getRecipientLabel(order: ProductOrderView): string {
  return order.recipient?.fullName ?? 'Не указан';
}

function getTotalItems(order: ProductOrderView): number {
  return order.items.reduce((sum, item) => sum + item.quantity, 0);
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatCompactDateTime(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
    .format(new Date(value))
    .replace(',', '');
}

function getDeliveryPeriodLabel(order: ProductOrderView): string {
  if (order.status === 'delivered') {
    return 'Доставлен';
  }

  return 'с 21 апреля - по 24 апреля';
}

function getPaymentLabel(value?: string): string {
  switch (value) {
    case 'card':
      return 'Банковская карта';
    case 'sbp':
      return 'СБП';
    case 'cash_on_delivery':
      return 'Наличными при получении';
    case 'card_on_delivery':
      return 'Картой курьеру';
    default:
      return 'Уточняется';
  }
}

function getAddressLabel(order: ProductOrderView): string {
  if (order.delivery?.method === 'pickup') {
    return order.delivery.pickupPointLabel ?? 'СДЕК - ПВЗ уточняется';
  }

  if (order.delivery?.address) {
    const { city, street, house, apartment } = order.delivery.address;

    return [city, street, house, apartment ? `кв. ${apartment}` : '']
      .filter(Boolean)
      .join(', ');
  }

  return 'Адрес уточняется';
}