// src/pages/admin-profile/ui/AdminProfilePage.tsx

import { useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ReactElement } from 'react';

import { authStore } from '@/features/auth/model/authStore';

import styles from './AdminProfilePage.module.css';

export function AdminProfilePage(): ReactElement {
    const navigate = useNavigate();
    const authState = useSyncExternalStore(
        authStore.subscribe,
        authStore.getState,
    );

    const user = authState.user;

    return (
        <section className={styles.page}>
            <div className={styles.container}>
                <button
                    className={styles.backButton}
                    type="button"
                    onClick={() => navigate('/admin')}
                >
                    Назад
                </button>

                <div className={styles.card}>
                    <div className={styles.header}>
                        <span className={styles.badge}>
                            {user?.role === 'super_admin'
                                ? 'Главный администратор'
                                : 'Администратор'}
                        </span>

                        <h1 className={styles.title}>
                            Профиль администратора
                        </h1>

                        <p className={styles.subtitle}>
                            Базовая страница профиля администратора. На
                            следующем этапе сюда можно добавить backend-ready
                            редактирование персональных данных.
                        </p>
                    </div>

                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Фамилия</span>
                            <span className={styles.value}>
                                {user?.lastName || '—'}
                            </span>
                        </div>

                        <div className={styles.infoItem}>
                            <span className={styles.label}>Имя</span>
                            <span className={styles.value}>
                                {user?.firstName || '—'}
                            </span>
                        </div>

                        <div className={styles.infoItem}>
                            <span className={styles.label}>Отчество</span>
                            <span className={styles.value}>
                                {user?.middleName || '—'}
                            </span>
                        </div>

                        <div className={styles.infoItem}>
                            <span className={styles.label}>Email</span>
                            <span className={styles.value}>
                                {user?.email || '—'}
                            </span>
                        </div>

                        <div className={styles.infoItem}>
                            <span className={styles.label}>Телефон</span>
                            <span className={styles.value}>
                                {user?.phone || '—'}
                            </span>
                        </div>

                        <div className={styles.infoItem}>
                            <span className={styles.label}>Роль</span>
                            <span className={styles.value}>
                                {user?.role === 'super_admin'
                                    ? 'Главный администратор'
                                    : 'Администратор'}
                            </span>
                        </div>


                        <div className={styles.infoItem}>
                            <span className={styles.label}>
                                ID администратора
                            </span>
                            <span className={styles.value}>
                                {user?.adminId || '—'}
                            </span>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button
                            className={styles.primaryButton}
                            type="button"
                            onClick={() =>
                                navigate('/profile/security/password')
                            }
                        >
                            Сменить пароль
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}