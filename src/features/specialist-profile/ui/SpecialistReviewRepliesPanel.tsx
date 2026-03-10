// src/features/specialist-profile/ui/SpecialistReviewRepliesPanel.tsx

import { observer } from 'mobx-react-lite';

import type { SpecialistReviewRepliesStore } from '../model/specialistReviewRepliesStore';
import type { SpecialistProfile, SpecialistReview } from '../model/types';

import styles from './SpecialistReviewRepliesPanel.module.css';

type Props = {
    profile: SpecialistProfile;
    store: SpecialistReviewRepliesStore;
    onSaveReply: (review: SpecialistReview) => Promise<void> | void;
};

function formatDate(date: string): string {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return date;
    }

    return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(parsedDate);
}

export const SpecialistReviewRepliesPanel = observer(
    ({ profile, store, onSaveReply }: Props) => {
        if (!profile.isOwner) {
            return null;
        }

        return (
            <section className={styles.section} aria-label="Управление ответами на отзывы">
                <div className={styles.header}>
                    <div>
                        <h2 className={styles.title}>Ответы на отзывы клиентов</h2>
                        <p className={styles.description}>
                            Здесь можно ответить на отзывы клиентов или отредактировать уже
                            существующий ответ.
                        </p>
                    </div>
                </div>

                <div className={styles.list}>
                    {profile.reviews.map((review) => {
                        const isEditing = store.isEditing(review.id);
                        const isSaving = store.isSaving(review.id);
                        const draft = store.getDraft(review);
                        const error = store.getError(review.id);
                        const isUpdated = store.hasSuccess(review.id);

                        return (
                            <article key={review.id} className={styles.card}>
                                <div className={styles.reviewHeader}>
                                    <div>
                                        <div className={styles.authorRow}>
                                            <span className={styles.author}>{review.authorName}</span>
                                            {review.petName ? (
                                                <span className={styles.petName}>
                                                    Питомец: {review.petName}
                                                </span>
                                            ) : null}
                                        </div>

                                        <div className={styles.meta}>
                                            <span>{formatDate(review.createdAt)}</span>
                                            <span>{'★'.repeat(review.rating)}</span>
                                        </div>
                                    </div>

                                    {!isEditing ? (
                                        <button
                                            type="button"
                                            className={styles.secondaryButton}
                                            onClick={() => store.startEditing(review)}
                                        >
                                            {review.specialistReply ? 'Изменить ответ' : 'Ответить'}
                                        </button>
                                    ) : null}
                                </div>

                                <p className={styles.reviewText}>{review.text}</p>

                                {review.specialistReply && !isEditing ? (
                                    <div className={styles.replyCard}>
                                        <div className={styles.replyTitle}>Текущий ответ специалиста</div>
                                        <div className={styles.replyDate}>
                                            {formatDate(review.specialistReply.createdAt)}
                                        </div>
                                        <p className={styles.replyText}>{review.specialistReply.text}</p>
                                    </div>
                                ) : null}

                                {isEditing ? (
                                    <div className={styles.editorCard}>
                                        <label className={styles.label}>
                                            <span className={styles.labelText}>
                                                Ответ для {review.authorName}
                                            </span>


                                            <textarea
                                                className={styles.textarea}
                                                value={draft}
                                                onChange={(event) =>
                                                    store.setDraft(review.id, event.target.value)
                                                }
                                                placeholder="Напиши вежливый и полезный ответ на отзыв"
                                                rows={5}
                                            />
                                        </label>

                                        {error ? <div className={styles.error}>{error}</div> : null}
                                        {isUpdated ? (
                                            <div className={styles.success}>Ответ сохранён.</div>
                                        ) : null}

                                        <div className={styles.actions}>
                                            <button
                                                type="button"
                                                className={styles.primaryButton}
                                                onClick={() => {
                                                    void onSaveReply(review);
                                                }}
                                                disabled={isSaving}
                                            >
                                                {isSaving ? 'Сохранение...' : 'Сохранить ответ'}
                                            </button>

                                            <button
                                                type="button"
                                                className={styles.secondaryButton}
                                                onClick={() => store.cancelEditing(review.id)}
                                                disabled={isSaving}
                                            >
                                                Отмена
                                            </button>
                                        </div>
                                    </div>
                                ) : null}
                            </article>
                        );
                    })}
                </div>
            </section>
        );
    },
);