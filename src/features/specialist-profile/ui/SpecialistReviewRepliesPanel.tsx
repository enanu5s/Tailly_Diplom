// src/features/specialist-profile/ui/SpecialistReviewRepliesPanel.tsx

import type { ReactElement } from 'react';

import type { SpecialistReview } from '../model/types';

import styles from './SpecialistReviewRepliesPanel.module.css';

type Props = {
    reviews: SpecialistReview[];
    canManageReplies: boolean;
    draftByReviewId: Record<string, string>;
    errorsByReviewId: Record<string, string>;
    savingByReviewId: Record<string, boolean>;
    onChangeDraft: (reviewId: string, value: string) => void;
    onSaveReply: (review: SpecialistReview) => Promise<void>;
};

function formatDate(value?: string | null): string {
    if (!value) {
        return '—';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '—';
    }

    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
}

export function SpecialistReviewRepliesPanel({
    reviews,
    canManageReplies,
    draftByReviewId,
    errorsByReviewId,
    savingByReviewId,
    onChangeDraft,
    onSaveReply,
}: Props): ReactElement | null {
    if (!canManageReplies) {
        return null;
    }

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <h2 className={styles.title}>Ответы на отзывы</h2>
                <p className={styles.subtitle}>
                    Здесь владелец профиля может отвечать на отзывы клиентов.
                </p>
            </div>

            {reviews.length === 0 ? (
                <div className={styles.emptyState}>
                    Пока нет отзывов, на которые можно ответить.
                </div>
            ) : (
                <div className={styles.list}>
                    {reviews.map((review) => {
                        const draft = draftByReviewId[review.id] ?? '';
                        const error = errorsByReviewId[review.id] ?? '';
                        const isSaving = Boolean(savingByReviewId[review.id]);
                        const existingReplyRaw = (review as { specialistReply?: unknown }).specialistReply;
                        const existingReply =
                            typeof existingReplyRaw === 'string'
                                ? existingReplyRaw.trim()
                                : '';



                        return (
                            <article
                                key={review.id}
                                className={styles.card}
                            >
                                <div className={styles.reviewHeader}>
                                    <div className={styles.reviewMeta}>
                                        <div className={styles.authorRow}>
                                            <span className={styles.author}>
                                                {review.authorName}
                                            </span>

                                            <span className={styles.rating}>
                                                {review.rating}/5
                                            </span>
                                        </div>

                                        <div className={styles.date}>
                                            {formatDate(review.createdAt)}
                                        </div>
                                    </div>
                                </div>

                                <p className={styles.reviewText}>
                                    {review.text}
                                </p>

                                {existingReply ? (
                                    <div className={styles.replyPreview}>
                                        <div className={styles.replyPreviewLabel}>
                                            Текущий ответ
                                        </div>

                                        <p className={styles.replyPreviewText}>
                                            {existingReply}
                                        </p>
                                    </div>
                                ) : null}


                                <div className={styles.formBlock}>
                                    <label
                                        className={styles.field}
                                        htmlFor={`reply-${review.id}`}
                                    >
                                        <span className={styles.fieldLabel}>
                                            {existingReply
                                                ? 'Редактировать ответ'
                                                : 'Ответ специалиста'}
                                        </span>

                                        <textarea
                                            id={`reply-${review.id}`}
                                            className={styles.textarea}
                                            rows={4}
                                            value={draft}
                                            onChange={(event) =>
                                                onChangeDraft(
                                                    review.id,
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Введите ответ на отзыв клиента"
                                        />
                                    </label>

                                    {error ? (
                                        <div className={styles.error}>
                                            {error}
                                        </div>
                                    ) : null}

                                    <div className={styles.actions}>
                                        <button
                                            className={styles.saveButton}
                                            type="button"
                                            disabled={isSaving}
                                            onClick={() => {
                                                void onSaveReply(review);
                                            }}
                                        >
                                            {isSaving
                                                ? 'Сохраняем...'
                                                : existingReply
                                                    ? 'Сохранить изменения'
                                                    : 'Опубликовать ответ'}
                                        </button>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}