// src/features/shop/ui/ProductReviews/ProductReviews.tsx
import type { ProductReview } from '../../model/types';

import styles from './ProductReviews.module.css';

type Props = {
    reviews: ProductReview[];
};

export const ProductReviews = ({ reviews }: Props) => {
    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <h2 className={styles.title}>Отзывы</h2>
                <span className={styles.count}>{reviews.length}</span>
            </div>

            {reviews.length === 0 ? (
                <div className={styles.emptyState}>
                    У этого товара пока нет отзывов.
                </div>
            ) : (
                <div className={styles.list}>
                    {reviews.map((review) => (
                        <article key={review.id} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div>
                                    <div className={styles.author}>{review.authorName}</div>
                                    <div className={styles.date}>{formatDate(review.createdAt)}</div>
                                </div>

                                <div className={styles.rating}>
                                    {'★'.repeat(review.rating)}
                                </div>
                            </div>

                            <p className={styles.text}>{review.text}</p>
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