// src/features/super-admin-admins-management/ui/SuperAdminAdminsManagementSection.tsx

import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';

import styles from './SuperAdminAdminsManagementSection.module.css';
import {
    ADMIN_DEPARTMENT_OPTIONS,
    ADMIN_POSITION_OPTIONS,
    mergeWithCurrentOption,
} from '../data/adminOrganizationOptions';
import { superAdminAdminsManagementStore } from '../model/superAdminAdminsManagementStore';

import type { ReactElement } from 'react';


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
    }).format(date);
}

export const SuperAdminAdminsManagementSection = observer(
    (): ReactElement => {
        const store = superAdminAdminsManagementStore;

        useEffect(() => {
            void store.load();
        }, [store]);

        return (
            <div className={styles.root}>
                <div className={styles.hero}>
                    <div className={styles.heroContent}>
                        <span className={styles.badge}>
                            Только для главного администратора
                        </span>

                        <h1 className={styles.title}>
                            Управление администраторами
                        </h1>

                        <p className={styles.subtitle}>
                            Здесь можно создавать обычных
                            администраторов, редактировать их
                            данные (должность и отдел — из
                            списков), а также удалять
                            неактуальные аккаунты.
                        </p>
                    </div>

                    <button
                        className={styles.primaryButton}
                        type="button"
                        onClick={() => store.openCreateModal()}
                    >
                        Добавить администратора
                    </button>
                </div>

                {store.deleteError ? (
                    <div className={styles.errorBanner}>
                        {store.deleteError}
                    </div>
                ) : null}

                {store.isLoading ? (
                    <div className={styles.stateCard}>
                        Загрузка администраторов...
                    </div>
                ) : null}

                {!store.isLoading && store.loadError ? (
                    <div className={styles.errorBanner}>
                        {store.loadError}
                    </div>
                ) : null}

                {!store.isLoading && !store.loadError ? (
                    <div className={styles.content}>
                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>
                                    Активные администраторы
                                </h2>
                                <span className={styles.counter}>
                                    {store.activeAdmins.length}
                                </span>
                            </div>


                            {store.activeAdmins.length === 0 ? (
                                <div className={styles.emptyCard}>
                                    Пока нет активных администраторов.
                                </div>
                            ) : (
                                <div className={styles.grid}>
                                    {store.activeAdmins.map((admin) => (
                                        <article
                                            key={admin.adminId}
                                            className={styles.card}
                                        >
                                            <div className={styles.cardTop}>
                                                <div>
                                                    <div className={styles.cardTitle}>
                                                        {admin.lastName}{' '}
                                                        {admin.firstName}{' '}
                                                        {admin.middleName ?? ''}
                                                    </div>

                                                    <div className={styles.cardEmail}>
                                                        {admin.email}
                                                    </div>
                                                </div>

                                                <span
                                                    className={
                                                        admin.role === 'super_admin'
                                                            ? styles.roleSuper
                                                            : styles.roleAdmin
                                                    }
                                                >
                                                    {admin.role === 'super_admin'
                                                        ? 'Главный администратор'
                                                        : 'Администратор'}
                                                </span>
                                            </div>

                                            <div className={styles.cardGrid}>
                                                <div className={styles.metaItem}>
                                                    <span className={styles.metaLabel}>
                                                        Дата рождения
                                                    </span>
                                                    <span className={styles.metaValue}>
                                                        {formatDate(
                                                            admin.birthDate,
                                                        )}
                                                    </span>
                                                </div>

                                                <div className={styles.metaItem}>
                                                    <span className={styles.metaLabel}>
                                                        Телефон
                                                    </span>
                                                    <span className={styles.metaValue}>
                                                        {admin.phone || '—'}
                                                    </span>
                                                </div>


                                                <div className={styles.metaItem}>
                                                    <span className={styles.metaLabel}>
                                                        Должность
                                                    </span>
                                                    <span className={styles.metaValue}>
                                                        {admin.position || '—'}
                                                    </span>
                                                </div>

                                                <div className={styles.metaItem}>
                                                    <span className={styles.metaLabel}>
                                                        Отдел
                                                    </span>
                                                    <span className={styles.metaValue}>
                                                        {admin.department || '—'}
                                                    </span>
                                                </div>

                                                <div className={styles.metaItem}>
                                                    <span className={styles.metaLabel}>
                                                        Создан
                                                    </span>
                                                    <span className={styles.metaValue}>
                                                        {formatDate(
                                                            admin.createdAt,
                                                        )}
                                                    </span>
                                                </div>

                                                <div className={styles.metaItem}>
                                                    <span className={styles.metaLabel}>
                                                        Последний вход
                                                    </span>
                                                    <span className={styles.metaValue}>
                                                        {formatDate(
                                                            admin.lastLoginAt,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>


                                            <div className={styles.cardActions}>
                                                {admin.role === 'admin' ? (
                                                    <button
                                                        className={
                                                            styles.secondaryButton
                                                        }
                                                        type="button"
                                                        disabled={
                                                            store.isUpdating ||
                                                            store.deletingAdminId ===
                                                                admin.adminId
                                                        }
                                                        onClick={() =>
                                                            store.openEditModal(
                                                                admin,
                                                            )
                                                        }
                                                    >
                                                        Редактировать
                                                    </button>
                                                ) : null}

                                                <button
                                                    className={styles.dangerButton}
                                                    type="button"
                                                    disabled={
                                                        admin.role ===
                                                        'super_admin' ||
                                                        store.deletingAdminId ===
                                                        admin.adminId
                                                    }
                                                    onClick={() => {
                                                        void store.deleteAdmin(
                                                            admin.adminId,
                                                        );
                                                    }}
                                                >
                                                    {store.deletingAdminId ===
                                                        admin.adminId
                                                        ? 'Удаление...'
                                                        : 'Удалить'}
                                                </button>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                ) : null}

                {store.isCreateModalOpen ? (
                    <div className={styles.overlay}>
                        <div className={styles.modal}>
                            <div className={styles.modalHeader}>
                                <div>
                                    <h2 className={styles.modalTitle}>
                                        Новый администратор
                                    </h2>
                                    <p className={styles.modalSubtitle}>
                                        После создания временный пароль
                                        нужно отправить обычному
                                        администратору по email.
                                    </p>
                                </div>

                                <button
                                    className={styles.modalClose}
                                    type="button"
                                    onClick={() => store.closeCreateModal()}
                                >
                                    Закрыть
                                </button>
                            </div>

                            <div className={styles.formGrid}>
                                <label className={styles.field}>
                                    <span className={styles.fieldLabel}>
                                        Email
                                    </span>
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
                                        placeholder="admin@example.com"
                                        required
                                    />
                                </label>


                                <label className={styles.field}>
                                    <span className={styles.fieldLabel}>
                                        Имя
                                    </span>
                                    <input
                                        className={styles.input}
                                        value={store.form.firstName}
                                        onChange={(event) =>
                                            store.setFormField(
                                                'firstName',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Имя"
                                        required
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span className={styles.fieldLabel}>
                                        Фамилия
                                    </span>
                                    <input
                                        className={styles.input}
                                        value={store.form.lastName}
                                        onChange={(event) =>
                                            store.setFormField(
                                                'lastName',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Фамилия"
                                        required
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span className={styles.fieldLabel}>
                                        Отчество
                                    </span>
                                    <input
                                        className={styles.input}
                                        value={store.form.middleName}
                                        onChange={(event) =>
                                            store.setFormField(
                                                'middleName',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Отчество"
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span className={styles.fieldLabel}>
                                        Дата рождения
                                    </span>
                                    <input
                                        className={styles.input}
                                        type="date"
                                        value={store.form.birthDate}
                                        onChange={(event) =>
                                            store.setFormField(
                                                'birthDate',
                                                event.target.value,
                                            )
                                        }
                                        required
                                    />
                                </label>


                                <label className={styles.field}>
                                    <span className={styles.fieldLabel}>
                                        Телефон
                                    </span>
                                    <input
                                        className={styles.input}
                                        value={store.form.phone}
                                        onChange={(event) =>
                                            store.setFormField(
                                                'phone',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="+7 (900) 000-00-00"
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span className={styles.fieldLabel}>
                                        Должность
                                    </span>
                                    <select
                                        className={`${styles.input} ${styles.inputSelect}`}
                                        value={store.form.position}
                                        onChange={(event) =>
                                            store.setFormField(
                                                'position',
                                                event.target.value,
                                            )
                                        }
                                    >
                                        <option value="">
                                            Не указано
                                        </option>
                                        {ADMIN_POSITION_OPTIONS.map(
                                            (option) => (
                                                <option
                                                    key={option}
                                                    value={option}
                                                >
                                                    {option}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </label>

                                <label className={styles.field}>
                                    <span className={styles.fieldLabel}>
                                        Отдел
                                    </span>
                                    <select
                                        className={`${styles.input} ${styles.inputSelect}`}
                                        value={store.form.department}
                                        onChange={(event) =>
                                            store.setFormField(
                                                'department',
                                                event.target.value,
                                            )
                                        }
                                    >
                                        <option value="">
                                            Не указано
                                        </option>
                                        {ADMIN_DEPARTMENT_OPTIONS.map(
                                            (option) => (
                                                <option
                                                    key={option}
                                                    value={option}
                                                >
                                                    {option}
                                                </option>
                                            ),
                                        )}
                                    </select>
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
                                    Подтверждаю создание аккаунта и
                                    обработку персональных данных
                                    администратора.
                                </span>
                            </label>

                            {store.createError ? (
                                <div className={styles.errorBanner}>
                                    {store.createError}
                                </div>
                            ) : null}


                            {store.createdTemporaryPassword ? (
                                <div className={styles.successBanner}>
                                    Администратор{' '}
                                    {store.recentlyCreatedAdminEmail} создан.
                                    Временный пароль:{' '}
                                    <span className={styles.passwordValue}>
                                        {store.createdTemporaryPassword}
                                    </span>
                                </div>
                            ) : null}

                            <div className={styles.modalActions}>
                                <button
                                    className={styles.secondaryButton}
                                    type="button"
                                    onClick={() => store.closeCreateModal()}
                                >
                                    Отмена
                                </button>

                                <button
                                    className={styles.primaryButton}
                                    type="button"
                                    disabled={!store.canSubmitCreateForm}
                                    onClick={() => {
                                        void store.createAdmin();
                                    }}
                                >
                                    {store.isCreating
                                        ? 'Создание...'
                                        : 'Создать администратора'}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : null}

                {store.isEditModalOpen ? (
                    <div className={styles.overlay}>
                        <div className={styles.modal}>
                            <div className={styles.modalHeader}>
                                <div>
                                    <h2 className={styles.modalTitle}>
                                        Редактирование администратора
                                    </h2>
                                    <p className={styles.modalSubtitle}>
                                        Email аккаунта менять нельзя.
                                        Должность и отдел выбираются из
                                        справочника.
                                    </p>
                                </div>

                                <button
                                    className={styles.modalClose}
                                    type="button"
                                    disabled={store.isUpdating}
                                    onClick={() => store.closeEditModal()}
                                >
                                    Закрыть
                                </button>
                            </div>

                            <label className={styles.field}>
                                <span className={styles.fieldLabel}>
                                    Email
                                </span>
                                <input
                                    className={styles.input}
                                    type="email"
                                    value={store.editingAdminEmail}
                                    readOnly
                                    disabled
                                />
                            </label>

                            <div className={styles.formGrid}>
                                <label className={styles.field}>
                                    <span className={styles.fieldLabel}>
                                        Имя
                                    </span>
                                    <input
                                        className={styles.input}
                                        value={store.editForm.firstName}
                                        onChange={(event) =>
                                            store.setEditFormField(
                                                'firstName',
                                                event.target.value,
                                            )
                                        }
                                        required
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span className={styles.fieldLabel}>
                                        Фамилия
                                    </span>
                                    <input
                                        className={styles.input}
                                        value={store.editForm.lastName}
                                        onChange={(event) =>
                                            store.setEditFormField(
                                                'lastName',
                                                event.target.value,
                                            )
                                        }
                                        required
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span className={styles.fieldLabel}>
                                        Отчество
                                    </span>
                                    <input
                                        className={styles.input}
                                        value={store.editForm.middleName}
                                        onChange={(event) =>
                                            store.setEditFormField(
                                                'middleName',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span className={styles.fieldLabel}>
                                        Дата рождения
                                    </span>
                                    <input
                                        className={styles.input}
                                        type="date"
                                        value={store.editForm.birthDate}
                                        onChange={(event) =>
                                            store.setEditFormField(
                                                'birthDate',
                                                event.target.value,
                                            )
                                        }
                                        required
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span className={styles.fieldLabel}>
                                        Телефон
                                    </span>
                                    <input
                                        className={styles.input}
                                        value={store.editForm.phone}
                                        onChange={(event) =>
                                            store.setEditFormField(
                                                'phone',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span className={styles.fieldLabel}>
                                        Должность
                                    </span>
                                    <select
                                        className={`${styles.input} ${styles.inputSelect}`}
                                        value={store.editForm.position}
                                        onChange={(event) =>
                                            store.setEditFormField(
                                                'position',
                                                event.target.value,
                                            )
                                        }
                                    >
                                        <option value="">
                                            Не указано
                                        </option>
                                        {mergeWithCurrentOption(
                                            ADMIN_POSITION_OPTIONS,
                                            store.editForm.position,
                                        ).map((option) => (
                                            <option
                                                key={option}
                                                value={option}
                                            >
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className={styles.field}>
                                    <span className={styles.fieldLabel}>
                                        Отдел
                                    </span>
                                    <select
                                        className={`${styles.input} ${styles.inputSelect}`}
                                        value={store.editForm.department}
                                        onChange={(event) =>
                                            store.setEditFormField(
                                                'department',
                                                event.target.value,
                                            )
                                        }
                                    >
                                        <option value="">
                                            Не указано
                                        </option>
                                        {mergeWithCurrentOption(
                                            ADMIN_DEPARTMENT_OPTIONS,
                                            store.editForm.department,
                                        ).map((option) => (
                                            <option
                                                key={option}
                                                value={option}
                                            >
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            {store.updateError ? (
                                <div className={styles.errorBanner}>
                                    {store.updateError}
                                </div>
                            ) : null}

                            <div className={styles.modalActions}>
                                <button
                                    className={styles.secondaryButton}
                                    type="button"
                                    disabled={store.isUpdating}
                                    onClick={() => store.closeEditModal()}
                                >
                                    Отмена
                                </button>

                                <button
                                    className={styles.primaryButton}
                                    type="button"
                                    disabled={!store.canSubmitEditForm}
                                    onClick={() => {
                                        void store.updateAdmin();
                                    }}
                                >
                                    {store.isUpdating
                                        ? 'Сохранение...'
                                        : 'Сохранить'}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        );
    },
);