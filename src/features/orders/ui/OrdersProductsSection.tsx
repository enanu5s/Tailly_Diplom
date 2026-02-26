//src/features/orders/ui/OrdersProductsSection.tsx
import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { ordersStore } from '../model/ordersStore';
import type { ProductOrder } from '../model/types';
import styles from './OrdersProductsSection.module.css';

export const OrdersProductsSection = observer(() => {
  const navigate = useNavigate();

  useEffect(() => {
    void ordersStore.loadProducts();
  }, []);

  return (
    <section className={styles.card}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>Мои заказы (товары)</h2>
      </div>

      {ordersStore.productsError && <div className={styles.error}>{ordersStore.productsError}</div>}
      {ordersStore.actionError && <div className={styles.error}>{ordersStore.actionError}</div>}

      {ordersStore.productsLoading && ordersStore.productOrders.length === 0 ? (
        <div className={styles.state}>Загружаем заказы...</div>
      ) : ordersStore.productOrders.length === 0 ? (
        <div className={styles.state}>Пока нет заказов товаров.</div>
      ) : (
        <div className={styles.list}>
          {ordersStore.productOrders.map((o) => (
            <ProductOrderCard
              key={o.id}
              order={o}
              onOpen={() => {
                // фундамент под страницу заказа, но саму страницу не делаем
                navigate(`/orders/${o.id}`);
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
});

const ProductOrderCard = observer(({ order, onOpen }: { order: ProductOrder; onOpen: () => void }) => {
  const thumbs = order.productThumbs ?? [];
  const show = thumbs.slice(0, 3);
  const rest = Math.max(0, thumbs.length - 3);

  return (
    <button className={styles.order} type="button" onClick={onOpen}>
      <div className={styles.left}>
        <div className={styles.number}>{order.number}</div>
        <div className={styles.metaRow}>
          <span className={styles.meta}>{mapProductStatus(order.status)}</span>
          <span className={styles.dot}>•</span>
          <span className={styles.meta}>
            {new Date(order.createdAt).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: '2-digit' })}
          </span>
        </div>

        <div className={styles.metaRow}>
          <span className={styles.meta}>Товаров: {order.itemsCount}</span>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.price}>{formatPrice(order.price, order.currency)}</div>

        <div className={styles.thumbs}>
          {show.map((src, idx) => {
            const isLastVisible = idx === 2;
            if (isLastVisible && rest > 0) {
              return (
                <div key={`${src}-${idx}`} className={styles.thumbWrap}>
                  <img className={styles.thumb} src={src} alt="Товар" />
                  <div className={styles.moreOverlay}>{rest}+</div>
                </div>
              );
            }
            return (
              <div key={`${src}-${idx}`} className={styles.thumbWrap}>
                <img className={styles.thumb} src={src} alt="Товар" />
              </div>
            );
          })}
        </div>

        <button
          className={styles.secondaryBtn}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            void ordersStore.repeatProduct(order.id);
          }}
          disabled={ordersStore.actionLoadingId === order.id}
        >
          {ordersStore.actionLoadingId === order.id ? '...' : 'Повторить заказ'}
        </button>
      </div>
    </button>
  );
});

function mapProductStatus(s: string) {
  if (s === 'created') return 'Создан';
  if (s === 'paid') return 'Оплачен';
  if (s === 'shipped') return 'Отправлен';
  if (s === 'delivered') return 'Доставлен';
  if (s === 'canceled') return 'Отменён';
  return s;
}

function formatPrice(value: number, currency: 'RUB') {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency }).format(value);
}