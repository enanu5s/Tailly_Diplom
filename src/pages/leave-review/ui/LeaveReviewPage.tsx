//src/pages/leave-review/ui/LeaveReviewPage.tsx

import { useEffect, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { reviewCreateStore } from '@/features/reviews';
import { StarRating } from '@/features/reviews';
import styles from './LeaveReviewPage.module.css';
import { ReviewCard } from '@/features/reviews';

type LocationState = {
  from?: string;
};

export const LeaveReviewPage = observer(() => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;

  const backTo = useMemo(() => state.from ?? '/profile', [state.from]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    reviewCreateStore.reset();
    if (orderId) void reviewCreateStore.load(orderId);
     
  }, [orderId]);

  const ctx = reviewCreateStore.context;

  const created = reviewCreateStore.createdReview;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <button className={styles.backBtn} type="button" onClick={() => navigate(backTo)}>
          ← Назад
        </button>

        <h1 className={styles.h1}>Оставить отзыв</h1>

        {reviewCreateStore.error && <div className={styles.error}>{reviewCreateStore.error}</div>}
        {reviewCreateStore.loading && <div className={styles.state}>Загружаем...</div>}

        {ctx && (
          <>
            {created ? (<ReviewCard review={created} showThanks />
            ) : (
              <div className={styles.card}>
                <div className={styles.top}>
                  <div className={styles.serviceTitle}>{ctx.serviceTitle}</div>
                  <StarRating
                    value={reviewCreateStore.rating}
                    onChange={(v) => {
                      if (!reviewCreateStore.submitSuccess) {
                        reviewCreateStore.setRating(v);
                      }
                    }}
                    disabled={reviewCreateStore.submitLoading || reviewCreateStore.submitSuccess}
                  />
                </div>

                <div className={styles.meta}>
                  <div>Кличка питомца: {ctx.petName}</div>
                  <div>Хозяин: {ctx.ownerFullName}</div>
                  <div>
                    Петситтер:{' '}
                    <Link className={styles.link} to={`/sitters/${ctx.sitterId}`}>
                      {ctx.sitterName}
                    </Link>
                  </div>
                </div>

                <div className={styles.photos}>
                  <div className={styles.label}>Фото (необязательно)</div>
                  {!reviewCreateStore.submitSuccess && (
                    <label className={styles.photoBtn}>
                      Добавить фото
                      <input
                        className={styles.fileInput}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files ?? []);
                          if (files.length) reviewCreateStore.addPhotos(files);
                          e.currentTarget.value = '';
                        }}
                      />
                    </label>
                  )}

                  {reviewCreateStore.photos.length > 0 && (
                    <div className={styles.photoGrid}>
                      {reviewCreateStore.photos.map((p) => (
                        <div key={p.url} className={styles.photoThumb}>
                          <img className={styles.thumbImg} src={p.url} alt="Фото" />
                          {!reviewCreateStore.submitSuccess && (
                            <button
                              type="button"
                              className={styles.removeBtn}
                              onClick={() => reviewCreateStore.removePhoto(p.url)}
                              disabled={reviewCreateStore.submitLoading}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.textBlock}>
                  <div className={styles.label}>Текстовый отзыв</div>
                  {reviewCreateStore.submitSuccess ? (
                    <div className={styles.textReadonly}>
                      {reviewCreateStore.text}
                    </div>
                  ) : (
                    <textarea
                      className={styles.textarea}
                      rows={6}
                      value={reviewCreateStore.text}
                      onChange={(e) => reviewCreateStore.setText(e.target.value)}
                      placeholder="Поделитесь впечатлениями..."
                      disabled={reviewCreateStore.submitLoading}
                    />
                  )}
                </div>

                {reviewCreateStore.submitError && <div className={styles.error}>{reviewCreateStore.submitError}</div>}
                {reviewCreateStore.submitSuccess && <div className={styles.success}>Отзыв отправлен.</div>}

                <div className={styles.actions}>
                  <button
                    className={
                      reviewCreateStore.submitSuccess
                        ? styles.thanksBtn
                        : styles.primaryBtn
                    }
                    type="button"
                    disabled={
                      reviewCreateStore.submitLoading ||
                      reviewCreateStore.submitSuccess
                    }
                    onClick={() => void reviewCreateStore.submit()}
                  >
                    {reviewCreateStore.submitSuccess
                      ? 'Спасибо за отзыв!'
                      : reviewCreateStore.submitLoading
                        ? 'Отправляем...'
                        : 'Отправить отзыв'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
});