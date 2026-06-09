// src/features/shop/ui/ProductReviews/ProductReviews.tsx
import styles from './ProductReviews.module.css';

import type { ProductReview } from '../../model/types';

type Props = {
  reviews: ProductReview[];
};

export const ProductReviews = ({ reviews }: Props) => {
  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <h2 className={styles.title}>Отзывы о товаре</h2>
        <div className={styles.count}>{reviews.length}</div>
      </header>

      {reviews.length === 0 ? (
        <div className={styles.emptyState}>У этого товара пока нет отзывов.</div>
      ) : (
        <div className={styles.list}>
          {reviews.map((review) => (
            <article key={review.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <div className={styles.author}>{review.authorName}</div>
                  <div className={styles.date}>{formatDate(review.createdAt)}</div>
                </div>

                <div
                  className={styles.rating}
                  aria-label={`Оценка ${review.rating} из 5`}
                >
                  {'★'.repeat(review.rating)}
                </div>
              </div>

              <p className={styles.text}>{review.text}</p>

              {review.siteReply ? (
                <div className={styles.reply}>
                  <div className={styles.replyHeader}>
                    <div className={styles.replyAuthor}>
                      {review.siteReply.authorName}
                    </div>
                    <div className={styles.replyDate}>
                      {formatDate(review.siteReply.createdAt)}
                    </div>
                  </div>

                  <p className={styles.replyText}>{review.siteReply.text}</p>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}
