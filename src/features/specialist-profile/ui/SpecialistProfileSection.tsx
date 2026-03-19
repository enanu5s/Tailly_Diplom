// src/features/specialist-profile/ui/SpecialistProfileSection.tsx

import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { specialistProfileStore } from "../model/specialistProfileStore";
import { SpecialistProfileView } from "./SpecialistProfileView";

import type { ReactElement } from "react";

export const SpecialistProfileSection = observer((): ReactElement => {
  const navigate = useNavigate();
  const params = useParams<{ slug: string }>();

  const slug = params.slug?.trim() ?? "";

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

    navigate("/messages", {
      state: {
        specialistSlug: profile.slug,
        source: "specialist-profile",
      },
    });
  };

  const handleBookService = (serviceId: string): void => {
    if (!profile) {
      return;
    }

    navigate("/service-booking", {
      state: {
        specialistSlug: profile.slug,
        serviceId,
      },
    });
  };

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
      onSetServiceBookingMode={specialistProfileStore.setServiceBookingMode}
      onSetServiceDurationField={specialistProfileStore.setServiceDurationField}
      onSetServiceBufferField={specialistProfileStore.setServiceBufferField}
      onSetServiceCompatibilityField={
        specialistProfileStore.setServiceCompatibilityField
      }
      onSetServiceAdvanceField={specialistProfileStore.setServiceAdvanceField}
      onSetServiceMultiDayField={specialistProfileStore.setServiceMultiDayField}
      onSetServiceFlagField={specialistProfileStore.setServiceFlagField}
      onSetSpecialistGalleryUrlInput={
        specialistProfileStore.setSpecialistGalleryUrlInput
      }
      onAddSpecialistGalleryImageByUrl={
        specialistProfileStore.addSpecialistGalleryImageByUrl
      }
      onAddSpecialistGalleryFiles={
        specialistProfileStore.addSpecialistGalleryFiles
      }
      onRemoveSpecialistGalleryImage={
        specialistProfileStore.removeSpecialistGalleryImage
      }
      onSaveDetails={specialistProfileStore.saveDetails}
      onContactSpecialist={
        profile && !profile.isOwner ? handleContactSpecialist : undefined
      }
      onBookService={
        profile && !profile.isOwner ? handleBookService : undefined
      }
    />
  );
});
