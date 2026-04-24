// src/features/shop/ui/ProductBackButton/ProductBackButton.tsx
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import styles from './ProductBackButton.module.css';

type BackTarget = {
  pathname: string;
  search: string;
  hash: string;
  scrollY: number;
  productId: string;
};

type Props = {
  from?: BackTarget;
  fallbackPath?: string;
};

export const ProductBackButton = ({ from, fallbackPath = '/shop' }: Props) => {
  const navigate = useAppNavigate();

  const handleBack = (): void => {
    if (from) {
      navigate(`${from.pathname}${from.search}${from.hash}`, {
        state: {
          restoreScrollY: from.scrollY,
          restoreProductId: from.productId,
        },
      });

      return;
    }

    navigate(fallbackPath);
  };

  return (
    <button className={styles.button} type="button" onClick={handleBack}>
      <span className={styles.arrow}>←</span>
      Назад к товарам
    </button>
  );
};