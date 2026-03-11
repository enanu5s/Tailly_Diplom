// src/pages/admin-placeholder/ui/AdminPlaceholderPage.tsx

import type { ReactElement } from 'react';

import styles from './AdminPlaceholderPage.module.css';

type Props = {
    title: string;
    description?: string;
};

export function AdminPlaceholderPage({
    title,
    description = 'Раздел будет реализован следующим этапом.',
}: Props): ReactElement {
    return (
        <section className={styles.page}>
            <div className={styles.container}>
                <div className={styles.card}>
                    <h1 className={styles.title}>{title}</h1>
                    <p className={styles.description}>{description}</p>
                </div>
            </div>
        </section>
    );
}