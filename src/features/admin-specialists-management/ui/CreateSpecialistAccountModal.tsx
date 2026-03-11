// src/features/admin-specialists-management/ui/CreateSpecialistAccountModal.tsx

import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';

import { adminSpecialistsManagementStore } from '../model/adminSpecialistsManagementStore';
import styles from './CreateSpecialistAccountModal.module.css';

type Props = {
    reviewedBy: string;
    onCreated: (result: {
        specialistId: string;
        specialistSlug?: string;
    }) => void;
};

export const CreateSpecialistAccountModal = observer(
    ({ reviewedBy, onCreated }: Props): ReactElement | null => {
        const store = adminSpecialistsManagementStore;

        if (!store.isModalOpen) {
            return null;
        }

        return (
            <div className={styles.overlay}>
                <div className={styles.modal}>
                    <div className={styles.header}>
                        <div>
                            <h2 className={styles.title}>
                                Создание кабинета специалиста
                            </h2>
                            <p className={styles.subtitle}>
                                Проверь данные из анкеты и создай специалисту
                                аккаунт. После создания отправь ему временный
                                пароль по email.
                            </p>
                        </div>

                        <button
                            className={styles.closeButton}
                            type="button"
                            onClick={() => store.closeModal()}
                        >
                            Закрыть
                        </button>
                    </div>

                    <div className={styles.grid}>
                        <label className={styles.field}>
                            <span className={styles.label}>Email</span>
                            <input
                                className={styles.input}
                                type="email"
                                value={store.form.email}
                                onChange={(event) =>
                                    store.setFormField(
                                        'email',
                                        event.target.value,
                                    )
                                }
                            />
                        </label>

                        <label className={styles.field}>
                            <span className={styles.label}>Имя</span>
                            <input
                                className={styles.input}
                                value={store.form.firstName}
                                onChange={(event) =>
                                    store.setFormField(
                                        'firstName',
                                        event.target.value,
                                    )
                                }
                            />
                        </label>

                        <label className={styles.field}>
                            <span className={styles.label}>Фамилия</span>
                            <input
                                className={styles.input}
                                value={store.form.lastName}
                                onChange={(event) =>
                                    store.setFormField(
                                        'lastName',
                                        event.target.value,
                                    )
                                }
                            />
                        </label>


                        <label className={styles.field}>
                            <span className={styles.label}>Отчество</span>
                            <input
                                className={styles.input}
                                value={store.form.middleName}
                                onChange={(event) =>
                                    store.setFormField(
                                        'middleName',
                                        event.target.value,
                                    )
                                }
                            />
                        </label>

                        <label className={styles.field}>
                            <span className={styles.label}>Телефон</span>
                            <input
                                className={styles.input}
                                value={store.form.phone}
                                onChange={(event) =>
                                    store.setFormField(
                                        'phone',
                                        event.target.value,
                                    )
                                }
                            />
                        </label>

                        <label className={styles.field}>
                            <span className={styles.label}>Город</span>
                            <input
                                className={styles.input}
                                value={store.form.city}
                                onChange={(event) =>
                                    store.setFormField(
                                        'city',
                                        event.target.value,
                                    )
                                }
                            />
                        </label>

                        <label className={styles.fieldWide}>
                            <span className={styles.label}>О специалисте</span>
                            <textarea
                                className={styles.textarea}
                                rows={6}
                                value={store.form.about}
                                onChange={(event) =>
                                    store.setFormField(
                                        'about',
                                        event.target.value,
                                    )
                                }
                            />
                        </label>
                    </div>

                    <label className={styles.checkboxRow}>
                        <input
                            type="checkbox"
                            checked={store.form.consent}
                            onChange={(event) =>
                                store.setFormField(
                                    'consent',
                                    event.target.checked,
                                )
                            }
                        />
                        <span>
                            Подтверждаю создание кабинета специалиста и
                            обработку персональных данных.
                        </span>
                    </label>

                    {store.createError ? (
                        <div className={styles.errorBanner}>
                            {store.createError}
                        </div>
                    ) : null}


                    {store.createdTemporaryPassword ? (
                        <div className={styles.successBanner}>
                            Кабинет создан для {store.createdEmail}. Временный
                            пароль:{' '}
                            <span className={styles.passwordValue}>
                                {store.createdTemporaryPassword}
                            </span>
                            {store.createdSpecialistSlug ? (
                                <span className={styles.slugValue}>
                                    {' '}
                                    · slug: {store.createdSpecialistSlug}
                                </span>
                            ) : null}
                        </div>
                    ) : null}

                    <div className={styles.actions}>
                        <button
                            className={styles.secondaryButton}
                            type="button"
                            onClick={() => store.closeModal()}
                        >
                            Отмена
                        </button>

                        <button
                            className={styles.primaryButton}
                            type="button"
                            disabled={!store.canSubmit}
                            onClick={async () => {
                                const result =
                                    await store.createSpecialistAccount(
                                        reviewedBy,
                                    );

                                if (result) {
                                    onCreated(result);
                                }
                            }}
                        >
                            {store.isCreating
                                ? 'Создаём...'
                                : 'Создать кабинет'}
                        </button>
                    </div>
                </div>
            </div>
        );
    },
);