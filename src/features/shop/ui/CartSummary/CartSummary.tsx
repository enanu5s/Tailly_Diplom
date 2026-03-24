// src/features/shop/ui/CartSummary/CartSummary.tsx
import { Link } from 'react-router-dom';

import { useAuth } from '@/features/auth/model/useAuth';
import { canOrderShopProducts } from '@/shared/lib/auth/roleAccess';

import styles from './CartSummary.module.css';

type Props = {
  itemsCount: number;
  totalPrice: number;
  checkoutLinkState?: {
    from?: {
      pathname: string;
      search: string;
      hash: string;
      scrollY: number;
      productId: string;
    };
  };
};

export const CartSummary = ({ itemsCount, totalPrice, checkoutLinkState }: Props) => {
  const { user } = useAuth();
  const canCheckout = canOrderShopProducts(user);

  return (
    <aside className={styles.card}>
      <h2 className={styles.title}>Ваш заказ</h2>

      <div className={styles.rows}>
        <div className={styles.row}>
          <span className={styles.label}>Товаров</span>
          <span className={styles.value}>{itemsCount}</span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Итоговая сумма</span>
          <span className={styles.total}>{formatPrice(totalPrice)}</span>
        </div>
      </div>

      {canCheckout ? (
        <Link
          to="/shop/checkout"
          state={checkoutLinkState}
          className={styles.checkoutButton}
        >
          Перейти к оформлению
        </Link>
      ) : null}

      {!user ? (
        <>
          <Link
            to={`/login?from=${encodeURIComponent('/shop/cart')}`}
            className={styles.checkoutButton}
          >
            Войти для оформления заказа
          </Link>
          <p className={styles.hint}>
            После входа вы вернётесь в корзину; оттуда можно перейти к оформлению (нужен аккаунт
            клиента или специалиста).
          </p>
        </>
      ) : null}

      {user && !canCheckout ? (
        <p className={styles.hint}>
          Оформление заказов в магазине доступно с аккаунта клиента или специалиста.
        </p>
      ) : null}
    </aside>
  );
};

function formatPrice(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
}
