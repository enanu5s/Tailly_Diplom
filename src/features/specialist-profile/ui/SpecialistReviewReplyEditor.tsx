// src/features/specialist-profile/ui/SpecialistReviewReplyEditor.tsx

import styles from './SpecialistReviewReplyEditor.module.css';

import type { SpecialistReview } from '../model/types';
import type { ReactElement } from 'react';

type Props = {
  review: SpecialistReview;
  draft: string;
  error: string;
  isSaving: boolean;
  onChangeDraft: (value: string) => void;
  onSave: () => void;
  onOpenOrder?: () => void;
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

export function SpecialistReviewReplyEditor({
  review,
  draft,
  error,
  isSaving,
  onChangeDraft,
  onSave,
  onOpenOrder,
}: Props): ReactElement {
  const published = review.specialistReply?.text?.trim() ?? '';
  const previewText = draft.trim() || published || 'Текст ответа появится здесь по мере ввода.';

  return (
    <article className={styles.card} id={`specialist-review-${review.id}`}>
      <div className={styles.reviewHeader}>
        <div className={styles.reviewMeta}>
          <div className={styles.authorRow}>
            <span className={styles.author}>{review.authorName}</span>
            <span className={styles.rating}>{review.rating}/5</span>
          </div>
          <div className={styles.date}>{formatDate(review.createdAt)}</div>
          {review.petName ? (
            <div className={styles.petLine}>Питомец: {review.petName}</div>
          ) : null}
        </div>
      </div>

      <p className={styles.reviewText}>{review.text}</p>

      {review.orderId && onOpenOrder ? (
        <div className={styles.orderRow}>
          <button type="button" className={styles.orderLink} onClick={onOpenOrder}>
            Заказ
            {review.serviceTitle ? `: ${review.serviceTitle}` : ''}
            <span className={styles.orderId}> · {review.orderId}</span>
          </button>
        </div>
      ) : null}

      {published ? (
        <div className={styles.publishedReply}>
          <div className={styles.publishedLabel}>Опубликованный ответ</div>
          <p className={styles.publishedText}>{published}</p>
          <div className={styles.publishedDate}>
            {formatDate(review.specialistReply?.createdAt)}
          </div>
        </div>
      ) : null}

      <div className={styles.editorGrid}>
        <div className={styles.editorColumn}>
          <label className={styles.field} htmlFor={`reply-draft-${review.id}`}>
            <span className={styles.fieldLabel}>
              {published ? 'Редактировать ответ' : 'Ваш ответ'}
            </span>
            <textarea
              id={`reply-draft-${review.id}`}
              className={styles.textarea}
              rows={5}
              value={draft}
              onChange={(event) => onChangeDraft(event.target.value)}
              placeholder="Напишите ответ клиенту. Изменения видны в предпросмотре справа."
            />
          </label>
          {error ? <div className={styles.error}>{error}</div> : null}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.saveButton}
              disabled={isSaving}
              onClick={onSave}
            >
              {isSaving ? 'Сохраняем...' : published ? 'Сохранить изменения' : 'Опубликовать ответ'}
            </button>
          </div>
        </div>

        <div className={styles.previewColumn}>
          <div className={styles.previewLabel}>Предпросмотр для клиента</div>
          <div className={styles.previewCard}>
            <div className={styles.previewTitle}>Ответ специалиста</div>
            <p className={styles.previewText}>{previewText}</p>
          </div>
          <p className={styles.previewHint}>
            Так ответ будет выглядеть в профиле рядом с отзывом после сохранения.
          </p>
        </div>
      </div>
    </article>
  );
}
