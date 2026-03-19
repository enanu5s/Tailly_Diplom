// src/pages/specialist-profile/ui/SpecialistProfilePage.tsx

import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '@/features/auth/model/useAuth';
import { messagesStore } from '@/features/messages';
import { specialistProfileStore } from '@/features/specialist-profile/model/specialistProfileStore';
import { specialistReviewRepliesStore } from '@/features/specialist-profile/model/specialistReviewRepliesStore';
import type { SpecialistReview } from '@/features/specialist-profile/model/types';
import { SpecialistProfileView } from '@/features/specialist-profile/ui/SpecialistProfileView';
import { SpecialistReviewRepliesPanel } from '@/features/specialist-profile/ui/SpecialistReviewRepliesPanel';

import bookingCtaStyles from './SpecialistProfileBookingCta.module.css';
import styles from './SpecialistProfilePage.module.css';

import type { ReactElement } from 'react';

function getViewerDisplayName(user: unknown): string {
  if (typeof user !== 'object' || user === null) {
    return 'Пользователь';
  }

  const source = user as {
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
    role?: string;
  };

  const fullName =
    `${source.firstName?.trim() ?? ''} ${source.lastName?.trim() ?? ''}`.trim();

  if (fullName) {
    return fullName;
  }

  if (source.name?.trim()) {
    return source.name.trim();
  }

  if (source.email?.trim()) {
    return source.email.trim();
  }

  if (source.role === 'client') {
    return 'Клиент';
  }

  if (source.role === 'specialist') {
    return 'Специалист';
  }

  if (source.role === 'admin' || source.role === 'super_admin') {
    return 'Администратор';
  }

  return 'Пользователь';
}

function getViewerAvatarUrl(user: unknown): string | undefined {
  if (typeof user !== 'object' || user === null) {
    return undefined;
  }

  const source = user as { avatarUrl?: string };

  return source.avatarUrl?.trim() || undefined;
}

export const SpecialistProfilePage = observer((): ReactElement => {
  const { specialistSlug } = useParams<{ specialistSlug: string }>();
  const navigate = useNavigate();
  const { isAuth, user } = useAuth();

  const normalizedSpecialistSlug = specialistSlug?.trim() ?? '';
  const store = specialistProfileStore;
  const repliesStore = specialistReviewRepliesStore;

  useEffect(() => {
    if (!normalizedSpecialistSlug) {
      return;
    }

    void store.load(normalizedSpecialistSlug);
  }, [
    normalizedSpecialistSlug,
    store,
    isAuth,
    user?.id,
    user?.role,
    user?.specialistSlug,
    user?.specialistId,
  ]);

  useEffect(() => {
    if (!isAuth) {
      store.reset();
      repliesStore.reset();
    }
  }, [isAuth, store, repliesStore]);

  const handleRetry = (): void => {
    if (!normalizedSpecialistSlug) {
      return;
    }

    void store.load(normalizedSpecialistSlug);
  };

  const handleSaveReply = async (review: SpecialistReview): Promise<void> => {
    if (!store.profile) {
      return;
    }

    const slug = store.profile.slug.trim();

    const isSaved = await repliesStore.saveReply({
      slug,
      review,
    });

    if (!isSaved) {
      return;
    }

    await store.load(slug);
  };

  const handleContactSpecialist = async (): Promise<void> => {
    if (!store.profile || !user?.id) {
      return;
    }

    await messagesStore.startChatWithSpecialist({
      viewer: {
        userId: user.id,
        role:
          user.role === 'client' ||
          user.role === 'specialist' ||
          user.role === 'admin' ||
          user.role === 'super_admin'
            ? user.role
            : 'guest',
        displayName: getViewerDisplayName(user),
        avatarUrl: getViewerAvatarUrl(user),
      },
      specialistId: store.profile.id,
      specialistSlug: store.profile.slug,
      specialistName:
        `${store.profile.main.firstName} ${store.profile.main.lastName}`.trim(),
      specialistAvatarUrl: store.profile.main.avatarUrl,
    });

    navigate('/messages');
  };

  const handleStartBooking = (): void => {
    if (!store.profile) {
      return;
    }

    navigate('/orders/create', {
      state: {
        specialistSlug: store.profile.slug,
      },
    });
  };

  const isSameSlug =
    Boolean(user?.specialistSlug?.trim()) &&
    user!.specialistSlug!.trim() === (store.profile?.slug.trim() ?? '');

  const isSameSpecialistId =
    Boolean(user?.specialistId) &&
    user!.specialistId === (store.profile?.id ?? '');

  const canManageOwnProfile = Boolean(
    isAuth &&
      store.profile &&
      user?.role === 'specialist' &&
      (isSameSlug || isSameSpecialistId),
  );

  const canContactSpecialist = Boolean(
    isAuth && user?.id && store.profile && !canManageOwnProfile,
  );

  const canBookSpecialist = Boolean(
    isAuth &&
      user?.id &&
      user?.role === 'client' &&
      store.profile &&
      !canManageOwnProfile,
  );

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <SpecialistProfileView
          profile={
            store.profile
              ? {
                  ...store.profile,
                  isOwner: canManageOwnProfile,
                }
              : null
          }
          isLoading={store.isLoading}
          error={store.error}
          visibleReviews={store.visibleReviews}
          canLoadMoreReviews={store.canLoadMoreReviews}
          onRetry={handleRetry}
          onLoadMoreReviews={store.loadMoreReviews}
          isEditingMain={store.isEditingMain}
          isSavingMain={store.isSavingMain}
          mainSaveError={store.mainSaveError}
          mainForm={store.mainForm}
          mainFormErrors={store.mainFormErrors}
          onStartMainEditing={store.startMainEditing}
          onCancelMainEditing={store.cancelMainEditing}
          onSetMainField={store.setMainField}
          onSetMainAvatarFile={store.setMainAvatarFile}
          onSaveMain={() => {
            void store.saveMain();
          }}
          isEditingDetails={store.isEditingDetails}
          isSavingDetails={store.isSavingDetails}
          detailsSaveError={store.detailsSaveError}
          detailsForm={store.detailsForm}
          detailsFormErrors={store.detailsFormErrors}
          onStartDetailsEditing={store.startDetailsEditing}
          onCancelDetailsEditing={store.cancelDetailsEditing}
          onSetDetailsField={store.setDetailsField}
          onTogglePetSize={store.togglePetSize}
          onToggleAllPetSizes={store.toggleAllPetSizes}
          onTogglePetAge={store.togglePetAge}
          onToggleAllPetAges={store.toggleAllPetAges}
          onTogglePetType={store.togglePetType}
          onToggleAdvantage={store.toggleAdvantage}
          onAddService={store.addService}
          onRemoveService={store.removeService}
          onSetServiceField={store.setServiceField}
          onSetSpecialistGalleryUrlInput={store.setSpecialistGalleryUrlInput}
          onAddSpecialistGalleryImageByUrl={
            store.addSpecialistGalleryImageByUrl
          }
          onAddSpecialistGalleryFiles={store.addSpecialistGalleryFiles}
          onRemoveSpecialistGalleryImage={store.removeSpecialistGalleryImage}
          onSaveDetails={() => {
            void store.saveDetails();
          }}
          onContactSpecialist={
            canContactSpecialist
              ? () => {
                  void handleContactSpecialist();
                }
              : undefined
          }
        />

        {canBookSpecialist && store.profile ? (
          <section className={bookingCtaStyles.card}>
            <div className={bookingCtaStyles.content}>
              <div>
                <h2 className={bookingCtaStyles.title}>Готовы оформить услугу?</h2>
                <p className={bookingCtaStyles.description}>
                  Выберите услугу, питомца, дату и время. После создания заказ
                  сразу появится у вас в профиле.
                </p>
              </div>

              <div className={bookingCtaStyles.actions}>
                <button
                  type="button"
                  className={bookingCtaStyles.primaryButton}
                  onClick={handleStartBooking}
                >
                  Оформить заказ
                </button>
              </div>
            </div>
          </section>
        ) : null}

        {canManageOwnProfile && store.profile ? (
          <SpecialistReviewRepliesPanel
            reviews={store.profile.reviews}
            canManageReplies={canManageOwnProfile}
            draftByReviewId={repliesStore.draftsByReviewId}
            errorsByReviewId={repliesStore.errorsByReviewId}
            savingByReviewId={repliesStore.savingByReviewId}
            onChangeDraft={repliesStore.setDraft}
            onSaveReply={handleSaveReply}
          />
        ) : null}
      </div>
    </div>
  );
});