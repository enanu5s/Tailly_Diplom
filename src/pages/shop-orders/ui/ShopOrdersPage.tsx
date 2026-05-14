// src/pages/shop-orders/ui/ShopOrdersPage.tsx

import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '@/features/auth/model/useAuth';
import { ordersStore } from '@/features/orders/model/ordersStore';
import { ProductBackButton } from '@/features/shop/ui/ProductBackButton/ProductBackButton';
import {
  getShopOrderStatusTone,
  mapShopOrderStatusCardLabel,
} from '@/features/shop/service/shopOrdersFilters';

import styles from './ShopOrdersPage.module.css';

function formatPrice(value: number): string {
  return new Intl.NumberFormat('ru-RU').format(value);
}

function formatQuantityLine(quantity: number): string {
  return `Количество товаров: ${quantity} шт.`;
}

export const ShopOrdersPage = observer(() => {
  const { isSpecialist, user } = useAuth();

  useEffect(() => {
    if (ordersStore.productOrders.length === 0 && !ordersStore.productsLoading) {
      void ordersStore.loadProducts();
    }
  }, []);

  const orders = ordersStore.productOrders;

  const backFallbackPath =
    isSpecialist && user?.specialistSlug?.trim()
      ? `/specialists/${user.specialistSlug.trim()}`
      : '/shop';

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <ProductBackButton fallbackPath={backFallbackPath} />
          <h1 className={styles.title}>Заказы из магазина</h1>
        </div>

        {ordersStore.productsLoading ? (
          <section className={styles.stateCard}>
            <h2 className={styles.stateTitle}>Загружаем заказы</h2>
            <p className={styles.stateText}>Подготавливаем список заказов магазина.</p>
          </section>
        ) : null}

        {!ordersStore.productsLoading && ordersStore.productOrders.length === 0 ? (
          <section className={styles.stateCard}>
            <h2 className={styles.stateTitle}>Заказов пока нет</h2>
            <p className={styles.stateText}>
              После оформления покупки здесь появится история заказов магазина.
            </p>
            <Link to="/shop" className={styles.stateLink}>
              Перейти в магазин
            </Link>
          </section>
        ) : null}

        {!ordersStore.productsLoading && orders.length > 0 ? (
          <section className={styles.listSection}>
            <div className={styles.ordersGrid}>
              {orders.map((order) => {
                const itemsCount = order.items.reduce((sum, item) => {
                  return sum + item.quantity;
                }, 0);

                return (
                  <article key={order.id} className={styles.orderCard}>
                    <div className={styles.orderCardTop}>
                      <span
                        className={styles.statusBadge}
                        data-tone={getShopOrderStatusTone(order.status)}
                      >
                        {mapShopOrderStatusCardLabel(order.status)}
                      </span>
                      <div className={styles.orderPrice}>
                        {formatPrice(order.price)}&nbsp;₽
                      </div>
                    </div>

                    <div className={styles.orderCardBody}>
                      <div className={styles.orderCardText}>
                        <div className={styles.orderNumber}>
                          Заказ № {order.number}
                        </div>
                        <div className={styles.orderQuantity}>
                          {formatQuantityLine(itemsCount)}
                        </div>
                      </div>
                      <Link
                        to={`/shop/order/${encodeURIComponent(order.id)}`}
                        className={styles.detailsLink}
                      >
                        Открыть заказ
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
});
