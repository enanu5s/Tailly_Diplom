// src/features/specialist-applications/ui/SpecialistApplicationsModerationSection.tsx

import { observer } from 'mobx-react-lite';
import { useEffect, useSyncExternalStore } from 'react';
import type { ReactElement } from 'react';

import { authStore } from '@/features/auth';
import { specialistApplicationsModerationStore } from '../model/specialistApplicationsModerationStore.ts';
import type { SpecialistApplication } from '../model/types';
import styles from './SpecialistApplicationsModerationSection.module.css';

function formatDate(value?: string | null): string {
    if (!value) {
        return '—';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '—';
    }

    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

function getStatusLabel(application: SpecialistApplication): string {
    if (application.status === 'pending_review') {
        return 'На проверке';
    }

    if (application.status === 'interview_assigned') {
        return 'Собеседование назначено';
    }

    if (application.status === 'approved') {
        return 'Одобрено';
    }

    return 'Отклонено';
}

function getStatusClassName(
    application: SpecialistApplication,
    stylesMap: Record<string, string>,
): string {
    if (application.status === 'pending_review') {
        return stylesMap.statusPending;
    }

    if (application.status === 'interview_assigned') {
        return stylesMap.statusInterview;
    }

    if (application.status === 'approved') {
        return stylesMap.statusApproved;
    }

    return stylesMap.statusRejected;
}

export const SpecialistApplicationsModerationSection = observer(
    (): ReactElement => {
        const store = specialistApplicationsModerationStore;
        const authState = useSyncExternalStore(
            authStore.subscribe,
            authStore.getState,
        );

        const reviewedBy =
            authState.user?.email ?? authState.user?.adminId ?? 'admin';

        useEffect(() => {
            void store.load();
        }, [store]);

        const selected = store.selectedApplication;

        return (
            <div className={styles.root}>
                <div className={styles.hero}>
                    <div className={styles.heroContent}>
                        <span className={styles.badge}>Админ-модерация</span>
                        <h1 className={styles.title}>Анкеты специалистов</h1>
                        <p className={styles.subtitle}>
                            Здесь отображаются заявки, отправленные с публичной
                            страницы “Стать специалистом”. Администратор
                            проверяет анкету, назначает собеседование или
                            отклоняет заявку.
                        </p>
                    </div>

                    <div className={styles.heroStats}>
                        <div className={styles.statCard}>
                            <span className={styles.statLabel}>Активные</span>
                            <span className={styles.statValue}>
                                {store.pendingApplications.length}
                            </span>
                        </div>

                        <div className={styles.statCard}>
                            <span className={styles.statLabel}>Обработанные</span>
                            <span className={styles.statValue}>
                                {store.processedApplications.length}
                            </span>
                        </div>
                    </div>
                </div>

                {store.isLoading ? (
                    <div className={styles.stateCard}>Загрузка заявок...</div>
                ) : null}

                {!store.isLoading && store.loadError ? (
                    <div className={styles.errorBanner}>{store.loadError}</div>
                ) : null}


                {!store.isLoading && !store.loadError ? (
                    <div className={styles.layout}>
                        <aside className={styles.sidebar}>
                            <div className={styles.sidebarHeader}>
                                <h2 className={styles.sectionTitle}>
                                    Очередь заявок
                                </h2>
                            </div>

                            {store.sortedApplications.length === 0 ? (
                                <div className={styles.emptyCard}>
                                    Пока нет новых заявок.
                                </div>
                            ) : (
                                <div className={styles.applicationList}>
                                    {store.sortedApplications.map((item) => (
                                        <button
                                            key={item.id}
                                            className={`${styles.applicationListItem} ${selected?.id === item.id
                                                    ? styles.applicationListItemActive
                                                    : ''
                                                }`}
                                            type="button"
                                            onClick={() =>
                                                store.selectApplication(item.id)
                                            }
                                        >
                                            <div className={styles.applicationTop}>
                                                <span className={styles.applicationName}>
                                                    {item.fullName}
                                                </span>

                                                <span
                                                    className={getStatusClassName(
                                                        item,
                                                        styles,
                                                    )}
                                                >
                                                    {getStatusLabel(item)}
                                                </span>
                                            </div>

                                            <div className={styles.applicationMeta}>
                                                {item.city} · {formatDate(item.createdAt)}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </aside>

                        <section className={styles.details}>
                            {!selected ? (
                                <div className={styles.emptyCard}>
                                    Выбери заявку слева.
                                </div>
                            ) : (
                                <div className={styles.detailsCard}>
                                    <div className={styles.detailsHeader}>
                                        <div>
                                            <h2 className={styles.detailsTitle}>
                                                {selected.fullName}
                                            </h2>
                                            <p className={styles.detailsSubtitle}>
                                                {selected.email} · {selected.phone}
                                            </p>
                                        </div>


                                        <span
                                            className={getStatusClassName(
                                                selected,
                                                styles,
                                            )}
                                        >
                                            {getStatusLabel(selected)}
                                        </span>
                                    </div>

                                    <div className={styles.infoGrid}>
                                        <div className={styles.infoItem}>
                                            <span className={styles.infoLabel}>Город</span>
                                            <span className={styles.infoValue}>
                                                {selected.city}
                                            </span>
                                        </div>

                                        <div className={styles.infoItem}>
                                            <span className={styles.infoLabel}>
                                                Дата отправки
                                            </span>
                                            <span className={styles.infoValue}>
                                                {formatDate(selected.createdAt)}
                                            </span>
                                        </div>

                                        <div className={styles.infoItem}>
                                            <span className={styles.infoLabel}>
                                                Собеседование
                                            </span>
                                            <span className={styles.infoValue}>
                                                {selected.interviewDate
                                                    ? formatDate(selected.interviewDate)
                                                    : '—'}
                                            </span>
                                        </div>

                                        <div className={styles.infoItem}>
                                            <span className={styles.infoLabel}>
                                                Проверил
                                            </span>
                                            <span className={styles.infoValue}>
                                                {selected.reviewedBy || '—'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className={styles.aboutBlock}>
                                        <h3 className={styles.blockTitle}>О себе</h3>
                                        <p className={styles.aboutText}>{selected.about}</p>
                                    </div>

                                    <div className={styles.formBlock}>
                                        <h3 className={styles.blockTitle}>
                                            Решение по заявке
                                        </h3>


                                        <div className={styles.formGrid}>
                                            <label className={styles.field}>
                                                <span className={styles.fieldLabel}>
                                                    Дата и время собеседования
                                                </span>
                                                <input
                                                    className={styles.input}
                                                    type="datetime-local"
                                                    value={store.draft.interviewDate}
                                                    onChange={(event) =>
                                                        store.setDraftField(
                                                            'interviewDate',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </label>

                                            <label className={styles.fieldWide}>
                                                <span className={styles.fieldLabel}>
                                                    Комментарий администратора
                                                </span>
                                                <textarea
                                                    className={styles.textarea}
                                                    rows={5}
                                                    value={store.draft.reviewComment}
                                                    onChange={(event) =>
                                                        store.setDraftField(
                                                            'reviewComment',
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="Например: уточнить опыт с крупными собаками или причину отклонения."
                                                />
                                            </label>
                                        </div>

                                        {store.actionError ? (
                                            <div className={styles.errorBanner}>
                                                {store.actionError}
                                            </div>
                                        ) : null}

                                        <div className={styles.actions}>
                                            <button
                                                className={styles.secondaryButton}
                                                type="button"
                                                disabled={store.isAssigningInterview}
                                                onClick={() => {
                                                    void store.assignInterview(reviewedBy);
                                                }}
                                            >
                                                {store.isAssigningInterview
                                                    ? 'Назначаем...'
                                                    : 'Назначить собеседование'}
                                            </button>


                                            <button
                                                className={styles.primaryButton}
                                                type="button"
                                                disabled={store.isApproving}
                                                onClick={() => {
                                                    void store.approveSelected(reviewedBy);
                                                }}
                                            >
                                                {store.isApproving
                                                    ? 'Одобряем...'
                                                    : 'Одобрить'}
                                            </button>

                                            <button
                                                className={styles.dangerButton}
                                                type="button"
                                                disabled={store.isRejecting}
                                                onClick={() => {
                                                    void store.rejectSelected(reviewedBy);
                                                }}
                                            >
                                                {store.isRejecting
                                                    ? 'Отклоняем...'
                                                    : 'Отклонить'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>
                ) : null}
            </div>
        );
    },
);