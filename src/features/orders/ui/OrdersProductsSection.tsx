// src/features/orders/ui/OrdersProductsSection.tsx

import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { getProfileOrdersPreview } from '@/features/shop/service/profileOrdersPreview';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import styles from './OrdersProductsSection.module.css';
import { ordersStore } from '../model/ordersStore';
import {
  canRepeatProductOrder,
  getProductOrderStatusLabel,
  getProductOrderStatusTone,
} from '../service/productOrderPresentation';

function formatPrice(value: number): string {
  return new Intl.NumberFormat('ru-RU').format(value);
}

function formatItemsQuantity(quantity: number): string {
  return `${quantity} шт.`;
}

export const OrdersProductsSection = observer(() => {
  const navigate = useAppNavigate();

  useEffect(() => {
    if (ordersStore.productOrders.length === 0 && !ordersStore.productsLoading) {
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
                <span
                  className={styles.status}
                  data-tone={getProductOrderStatusTone(order.status)}
                >
                  {getProductOrderStatusLabel(order.status)}
                </span>

                <div className={styles.price}>{formatPrice(order.price)} ₽</div>

                <div className={styles.number}>Заказ {order.number}</div>

                <div className={styles.meta}>
                  Количество товаров: {formatItemsQuantity(order.itemsCount)}
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
