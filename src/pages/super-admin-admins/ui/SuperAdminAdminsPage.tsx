// src/pages/super-admin-admins/ui/SuperAdminAdminsPage.tsx

import { useNavigate } from 'react-router-dom';

import { SuperAdminAdminsManagementSection } from '@/features/super-admin-admins-management';

import styles from './SuperAdminAdminsPage.module.css';

import type { ReactElement } from 'react';

export function SuperAdminAdminsPage(): ReactElement {
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

                <SuperAdminAdminsManagementSection />
            </div>
        </section>
    );
}