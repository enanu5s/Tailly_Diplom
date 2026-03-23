// src/features/orders/ui/OrdersProductsSection.tsx

import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { ordersStore } from '../model/ordersStore';
import {
  canRepeatProductOrder,
  getProductOrderStatusLabel,
  getProductOrderStatusTone,
} from '../service/productOrderPresentation';
import { getProfileOrdersPreview } from '@/features/shop/service/profileOrdersPreview';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import styles from './OrdersProductsSection.module.css';

function formatPrice(value: number): string {
  return new Intl.NumberFormat('ru-RU').format(value);
}

function formatItemsLabel(quantity: number): string {
  const mod10 = quantity % 10;
  const mod100 = quantity % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return `${quantity} товар`;
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${quantity} товара`;
  }

  return `${quantity} товаров`;
}

export const OrdersProductsSection = observer(() => {
  const navigate = useAppNavigate();

  useEffect(() => {
    if (
      ordersStore.productOrders.length === 0 &&
      !ordersStore.productsLoading
    ) {
      void ordersStore.loadProducts();
    }
  }, []);

  const previewOrders = getProfileOrdersPreview(ordersStore.productOrders);

  const handleOpenOrder = (orderId: string): void => {
    navigate(`/shop/order/${encodeURIComponent(orderId)}`);
  };

  const handleRepeatOrder = async (
    event: React.MouseEvent<HTMLButtonElement>,
    orderId: string,
  ): Promise<void> => {
    event.stopPropagation();

    const repeatDraft = await ordersStore.repeatProduct(orderId);

    if (!repeatDraft) {
      return;
    }

    navigate('/shop/checkout', {
      state: {
        repeatOrder: repeatDraft,
      },
    });
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Заказы</h2>

        <Link to="/shop/orders" className={styles.allLink}>
          Все заказы
        </Link>
      </div>

      {ordersStore.productsLoading ? (
        <div className={styles.state}>Загрузка заказов...</div>
      ) : null}

      {!ordersStore.productsLoading && previewOrders.length === 0 ? (
        <div className={styles.state}>У вас пока нет заказов</div>
      ) : null}

      {!ordersStore.productsLoading && previewOrders.length > 0 ? (
        <div className={styles.list}>
          {previewOrders.map((order) => {
            const isRepeating = ordersStore.actionLoadingId === order.id;
            const canRepeat = canRepeatProductOrder(order);

            return (
              <article
                key={order.id}
                className={styles.item}
                onClick={() => handleOpenOrder(order.id)}
              >
                <div className={styles.topRow}>
                  <div className={styles.numberBlock}>
                    <div className={styles.number}>{order.number}</div>
                    <div className={styles.meta}>
                      <span>{formatItemsLabel(order.itemsCount)}</span>
                      <span className={styles.metaDivider}>•</span>
                      <span>{formatPrice(order.price)} ₽</span>
                    </div>
                  </div>

                  <span
                    className={styles.status}
                    data-tone={getProductOrderStatusTone(order.status)}
                  >
                    {getProductOrderStatusLabel(order.status)}
                  </span>
                </div>

                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.repeatButton}
                    onClick={(event) => void handleRepeatOrder(event, order.id)}
                    disabled={!canRepeat || isRepeating}
                  >
                    {isRepeating ? 'Повторяем...' : 'Повторить заказ'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}

      {ordersStore.actionError ? (
        <div className={styles.error}>{ordersStore.actionError}</div>
      ) : null}
    </section>
  );
});