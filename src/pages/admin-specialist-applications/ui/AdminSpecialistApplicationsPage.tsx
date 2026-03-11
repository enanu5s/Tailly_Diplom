// src/pages/admin-specialist-applications/ui/AdminSpecialistApplicationsPage.tsx

import type { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';

import { SpecialistApplicationsModerationSection } from '@/features/specialist-applications';

import styles from './AdminSpecialistApplicationsPage.module.css';

export function AdminSpecialistApplicationsPage(): ReactElement {
    const navigate = useNavigate();

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