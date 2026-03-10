// src/pages/specialist-profile/ui/SpecialistProfilePage.tsx

import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useParams } from 'react-router-dom';

import { useAuth } from '@/features/auth/model/useAuth';
import { specialistProfileStore } from '@/features/specialist-profile/model/specialistProfileStore';
import { specialistReviewRepliesStore } from '@/features/specialist-profile/model/specialistReviewRepliesStore';
import type { SpecialistReview } from '@/features/specialist-profile/model/types';
import { SpecialistProfileView } from '@/features/specialist-profile/ui/SpecialistProfileView';
import { SpecialistReviewRepliesPanel } from '@/features/specialist-profile/ui/SpecialistReviewRepliesPanel';

export const SpecialistProfilePage = observer(() => {
    const { specialistSlug } = useParams<{ specialistSlug: string }>();
    const { isAuth, user } = useAuth();

    const store = specialistProfileStore;
    const repliesStore = specialistReviewRepliesStore;

    useEffect(() => {
        if (!specialistSlug) {
            return;
        }

        void store.load(specialistSlug);
    }, [specialistSlug, store, isAuth, user?.id, user?.role, user?.specialistSlug, user?.specialistId]);

    useEffect(() => {
        return () => {
            store.reset();
            repliesStore.reset();
        };
    }, [store, repliesStore]);

    const handleRetry = (): void => {
        if (!specialistSlug) {
            return;
        }

        void store.load(specialistSlug);
    };

    const handleSaveReply = async (review: SpecialistReview): Promise<void> => {
        if (!store.profile) {
            return;
        }

        const isSaved = await repliesStore.saveReply({
            slug: store.profile.slug,
            review,
        });

        if (!isSaved) {
            return;
        }

        await store.load(store.profile.slug);
    };

    return (
        <>
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

            {store.profile?.isOwner ? (
                <SpecialistReviewRepliesPanel
                    profile={store.profile}
                    store={repliesStore}
                    onSaveReply={handleSaveReply}
                />
            ) : null}
        </>
    );
});