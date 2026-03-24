// src/pages/specialist-reviews/ui/SpecialistReviewsPage.tsx

import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import { specialistProfileStore } from '@/features/specialist-profile/model/specialistProfileStore';
import { specialistReviewRepliesStore } from '@/features/specialist-profile/model/specialistReviewRepliesStore';
import type { SpecialistReview } from '@/features/specialist-profile/model/types';
import { SpecialistReviewReplyEditor } from '@/features/specialist-profile/ui/SpecialistReviewReplyEditor';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import styles from './SpecialistReviewsPage.module.css';

import type { ReactElement } from 'react';

export const SpecialistReviewsPage = observer((): ReactElement => {
  const { specialistSlug } = useParams<{ specialistSlug: string }>();
  const navigate = useAppNavigate();
  const slug = specialistSlug?.trim() ?? '';
  const store = specialistProfileStore;
  const repliesStore = specialistReviewRepliesStore;

  useEffect(() => {
    if (!slug) {
      return;
    }

    void store.load(slug);
  }, [slug, store]);

  useEffect(() => {
    if (store.isLoading || !store.profile) {
      return;
    }

    repliesStore.hydrateDraftsFromReviews(store.profile.reviews);
  }, [slug, store.isLoading, store.profile?.id, repliesStore, store]);

  const profileSlug = store.profile?.slug.trim() ?? '';
  const profilePath = profileSlug ? `/specialists/${profileSlug}` : '/';
  const ordersPath = profileSlug ? `/specialists/${profileSlug}/orders` : '/';

  const handleSave = async (review: SpecialistReview): Promise<void> => {
    if (!store.profile) {
      return;
    }

    const s = store.profile.slug.trim();
    const updated = await repliesStore.saveReply({ slug: s, review });

    if (!updated) {
      return;
    }

    store.applyProfileFromReviewReply(updated);
  };

  const openOrder = (orderId: string): void => {
    navigate(ordersPath, {
      state: { highlightedOrderId: orderId },
    });
  };

  if (!slug) {
    return (
      <div className={styles.page}>
        <p className={styles.muted}>Не указан специалист.</p>
      </div>
    );
  }

  if (store.isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.stateCard}>Загружаем отзывы…</div>
      </div>
    );
  }

  if (store.error) {
    return (
      <div className={styles.page}>
        <div className={styles.stateCard}>
          <p>{store.error}</p>
          <button type="button" className={styles.primaryButton} onClick={() => void store.load(slug)}>
            Повторить
          </button>
        </div>
      </div>
    );
  }

  const reviews = store.profile?.reviews ?? [];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb}>
          <Link to={profilePath} className={styles.backLink}>
            ← Профиль специалиста
          </Link>
        </nav>

        <header className={styles.header}>
          <h1 className={styles.title}>Отзывы и ответы</h1>
          <p className={styles.subtitle}>
            Все отзывы клиентов в одном месте. Текст справа обновляется при вводе. После сохранения ответ
            виден в профиле и в карточке заказа.
          </p>
          <Link to={ordersPath} className={styles.secondaryLink}>
            Перейти к заказам клиентов
          </Link>
        </header>

        {reviews.length === 0 ? (
          <div className={styles.empty}>Пока нет отзывов.</div>
        ) : (
          <div className={styles.list}>
            {reviews.map((review) => (
              <SpecialistReviewReplyEditor
                key={review.id}
                review={review}
                draft={repliesStore.draftsByReviewId[review.id] ?? ''}
                error={repliesStore.errorsByReviewId[review.id] ?? ''}
                isSaving={Boolean(repliesStore.savingByReviewId[review.id])}
                onChangeDraft={(value) => repliesStore.setDraft(review.id, value)}
                onSave={() => {
                  void handleSave(review);
                }}
                onOpenOrder={
                  review.orderId
                    ? () => openOrder(review.orderId as string)
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
