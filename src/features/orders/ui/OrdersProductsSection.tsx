//src/features/orders/ui/OrdersProductsSection.tsx

import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import styles from './OrdersProductsSection.module.css';
import { ordersStore } from '../model/ordersStore';

import type { KeyboardEvent, MouseEvent } from 'react';
import type { ProductOrder } from '../model/types';

type CheckoutLocationState = {
  source: 'repeat_product_order';
  orderId: string;
  repeatOrder: Awaited<ReturnType<typeof ordersStore.repeatProduct>> extends infer T
    ? Exclude<T, null>
    : never;
};

export const OrdersProductsSection = observer(() => {
  const navigate = useAppNavigate();

  useEffect(() => {
    void ordersStore.loadProducts();
  }, []);

  return (
    <section className={styles.card}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>Мои заказы (товары)</h2>
      </div>

      {ordersStore.productsError ? (
        <div className={styles.error}>{ordersStore.productsError}</div>
      ) : null}

      {ordersStore.actionError ? (
        <div className={styles.error}>{ordersStore.actionError}</div>
      ) : null}

      {ordersStore.productsLoading && ordersStore.productOrders.length === 0 ? (
        <div className={styles.state}>Загружаем заказы...</div>
      ) : ordersStore.productOrders.length === 0 ? (
        <div className={styles.state}>Пока нет заказов товаров.</div>
      ) : (
        <div className={styles.list}>
          {ordersStore.productOrders.map((order) => (
            <ProductOrderCard
              key={order.id}
              order={order}
              onOpen={() => {
                navigate(`/orders/${order.id}`);
              }}
              onRepeat={async () => {
                const draft = await ordersStore.repeatProduct(order.id);

                if (!draft || ordersStore.actionError) {
                  return;
                }

                const checkoutState: CheckoutLocationState = {
                  source: 'repeat_product_order',
                  orderId: order.id,
                  repeatOrder: draft,
                };

                navigate('/shop/checkout', {
                  state: checkoutState,
                });
              }}
              isRepeatLoading={ordersStore.actionLoadingId === order.id}
            />
          ))}
        </div>
      )}
    </section>
  );
});

type ProductOrderCardProps = {
  order: ProductOrder;
  onOpen: () => void;
  onRepeat: () => Promise<void>;
  isRepeatLoading: boolean;
};

const ProductOrderCard = observer(
  ({
    order,
    onOpen,
    onRepeat,
    isRepeatLoading,
  }: ProductOrderCardProps) => {
    const navigate = useAppNavigate();

    const visibleItems = order.items.slice(0, 3);
    const rest = Math.max(0, order.items.length - 3);

    const handleCardKeyDown = (
      event: KeyboardEvent<HTMLDivElement>,
    ): void => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onOpen();
      }
    };

    const handleOpenProduct = (
      event: MouseEvent<HTMLButtonElement>,
      productId: string,
    ): void => {
      event.stopPropagation();
      navigate(`/shop/${productId}`);
    };

    return (
      <div
        className={styles.order}
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={handleCardKeyDown}
      >
        <div className={styles.left}>
          <div className={styles.number}>{order.number}</div>

          <div className={styles.metaRow}>
            <span className={styles.meta}>{mapProductStatus(order.status)}</span>
            <span className={styles.dot}>•</span>
            <span className={styles.meta}>
              {new Date(order.createdAt).toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: '2-digit',
              })}
            </span>
          </div>

          <div className={styles.metaRow}>
            <span className={styles.meta}>Товаров: {order.itemsCount}</span>
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.price}>
            {formatPrice(order.price, order.currency)}
          </div>

          <div className={styles.thumbs}>
            {visibleItems.map((item, idx) => {
              const isLastVisible = idx === 2;

              if (isLastVisible && rest > 0) {
                return (
                  <button
                    key={`${item.productId}-${idx}`}
                    type="button"
                    className={styles.thumbWrap}
                    onClick={(event) => {
                      handleOpenProduct(event, item.productId);
                    }}
                    aria-label={`Открыть товар ${item.title}`}
                  >
                    <img
                      className={styles.thumb}
                      src={item.imageUrl}
                      alt={item.title}
                    />
                    <div className={styles.moreOverlay}>{rest}+</div>
                  </button>
                );
              }

              return (
                <button
                  key={`${item.productId}-${idx}`}
                  type="button"
                  className={styles.thumbWrap}
                  onClick={(event) => {
                    handleOpenProduct(event, item.productId);
                  }}
                  aria-label={`Открыть товар ${item.title}`}
                >
                  <img
                    className={styles.thumb}
                    src={item.imageUrl}
                    alt={item.title}
                  />
                </button>
              );
            })}
          </div>

          <button
            className={styles.secondaryBtn}
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              void onRepeat();
            }}
            disabled={isRepeatLoading}
          >
            {isRepeatLoading ? '...' : 'Повторить заказ'}
          </button>
        </div>
      </div>
    );
  },
);

function mapProductStatus(status: string): string {
  if (status === 'created') return 'Создан';
  if (status === 'paid') return 'Оплачен';
  if (status === 'shipped') return 'Отправлен';
  if (status === 'delivered') return 'Доставлен';
  if (status === 'canceled') return 'Отменён';

  return status;
}

function formatPrice(value: number, currency: 'RUB'): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
  }).format(value);
}