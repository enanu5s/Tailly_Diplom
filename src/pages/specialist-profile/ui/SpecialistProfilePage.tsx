// src/pages/specialist-profile/ui/SpecialistProfilePage.tsx

import { useEffect } from 'react';
import type { ReactElement } from 'react';
import { observer } from 'mobx-react-lite';
import { useParams } from 'react-router-dom';

import { useAuth } from '@/features/auth/model/useAuth';
import { specialistProfileStore } from '@/features/specialist-profile/model/specialistProfileStore';
import { specialistReviewRepliesStore } from '@/features/specialist-profile/model/specialistReviewRepliesStore';
import type { SpecialistReview } from '@/features/specialist-profile/model/types';
import { SpecialistProfileView } from '@/features/specialist-profile/ui/SpecialistProfileView';
import { SpecialistReviewRepliesPanel } from '@/features/specialist-profile/ui/SpecialistReviewRepliesPanel';

import styles from './SpecialistProfilePage.module.css';

export const SpecialistProfilePage = observer((): ReactElement => {
    const { specialistSlug } = useParams<{ specialistSlug: string }>();
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
        return () => {
            store.reset();
            repliesStore.reset();
        };
    }, [store, repliesStore]);

    const handleRetry = (): void => {
        if (!normalizedSpecialistSlug) {
            return;
        }

        void store.load(normalizedSpecialistSlug);
    };

    const handleSaveReply = async (
        review: SpecialistReview,
    ): Promise<void> => {
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

    const isSameSlug =
        Boolean(user?.specialistSlug?.trim()) &&
        user!.specialistSlug!.trim() === (store.profile?.slug.trim() ?? '');

    const isSameSpecialistId =
        Boolean(user?.specialistId) &&
        user!.specialistId === (store.profile?.id ?? '');

    const canManageOwnProfile = Boolean(
        store.profile &&
        user?.role === 'specialist' &&
        (isSameSlug || isSameSpecialistId),
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
                    onSetSpecialistGalleryUrlInput={
                        store.setSpecialistGalleryUrlInput
                    }
                    onAddSpecialistGalleryImageByUrl={
                        store.addSpecialistGalleryImageByUrl
                    }
                    onAddSpecialistGalleryFiles={store.addSpecialistGalleryFiles}
                    onRemoveSpecialistGalleryImage={
                        store.removeSpecialistGalleryImage
                    }
                    onSaveDetails={() => {
                        void store.saveDetails();
                    }}
                />

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