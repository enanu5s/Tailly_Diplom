//src/features/shop/ui/ShopCartMergePrompt.tsx
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/features/auth/model/useAuth';
import { shouldShowShopConsumerControls } from '@/shared/lib/auth/roleAccess';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import styles from './ShopCartMergePrompt.module.css';
import { shopCartStore } from '../model/shopCartStore';
import { shopService } from '../service/shopService';

import type { Product } from '../model/types';
import type { ReactElement } from 'react';

function formatPrice(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatQuantityLabel(qty: number): string {
  return `${qty} шт.`;
}

export const ShopCartMergePrompt = observer((): ReactElement | null => {
  const navigate = useAppNavigate();
  const { user } = useAuth();
  const prompt = shopCartStore.pendingCartMergePrompt;
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!prompt) {
      setProducts([]);
      return;
    }

    const ids = [
      ...new Set([
        ...prompt.guestItems.map((i) => i.productId),
        ...prompt.userItems.map((i) => i.productId),
      ]),
    ];

    let cancelled = false;

    void (async () => {
      try {
        const loaded = await shopService.getProductsByIds(ids);
        if (!cancelled) {
          setProducts(loaded);
        }
      } catch {
        if (!cancelled) {
          setProducts([]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [prompt]);

  const guestLines = useMemo(() => {
    if (!prompt) {
      return [];
    }

    return prompt.guestItems.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      const lineTotal = product ? product.price * item.quantity : 0;

      return {
        key: item.productId,
        title: product?.title ?? 'Товар',
        quantity: item.quantity,
        lineTotal,
      };
    });
  }, [prompt, products]);

  const userLines = useMemo(() => {
    if (!prompt) {
      return [];
    }

    return prompt.userItems.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      const lineTotal = product ? product.price * item.quantity : 0;

      return {
        key: item.productId,
        title: product?.title ?? 'Товар',
        quantity: item.quantity,
        lineTotal,
      };
    });
  }, [prompt, products]);

  if (!shouldShowShopConsumerControls(user) || !prompt) {
    return null;
  }

  const accountCartEmpty = prompt.userItems.length === 0;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} role="dialog" aria-modal="true">
        <h2 className={styles.title}>Объединить корзины?</h2>

        <p className={styles.subtitle}>
          После входа мы нашли товары в гостевой корзине и в корзине вашего аккаунта.
        </p>

        <div className={styles.columns}>
          <section className={styles.guestPanel} aria-label="Гостевая корзина">
            <h3 className={styles.panelTitle}>Гостевая корзина</h3>
            <div className={styles.panelList}>
              {guestLines.map((line) => (
                <div key={line.key} className={styles.lineRow}>
                  <div className={styles.lineMain}>
                    <span className={styles.lineTitle}>{line.title}</span>
                    <span className={styles.lineQty}>{formatQuantityLabel(line.quantity)}</span>
                  </div>
                  <span className={styles.linePrice}>{formatPrice(line.lineTotal)}</span>
                </div>
              ))}
            </div>
          </section>

          <section
            className={
              accountCartEmpty
                ? `${styles.accountPanel} ${styles.accountPanelEmpty}`
                : styles.accountPanel
            }
            aria-label="Корзина аккаунта"
          >
            <h3 className={styles.panelTitle}>Корзина аккаунта</h3>
            {accountCartEmpty ? (
              <p className={styles.emptyAccountMessage}>
                Пока здесь пусто. Но мы скучаем по вашим покупкам!
              </p>
            ) : (
              <div className={styles.panelList}>
                {userLines.map((line) => (
                  <div key={line.key} className={styles.lineRow}>
                    <div className={styles.lineMain}>
                      <span className={styles.lineTitle}>{line.title}</span>
                      <span className={styles.lineQty}>{formatQuantityLabel(line.quantity)}</span>
                    </div>
                    <span className={styles.linePrice}>{formatPrice(line.lineTotal)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => {
              shopCartStore.discardGuestCartAfterLogin();
              navigate('/shop/cart', { replace: true, preserveRouteMemory: false });
            }}
          >
            Отмена
          </button>

          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => {
              shopCartStore.confirmPendingCartMerge();
              navigate('/shop/cart', { replace: true, preserveRouteMemory: false });
            }}
          >
            Объединить корзины
          </button>
        </div>
      </div>
    </div>
  );
});
