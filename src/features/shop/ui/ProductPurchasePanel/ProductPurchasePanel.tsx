//src/features/shop/ui/ProductPurchasePanel/ProductPurchasePanel.tsx

import { observer } from 'mobx-react-lite';

import { useAuth } from '@/features/auth/model/useAuth';
import { shouldShowShopConsumerControls } from '@/shared/lib/auth/roleAccess';

import { shopCartStore } from '../../model/shopCartStore';
import { shopFavoritesStore } from '../../model/shopFavoritesStore';

import type { Product } from '../../model/types';

import styles from './ProductPurchasePanel.module.css';

type Props = {
  product: Product;
  onReviewsClick?: () => void;
};

export const ProductPurchasePanel = observer(
  ({ product, onReviewsClick }: Props) => {
    const { user } = useAuth();
    const showConsumerControls = shouldShowShopConsumerControls(user);

    const isFavorite = shopFavoritesStore.has(product.id);
    const quantity = shopCartStore.getQuantity(product.id);

    const handleToggleFavorite = (): void => {
      shopFavoritesStore.toggle(product.id);
    };

    const handleAddToCart = (): void => {
      if (!product.isAvailable) {
        return;
      }

      shopCartStore.add(product.id, 1);
    };

    const handleIncrement = (): void => {
      if (!product.isAvailable || quantity >= product.stockQuantity) {
        return;
      }

      shopCartStore.increment(product.id);
    };

    const handleDecrement = (): void => {
      shopCartStore.decrement(product.id);
    };

    const handleReviewsClick = (): void => {
      onReviewsClick?.();
    };

    return (
      <section className={styles.panel}>
        <header className={styles.header}>
          <div>
            <div className={styles.category}>{product.categoryTitle}</div>

            <button
              className={styles.ratingButton}
              type="button"
              onClick={handleReviewsClick}
              disabled={product.reviewsCount === 0}
              aria-label={`Перейти к отзывам о товаре. Всего отзывов: ${product.reviewsCount}`}
            >
              ★ {product.rating.toFixed(1)} · {product.reviewsCount} отзывов
            </button>
          </div>
        </header>

        <h1 className={styles.title}>{product.title}</h1>

        <p className={styles.shortDescription}>{product.shortDescription}</p>

        <div className={styles.priceBlock}>
          <div className={styles.prices}>
            <span className={styles.price}>{formatPrice(product.price)}</span>

            {product.oldPrice !== null ? (
              <span className={styles.oldPrice}>
                {formatPrice(product.oldPrice)}
              </span>
            ) : null}
          </div>

          {product.oldPrice !== null && product.oldPrice > product.price ? (
            <div className={styles.discount}>
              Скидка {formatPrice(product.oldPrice - product.price)}
            </div>
          ) : null}
        </div>

        <div className={styles.statusRow}>
          {product.isAvailable ? (
            <span className={styles.available}>
              В наличии: {product.stockQuantity} шт.
            </span>
          ) : (
            <span className={styles.unavailable}>Нет в наличии</span>
          )}
        </div>

        {showConsumerControls ? (
          <div className={styles.actions}>
            <button
              className={[
                styles.favoriteButton,
                isFavorite ? styles.favoriteButtonActive : '',
              ]
                .filter(Boolean)
                .join(' ')}
              type="button"
              onClick={handleToggleFavorite}
            >
              {isFavorite ? 'В избранном' : 'В избранное'}
            </button>

            {quantity > 0 ? (
              <div className={styles.quantityControl}>
                <button
                  className={styles.quantityButton}
                  type="button"
                  onClick={handleDecrement}
                  aria-label="Уменьшить количество"
                >
                  −
                </button>

                <div className={styles.quantityValue}>{quantity}</div>

                <button
                  className={styles.quantityButton}
                  type="button"
                  onClick={handleIncrement}
                  disabled={quantity >= product.stockQuantity}
                  aria-label="Увеличить количество"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                className={styles.cartButton}
                type="button"
                onClick={handleAddToCart}
                disabled={!product.isAvailable}
              >
                В корзину
              </button>
            )}

            {quantity > 0 ? (
              <div className={styles.cartHint}>
                Товар уже добавлен в корзину. Количество можно изменить здесь.
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    );
  },
);

function formatPrice(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
}