// src/features/shop/ui/CartSummary/CartSummary.tsx
import { Link } from 'react-router-dom';

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

      <Link
        to="/shop/checkout"
        state={checkoutLinkState}
        className={styles.checkoutButton}
      >
        Перейти к оформлению
      </Link>
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
