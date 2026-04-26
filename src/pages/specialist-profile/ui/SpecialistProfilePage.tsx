// src/pages/specialist-profile/ui/SpecialistProfilePage.tsx

import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { useAuth } from '@/features/auth/model/useAuth';
import { messagesStore } from '@/features/messages';
import { ordersStore } from '@/features/orders/model/ordersStore';
import { specialistProfileStore } from '@/features/specialist-profile/model/specialistProfileStore';
import { SpecialistProfileView } from '@/features/specialist-profile/ui/SpecialistProfileView';
import {
  canClientBookSpecialist,
  isAuthenticatedRole,
  isClientViewingOwnSpecialistProfile,
} from '@/shared/lib/auth/roleAccess';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

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
  const navigate = useAppNavigate();
  const { isAuth, user } = useAuth();

  const normalizedSpecialistSlug = specialistSlug?.trim() ?? '';
  const store = specialistProfileStore;
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
    }
  }, [isAuth, store]);

  const handleRetry = (): void => {
    if (!normalizedSpecialistSlug) {
      return;
    }

    void store.load(normalizedSpecialistSlug);
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

  const handleBookService = (serviceId: string): void => {
    if (!store.profile) {
      return;
    }

    navigate('/service-booking', {
      state: {
        specialistSlug: store.profile.slug,
        serviceId,
      },
    });
  };

  const isSameSlug =
    Boolean(user?.specialistSlug?.trim()) &&
    user!.specialistSlug!.trim() === (store.profile?.slug.trim() ?? '');

  const isSameSpecialistId =
    Boolean(user?.specialistId) && user!.specialistId === (store.profile?.id ?? '');

  const canManageOwnProfile = Boolean(
    isAuth &&
    store.profile &&
    user?.role === 'specialist' &&
    (isSameSlug || isSameSpecialistId),
  );
  const canUseSpecialistActions = Boolean(
    isAuth && user?.id && isAuthenticatedRole(user?.role),
  );

  const canContactSpecialist = Boolean(
    canUseSpecialistActions &&
      store.profile &&
      !canManageOwnProfile &&
      !isClientViewingOwnSpecialistProfile(user, {
        slug: store.profile.slug,
        id: store.profile.id,
      }),
  );

  const canBookSpecialist = Boolean(
    canUseSpecialistActions &&
    store.profile &&
    canClientBookSpecialist(user, {
      slug: store.profile.slug,
      id: store.profile.id,
    }) &&
    !canManageOwnProfile,
  );

  useEffect(() => {
    if (!canManageOwnProfile || !store.profile) {
      return;
    }

    void ordersStore.loadServices();
  }, [canManageOwnProfile, store.profile?.slug]);

  const ownerProfileSlug = store.profile?.slug ?? '';
  const pendingClientOrdersCount =
    canManageOwnProfile && ownerProfileSlug
      ? ordersStore.serviceOrders.filter(
          (order) =>
            order.specialistSlug === ownerProfileSlug &&
            order.status === 'pending_confirmation',
        ).length
      : 0;

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
          isEmailChangeModalOpen={store.isEmailChangeModalOpen}
          pendingEmailChange={store.pendingEmailChange}
          emailChangeCodeInput={store.emailChangeCodeInput}
          emailChangeError={store.emailChangeError}
          emailChangeStep={store.emailChangeStep}
          isRequestingEmailChangeCode={store.isRequestingEmailChangeCode}
          isVerifyingEmailChangeCode={store.isVerifyingEmailChangeCode}
          onCloseEmailChangeModal={store.closeEmailChangeModal}
          onSetEmailChangeCodeInput={store.setEmailChangeCodeInput}
          onRequestEmailChangeCode={() => {
            void store.requestEmailChangeCode();
          }}
          onConfirmEmailChangeCode={() => {
            void store.confirmEmailChangeCode();
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
          onAddSpecialistGalleryImageByUrl={store.addSpecialistGalleryImageByUrl}
          onAddSpecialistGalleryFiles={store.addSpecialistGalleryFiles}
          onRemoveSpecialistGalleryImage={store.removeSpecialistGalleryImage}
          serviceCatalogOptions={store.serviceCatalogOptions}
          petTypeAliasOptions={store.petTypeAliasOptions}
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
          onBookService={canBookSpecialist ? handleBookService : undefined}
          ownerWorkspace={
            canManageOwnProfile && store.profile
              ? {
                  reviewsPath: `/specialists/${store.profile.slug.trim()}/reviews`,
                  ordersPath: `/specialists/${store.profile.slug.trim()}/orders`,
                  orderStatsPath: `/specialists/${store.profile.slug.trim()}/orders/stats`,
                  shopOrdersPath: '/shop/orders',
                  pendingConfirmationCount: pendingClientOrdersCount,
                }
              : undefined
          }
        />
      </div>
    </div>
  );
});
