// src/pages/specialist-profile/ui/SpecialistProfilePage.tsx

import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import {
    SpecialistProfileView,
    specialistProfileStore,
} from '@/features/specialist-profile';

import styles from './SpecialistProfilePage.module.css';

export const SpecialistProfilePage = observer(() => {
    const { specialistSlug } = useParams<{ specialistSlug: string }>();

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

        if (!specialistSlug) {
            specialistProfileStore.reset();

            return;
        }

        void specialistProfileStore.load(specialistSlug);

        return () => {
            specialistProfileStore.reset();
        };
    }, [specialistSlug]);

    const handleRetry = (): void => {
        if (!specialistSlug) {
            return;
        }

        void specialistProfileStore.load(specialistSlug);
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <span className={styles.eyebrow}>Профиль специалиста</span>
                    <h1 className={styles.title}>Специалист Tailly</h1>
                </header>

                <SpecialistProfileView
                    profile={specialistProfileStore.profile}
                    isLoading={specialistProfileStore.isLoading}
                    error={specialistProfileStore.error}
                    visibleReviews={specialistProfileStore.visibleReviews}
                    canLoadMoreReviews={specialistProfileStore.canLoadMoreReviews}
                    onRetry={handleRetry}
                    onLoadMoreReviews={specialistProfileStore.loadMoreReviews}
                />
            </div>
        </div>
    );
});