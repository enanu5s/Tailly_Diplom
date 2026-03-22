// src/pages/admin-specialist-applications/ui/AdminSpecialistApplicationsPage.tsx

import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import { SpecialistApplicationsModerationSection } from '@/features/specialist-applications/ui/SpecialistApplicationsModerationSection';

import styles from './AdminSpecialistApplicationsPage.module.css';

import type { ReactElement } from 'react';

export function AdminSpecialistApplicationsPage(): ReactElement {
    const navigate = useAppNavigate();

    return (
        <section className={styles.page}>
            <div className={styles.container}>
                <button
                    className={styles.backButton}
                    type="button"
                    onClick={() => navigate('/admin')}
                >
                    Назад в админ-панель
                </button>

                <SpecialistApplicationsModerationSection />
            </div>
        </section>
    );
}