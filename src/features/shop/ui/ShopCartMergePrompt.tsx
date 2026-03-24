//src/features/shop/ui/ShopCartMergePrompt.tsx
import { observer } from 'mobx-react-lite';

import { useAuth } from '@/features/auth/model/useAuth';
import { shouldShowShopConsumerControls } from '@/shared/lib/auth/roleAccess';

import styles from './ShopCartMergePrompt.module.css';
import { shopCartStore } from '../model/shopCartStore';

import type { ReactElement } from 'react';

export const ShopCartMergePrompt = observer((): ReactElement | null => {
  const { user } = useAuth();
  const prompt = shopCartStore.pendingCartMergePrompt;

  if (!shouldShowShopConsumerControls(user) || !prompt) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.badge}>Корзина</div>

        <h2 className={styles.title}>Объединить корзины?</h2>

        <p className={styles.text}>
          После входа мы нашли товары в гостевой корзине и в корзине вашего аккаунта.
        </p>

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Гостевая корзина</span>
            <span className={styles.statValue}>{prompt.guestItemsCount} шт.</span>
            <span className={styles.statMeta}>{prompt.guestLinesCount} поз.</span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>Корзина аккаунта</span>
            <span className={styles.statValue}>{prompt.userItemsCount} шт.</span>
            <span className={styles.statMeta}>{prompt.userLinesCount} поз.</span>
          </div>
        </div>

        <p className={styles.note}>
          Если нажать “Объединить корзины”, товары будут объединены. Если нажать “Отмена”,
          останется только корзина аккаунта, а гостевая корзина будет удалена.
        </p>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => {
              shopCartStore.discardGuestCartAfterLogin();
            }}
          >
            Отмена
          </button>

          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => {
              shopCartStore.confirmPendingCartMerge();
            }}
          >
            Объединить корзины
          </button>
        </div>
      </div>
    </div>
  );
});
