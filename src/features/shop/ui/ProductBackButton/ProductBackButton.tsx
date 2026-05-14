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
  /** When set, called instead of navigating via `from` / `fallbackPath`. */
  onBack?: () => void;
};

export const ProductBackButton = ({
  from,
  fallbackPath = '/shop',
  onBack,
}: Props) => {
  const navigate = useAppNavigate();

  const handleBack = (): void => {
    if (onBack) {
      onBack();
      return;
    }

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
      Назад
    </button>
  );
};