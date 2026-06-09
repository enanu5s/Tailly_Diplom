// src/features/shop/ui/ProductPurchasePanel/ProductPurchasePanel.tsx
import { observer } from 'mobx-react-lite';

import { useAuth } from '@/features/auth/model/useAuth';
import { shouldShowShopConsumerControls } from '@/shared/lib/auth/roleAccess';

import styles from './ProductPurchasePanel.module.css';
import { shopCartStore } from '../../model/shopCartStore';
import { shopFavoritesStore } from '../../model/shopFavoritesStore';
import favoriteOutlineIconUrl from '@/shared/ui/icons/favorite-outline.svg';
import favoriteFilledIconUrl from '@/shared/ui/icons/favorite-filled.svg';

import type { Product } from '../../model/types';

type Props = {
  product: Product;
  onReviewsClick?: () => void;
};

export const ProductPurchasePanel = observer(({ product, onReviewsClick }: Props) => {
  const { user } = useAuth();
  const showConsumerControls = shouldShowShopConsumerControls(user);

  const isFavorite = shopFavoritesStore.has(product.id);
  const quantity = shopCartStore.getQuantity(product.id);

  const characteristicRows: Array<[string, string]> = [
    ['Бренды', product.characteristics?.brand ?? ''],
    ['Назначение', product.characteristics?.purpose ?? ''],
    ['Страна-производитель', product.characteristics?.countryOfOrigin ?? ''],
    ['Размер питомца', product.characteristics?.petSize ?? ''],
    ['Для кого', product.characteristics?.forWhom ?? ''],
    ['Материал', product.characteristics?.material ?? ''],
  ];

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

  return (
    <section className={styles.panel}>
      <header className={styles.header}>
        <div className={styles.category}>{product.categoryTitle}</div>

        <button
          className={styles.ratingButton}
          type="button"
          onClick={onReviewsClick}
          disabled={product.reviewsCount === 0}
        >
          <span className={styles.star}>★</span>
          {product.rating.toFixed(1)} · {product.reviewsCount} отзывов
        </button>
      </header>

      <h1 className={styles.title}>{product.title}</h1>

      <p className={styles.shortDescription}>{product.shortDescription}</p>

      <div className={styles.characteristics}>
        <h2 className={styles.characteristicsTitle}>Характеристики</h2>

        <div className={styles.characteristicsGrid}>
          {characteristicRows.map(([label, value]) => (
            <div key={label} className={styles.characteristicItem}>
              <span className={styles.characteristicLabel}>{label}:</span>
              <span className={styles.characteristicValue}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.priceBlock}>
        <div className={styles.prices}>
          <span className={styles.price}>{formatPrice(product.price)}</span>

          {product.oldPrice !== null ? (
            <span className={styles.oldPrice}>{formatPrice(product.oldPrice)}</span>
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
      </div>

      {showConsumerControls ? (
        <div className={styles.actions}>
          <button
            className={`${styles.favoriteButton} ${
              isFavorite ? styles.favoriteButtonActive : ''
            }`}
            type="button"
            onClick={handleToggleFavorite}
          >
            <img
              className={styles.favoriteIcon}
              src={isFavorite ? favoriteFilledIconUrl : favoriteOutlineIconUrl}
              alt=""
              aria-hidden="true"
            />
            В избранное
          </button>

          {quantity > 0 ? (
            <div className={styles.quantityControl}>
              <button
                className={styles.quantityButton}
                type="button"
                onClick={handleDecrement}
              >
                −
              </button>

              <div className={styles.quantityValue}>{quantity}</div>

              <button
                className={styles.quantityButton}
                type="button"
                onClick={handleIncrement}
                disabled={quantity >= product.stockQuantity}
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
        </div>
      ) : null}
    </section>
  );
});

function formatPrice(value: number): string {
  return `${new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 0,
  }).format(value)} ₽`;
}
