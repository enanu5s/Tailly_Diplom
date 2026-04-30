// src/features/specialist-profile/ui/SpecialistProfileSection.tsx

import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { useAuth } from '@/features/auth/model/useAuth';
import {
  canClientBookSpecialist,
  isClientViewingOwnSpecialistProfile,
} from '@/shared/lib/auth/roleAccess';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import { SpecialistProfileView } from './SpecialistProfileView';
import { specialistProfileStore } from '../model/specialistProfileStore';

import type { ReactElement } from 'react';

export const SpecialistProfileSection = observer((): ReactElement => {
  const navigate = useAppNavigate();
  const { user } = useAuth();
  const params = useParams<{ slug: string }>();

  const slug = params.slug?.trim() ?? '';

  useEffect(() => {
    void specialistProfileStore.load(slug);

    return () => {
      specialistProfileStore.reset();
    };
  }, [slug]);

  const profile = specialistProfileStore.profile;

  const handleRetry = (): void => {
    void specialistProfileStore.load(slug);
  };

  const handleContactSpecialist = (): void => {
    if (!profile) {
      return;
    }

    navigate('/messages', {
      state: {
        specialistId: profile.id,
        specialistSlug: profile.slug,
        specialistAvatarUrl: profile.main.avatarUrl,
        source: 'specialist-profile',
      },
    });
  };

  const handleBookService = (serviceId: string): void => {
    if (!profile) {
      return;
    }

    navigate('/service-booking', {
      state: {
        specialistSlug: profile.slug,
        serviceId,
      },
    });
  };

  const isOwnSpecialistAsClient = Boolean(
    profile &&
      isClientViewingOwnSpecialistProfile(user ?? null, {
        slug: profile.slug,
        id: profile.id,
      }),
  );

  return (
    <SpecialistProfileView
      profile={specialistProfileStore.profile}
      isLoading={specialistProfileStore.isLoading}
      error={specialistProfileStore.error}
      visibleReviews={specialistProfileStore.visibleReviews}
      canLoadMoreReviews={specialistProfileStore.canLoadMoreReviews}
      onRetry={handleRetry}
      onLoadMoreReviews={specialistProfileStore.loadMoreReviews}
      isEditingMain={specialistProfileStore.isEditingMain}
      isSavingMain={specialistProfileStore.isSavingMain}
      mainSaveError={specialistProfileStore.mainSaveError}
      mainForm={specialistProfileStore.mainForm}
      mainFormErrors={specialistProfileStore.mainFormErrors}
      onStartMainEditing={specialistProfileStore.startMainEditing}
      onCancelMainEditing={specialistProfileStore.cancelMainEditing}
      onSetMainField={specialistProfileStore.setMainField}
      onSetMainAvatarFile={specialistProfileStore.setMainAvatarFile}
      onSaveMain={specialistProfileStore.saveMain}
      isEmailChangeModalOpen={specialistProfileStore.isEmailChangeModalOpen}
      pendingEmailChange={specialistProfileStore.pendingEmailChange}
      emailChangeCodeInput={specialistProfileStore.emailChangeCodeInput}
      emailChangeError={specialistProfileStore.emailChangeError}
      emailChangeStep={specialistProfileStore.emailChangeStep}
      isRequestingEmailChangeCode={specialistProfileStore.isRequestingEmailChangeCode}
      isVerifyingEmailChangeCode={specialistProfileStore.isVerifyingEmailChangeCode}
      onCloseEmailChangeModal={specialistProfileStore.closeEmailChangeModal}
      onSetEmailChangeCodeInput={specialistProfileStore.setEmailChangeCodeInput}
      onRequestEmailChangeCode={specialistProfileStore.requestEmailChangeCode}
      onConfirmEmailChangeCode={specialistProfileStore.confirmEmailChangeCode}
      isEditingDetails={specialistProfileStore.isEditingDetails}
      isSavingDetails={specialistProfileStore.isSavingDetails}
      detailsSaveError={specialistProfileStore.detailsSaveError}
      detailsForm={specialistProfileStore.detailsForm}
      detailsFormErrors={specialistProfileStore.detailsFormErrors}
      onStartDetailsEditing={specialistProfileStore.startDetailsEditing}
      onCancelDetailsEditing={specialistProfileStore.cancelDetailsEditing}
      onSetDetailsField={specialistProfileStore.setDetailsField}
      onTogglePetSize={specialistProfileStore.togglePetSize}
      onToggleAllPetSizes={specialistProfileStore.toggleAllPetSizes}
      onTogglePetAge={specialistProfileStore.togglePetAge}
      onToggleAllPetAges={specialistProfileStore.toggleAllPetAges}
      onTogglePetType={specialistProfileStore.togglePetType}
      onToggleAdvantage={specialistProfileStore.toggleAdvantage}
      onAddService={specialistProfileStore.addService}
      onRemoveService={specialistProfileStore.removeService}
      onSetServiceField={specialistProfileStore.setServiceField}
      onSetSpecialistGalleryUrlInput={specialistProfileStore.setSpecialistGalleryUrlInput}
      onAddSpecialistGalleryImageByUrl={
        specialistProfileStore.addSpecialistGalleryImageByUrl
      }
      onAddSpecialistGalleryFiles={specialistProfileStore.addSpecialistGalleryFiles}
      onRemoveSpecialistGalleryImage={specialistProfileStore.removeSpecialistGalleryImage}
      serviceCatalogOptions={specialistProfileStore.serviceCatalogOptions}
      petTypeAliasOptions={specialistProfileStore.petTypeAliasOptions}
      onSaveDetails={specialistProfileStore.saveDetails}
      onContactSpecialist={
        profile && !profile.isOwner && !isOwnSpecialistAsClient
          ? handleContactSpecialist
          : undefined
      }
      onBookService={
        profile &&
        !profile.isOwner &&
        canClientBookSpecialist(user ?? null, { slug: profile.slug, id: profile.id })
          ? handleBookService
          : undefined
      }
    />
  );
});
