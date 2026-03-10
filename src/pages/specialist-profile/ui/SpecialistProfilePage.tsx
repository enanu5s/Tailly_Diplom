// src/pages/specialist-profile/ui/SpecialistProfilePage.tsx

import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useParams } from 'react-router-dom';

import { specialistProfileStore } from '@/features/specialist-profile/model/specialistProfileStore';
import { SpecialistProfileView } from '@/features/specialist-profile/ui/SpecialistProfileView';

export const SpecialistProfilePage = observer(() => {
    const { specialistSlug } = useParams<{ specialistSlug: string }>();
    const store = specialistProfileStore;

    useEffect(() => {
        if (!specialistSlug) {
            return;
        }

        void store.load(specialistSlug);
    }, [specialistSlug, store]);

    useEffect(() => {
        return () => {
            store.reset();
        };
    }, [store]);

    const handleRetry = (): void => {
        if (!specialistSlug) {
            return;
        }

        void store.load(specialistSlug);
    };

    return (
        <SpecialistProfileView
            profile={store.profile}
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
            onAddSpecialistGalleryImageByUrl={store.addSpecialistGalleryImageByUrl}
            onAddSpecialistGalleryFiles={store.addSpecialistGalleryFiles}
            onRemoveSpecialistGalleryImage={store.removeSpecialistGalleryImage}
            onSaveDetails={() => {
                void store.saveDetails();
            }}
        />
    );
});