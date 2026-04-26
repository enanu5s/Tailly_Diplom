// src/features/super-admin-admins-management/ui/SuperAdminAdminsManagementSection.tsx
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import styles from './SuperAdminAdminsManagementSection.module.css';
import {
  ADMIN_DEPARTMENT_OPTIONS,
  mergeWithCurrentOption,
} from '../data/adminOrganizationOptions';
import { superAdminAdminsManagementStore } from '../model/superAdminAdminsManagementStore';

import type { ManagedAdmin } from '../model/types';
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

function formatDateTime(value?: string | null): string {
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

function getFullName(admin: ManagedAdmin): string {
  return [admin.lastName, admin.firstName, admin.middleName].filter(Boolean).join(' ');
}

function getAccessStatusBadge(admin: ManagedAdmin): { label: string; className: string } {
  if (admin.isBlocked) {
    return { label: 'Заблокирован', className: styles.statusBlocked };
  }

  if (admin.passwordAttemptsLockUntil) {
    return { label: 'Лок входа', className: styles.statusPasswordLock };
  }

  return { label: 'Активен', className: styles.statusActive };
}

type AdminMetaProps = {
  label: string;
  value: string;
};

function AdminMeta({ label, value }: AdminMetaProps): ReactElement {
  return (
    <div className={styles.metaLine}>
      <span className={styles.metaLabel}>{label}:</span>
      <span className={styles.metaValue}>{value}</span>
    </div>
  );
}

export const SuperAdminAdminsManagementSection = observer((): ReactElement => {
  const store = superAdminAdminsManagementStore;
  const navigate = useAppNavigate();

  useEffect(() => {
    void store.load();
  }, [store]);

  useEffect(() => {
    if (!store.successMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      store.clearSuccessMessage();
    }, 6000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [store, store.successMessage]);

  return (
    <div className={styles.root}>
      <button
        className={styles.backButton}
        type="button"
        onClick={() => navigate('/admin')}
      >
        <span className={styles.backIcon}>←</span>
        Назад
      </button>

      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Управление администраторами</h1>

        <button
          className={styles.addButton}
          type="button"
          onClick={() => store.openCreateModal()}
        >
          <span className={styles.addIcon}>＋</span>
          Добавить администратора
        </button>
      </div>

      {store.changeError && !store.isBlockModalOpen && !store.isEditModalOpen ? (
        <div className={styles.errorBanner}>{store.changeError}</div>
      ) : null}

      {store.successMessage ? (
        <div className={styles.successBanner}>
          <span>{store.successMessage}</span>
          {store.hasPendingAdminDeletion ? (
            <button
              type="button"
              className={styles.successUndoButton}
              onClick={() => store.undoPendingAdminDeletion()}
            >
              Отменить
            </button>
          ) : null}
        </div>
      ) : null}

      {store.deleteError ? <div className={styles.errorBanner}>{store.deleteError}</div> : null}

      {store.isLoading ? (
        <div className={styles.stateCard}>Загрузка администраторов...</div>
      ) : null}

      {!store.isLoading && store.loadError ? (
        <div className={styles.errorBanner}>{store.loadError}</div>
      ) : null}

      {!store.isLoading && !store.loadError ? (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Активные администраторы: {store.activeAdmins.length}
          </h2>

          {store.activeAdmins.length === 0 ? (
            <div className={styles.emptyCard}>Пока нет активных администраторов.</div>
          ) : (
            <>
              <div className={styles.grid}>
                {store.paginatedActiveAdmins.map((admin) => {
                  const accessBadge = getAccessStatusBadge(admin);

                  return (
                    <article key={admin.adminId} className={styles.card}>
                      <div className={styles.cardDepartment}>
                        Отдел: {admin.department || 'Не указано'}
                      </div>

                      <span className={accessBadge.className}>{accessBadge.label}</span>

                      <h3 className={styles.cardTitle}>{getFullName(admin)}</h3>

                      <div className={styles.cardEmail}>{admin.email}</div>

                      <div className={styles.cardInfo}>
                        <div className={styles.cardInfoColumn}>
                          <AdminMeta label="Дата рождения" value={formatDate(admin.birthDate)} />
                          <AdminMeta label="Телефон" value={admin.phone || '—'} />
                          <AdminMeta label="Создан" value={formatDate(admin.createdAt)} />
                          <AdminMeta
                            label="Последний вход"
                            value={formatDate(admin.lastLoginAt)}
                          />
                        </div>

                        <div className={styles.cardInfoColumn}>
                          <AdminMeta
                            label="Временный лок входа (пароль)"
                            value={formatDateTime(admin.passwordAttemptsLockUntil)}
                          />
                          <AdminMeta
                            label="Блокировка до"
                            value={
                              admin.isPermanentBlock
                                ? 'Навсегда'
                                : formatDateTime(admin.blockedUntil)
                            }
                          />
                          <AdminMeta
                            label="Причина блокировки"
                            value={admin.blockReason || '—'}
                          />
                        </div>
                      </div>

                      <div className={styles.cardActions}>
                        <button
                          className={styles.dangerButton}
                          type="button"
                          disabled={
                            admin.role === 'super_admin' ||
                            store.deletingAdminId === admin.adminId ||
                            store.changingAdminId === admin.adminId
                          }
                          onClick={() => {
                            void store.deleteAdmin(admin);
                          }}
                        >
                          {store.deletingAdminId === admin.adminId ? 'Удаление...' : 'Удалить'}
                        </button>

                        {admin.role === 'admin' ? (
                          admin.isBlocked ? (
                            <button
                              className={styles.outlineButton}
                              type="button"
                              disabled={store.changingAdminId === admin.adminId}
                              onClick={() => {
                                void store.unblockAdmin(admin);
                              }}
                            >
                              {store.changingAdminId === admin.adminId
                                ? 'Сохраняем...'
                                : 'Разблокировать'}
                            </button>
                          ) : (
                            <button
                              className={styles.dangerOutlineButton}
                              type="button"
                              disabled={
                                store.changingAdminId === admin.adminId ||
                                store.deletingAdminId === admin.adminId
                              }
                              onClick={() => store.openBlockModal(admin)}
                            >
                              Заблокировать
                            </button>
                          )
                        ) : null}

                        {admin.role === 'admin' && admin.passwordAttemptsLockUntil ? (
                          <button
                            className={styles.dangerOutlineButton}
                            type="button"
                            disabled={store.changingAdminId === admin.adminId}
                            onClick={() => {
                              void store.clearAdminPasswordLock(admin);
                            }}
                          >
                            {store.changingAdminId === admin.adminId
                              ? 'Сохраняем...'
                              : 'Снять лок'}
                          </button>
                        ) : null}

                        {admin.role === 'admin' ? (
                          <button
                            className={styles.outlineButton}
                            type="button"
                            disabled={
                              store.isUpdating ||
                              store.changingAdminId === admin.adminId ||
                              store.deletingAdminId === admin.adminId
                            }
                            onClick={() => store.openEditModal(admin)}
                          >
                            Редактировать
                          </button>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className={styles.pagination}>
                <button
                  type="button"
                  aria-label="Предыдущая страница"
                  disabled={!store.canGoPrevPage}
                  onClick={() => store.goToPrevPage()}
                >
                  ←
                </button>
                <span>
                  Страница {store.currentPage} из {store.totalPages}
                </span>
                <button
                  type="button"
                  aria-label="Следующая страница"
                  disabled={!store.canGoNextPage}
                  onClick={() => store.goToNextPage()}
                >
                  →
                </button>
              </div>
            </>
          )}
        </section>
      ) : null}

      {store.isCreateModalOpen ? (
        <div className={styles.overlay}>
          <div className={`${styles.modal} ${styles.modalCreate}`}>
            <button
              className={styles.closeButton}
              type="button"
              aria-label="Закрыть"
              onClick={() => store.closeCreateModal()}
            />

            <h2 className={styles.modalTitle}>Добавление нового администратора</h2>

            <div className={styles.modalForm}>
              <label className={`${styles.field} ${styles.fieldEmail}`}>
                <span className={styles.fieldLabel}>Email</span>
                <input
                  className={styles.input}
                  type="email"
                  value={store.form.email}
                  onChange={(event) => store.setFormField('email', event.target.value)}
                  placeholder="admin@tailly.local"
                  required
                />
              </label>

              <label className={`${styles.field} ${styles.fieldFirstName}`}>
                <span className={styles.fieldLabel}>Имя</span>
                <input
                  className={styles.input}
                  value={store.form.firstName}
                  onChange={(event) => store.setFormField('firstName', event.target.value)}
                  placeholder="Введите имя"
                  required
                />
              </label>

              <label className={`${styles.field} ${styles.fieldLastName}`}>
                <span className={styles.fieldLabel}>Фамилия</span>
                <input
                  className={styles.input}
                  value={store.form.lastName}
                  onChange={(event) => store.setFormField('lastName', event.target.value)}
                  placeholder="Введите фамилию"
                  required
                />
              </label>

              <label className={`${styles.field} ${styles.fieldMiddleName}`}>
                <span className={styles.fieldLabel}>Отчество</span>
                <input
                  className={styles.input}
                  value={store.form.middleName}
                  onChange={(event) => store.setFormField('middleName', event.target.value)}
                  placeholder="Введите отчество"
                />
              </label>

              <label className={`${styles.field} ${styles.fieldPhone}`}>
                <span className={styles.fieldLabel}>Телефон</span>
                <input
                  className={styles.input}
                  value={store.form.phone}
                  onChange={(event) => store.setFormField('phone', event.target.value)}
                  placeholder="+7 (900) 000-00-00"
                />
              </label>

              <label className={`${styles.field} ${styles.fieldDepartment}`}>
                <span className={styles.fieldLabel}>Отдел</span>
                <select
                  className={`${styles.input} ${styles.select}`}
                  value={store.form.department}
                  onChange={(event) => store.setFormField('department', event.target.value)}
                >
                  <option value="">Не указано</option>
                  {ADMIN_DEPARTMENT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className={`${styles.field} ${styles.fieldBirthDate}`}>
                <span className={styles.fieldLabel}>День рождения</span>
                <input
                  className={styles.input}
                  type="date"
                  value={store.form.birthDate}
                  onChange={(event) => store.setFormField('birthDate', event.target.value)}
                  required
                />
              </label>
            </div>

            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={store.form.consent}
                onChange={(event) => store.setFormField('consent', event.target.checked)}
              />
              <span>
                Подтверждаю создание аккаунта и обработку персональных данных администратора
              </span>
            </label>

            {store.createError ? (
              <div className={styles.modalError}>{store.createError}</div>
            ) : null}

            {store.createdTemporaryPassword ? (
              <div className={styles.modalSuccess}>
                Администратор {store.recentlyCreatedAdminEmail} создан. Временный пароль:{' '}
                <span>{store.createdTemporaryPassword}</span>
              </div>
            ) : null}

            <div className={styles.modalActions}>
              <button
                className={styles.modalCancelButton}
                type="button"
                onClick={() => store.closeCreateModal()}
              >
                Отмена
              </button>

              <button
                className={styles.modalSubmitButton}
                type="button"
                disabled={!store.canSubmitCreateForm}
                onClick={() => {
                  void store.createAdmin();
                }}
              >
                {store.isCreating ? 'Создание...' : 'Добавить администратора'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {store.isEditModalOpen ? (
        <div className={styles.overlay}>
          <div className={`${styles.modal} ${styles.modalEdit}`}>
            <button
              className={styles.closeButton}
              type="button"
              aria-label="Закрыть"
              disabled={store.isUpdating}
              onClick={() => store.closeEditModal()}
            />

            <h2 className={styles.modalTitle}>Редактирование администратора</h2>

            <div className={styles.modalForm}>
              <label className={`${styles.field} ${styles.fieldEmail}`}>
                <span className={styles.fieldLabel}>Email</span>
                <input
                  className={`${styles.input} ${styles.inputDisabled}`}
                  type="email"
                  value={store.editingAdminEmail}
                  readOnly
                  disabled
                />
              </label>

              <label className={`${styles.field} ${styles.fieldFirstName}`}>
                <span className={styles.fieldLabel}>Имя</span>
                <input
                  className={styles.input}
                  value={store.editForm.firstName}
                  onChange={(event) =>
                    store.setEditFormField('firstName', event.target.value)
                  }
                  required
                />
              </label>

              <label className={`${styles.field} ${styles.fieldLastName}`}>
                <span className={styles.fieldLabel}>Фамилия</span>
                <input
                  className={styles.input}
                  value={store.editForm.lastName}
                  onChange={(event) => store.setEditFormField('lastName', event.target.value)}
                  required
                />
              </label>

              <label className={`${styles.field} ${styles.fieldMiddleName}`}>
                <span className={styles.fieldLabel}>Отчество</span>
                <input
                  className={styles.input}
                  value={store.editForm.middleName}
                  onChange={(event) =>
                    store.setEditFormField('middleName', event.target.value)
                  }
                />
              </label>

              <label className={`${styles.field} ${styles.fieldPhone}`}>
                <span className={styles.fieldLabel}>Телефон</span>
                <input
                  className={styles.input}
                  value={store.editForm.phone}
                  onChange={(event) => store.setEditFormField('phone', event.target.value)}
                />
              </label>

              <label className={`${styles.field} ${styles.fieldDepartment}`}>
                <span className={styles.fieldLabel}>Отдел</span>
                <select
                  className={`${styles.input} ${styles.select}`}
                  value={store.editForm.department}
                  onChange={(event) =>
                    store.setEditFormField('department', event.target.value)
                  }
                >
                  <option value="">Не указано</option>
                  {mergeWithCurrentOption(
                    ADMIN_DEPARTMENT_OPTIONS,
                    store.editForm.department,
                  ).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className={`${styles.field} ${styles.fieldBirthDate}`}>
                <span className={styles.fieldLabel}>День рождения</span>
                <input
                  className={styles.input}
                  type="date"
                  value={store.editForm.birthDate}
                  onChange={(event) =>
                    store.setEditFormField('birthDate', event.target.value)
                  }
                  required
                />
              </label>
            </div>

            {store.updateError ? (
              <div className={styles.modalError}>{store.updateError}</div>
            ) : null}

            <div className={styles.modalActions}>
              <button
                className={styles.modalCancelButton}
                type="button"
                disabled={store.isUpdating}
                onClick={() => store.closeEditModal()}
              >
                Отмена
              </button>

              <button
                className={styles.modalSubmitButton}
                type="button"
                disabled={!store.canSubmitEditForm}
                onClick={() => {
                  void store.updateAdmin();
                }}
              >
                {store.isUpdating ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {store.isBlockModalOpen && store.selectedAdmin ? (
        <div className={styles.overlay}>
          <div className={`${styles.modal} ${styles.modalBlock}`}>
            <button
              className={styles.closeButton}
              type="button"
              aria-label="Закрыть"
              disabled={Boolean(store.changingAdminId)}
              onClick={() => store.closeBlockModal()}
            />

            <h2 className={styles.modalTitle}>Блокировка администратора</h2>

            {store.changeError ? (
              <div className={styles.modalError}>{store.changeError}</div>
            ) : null}

            <div className={styles.blockForm}>
              <label className={`${styles.field} ${styles.blockReasonField}`}>
                <span className={styles.fieldLabel}>Причина блокировки</span>
                <input
                  className={styles.input}
                  value={store.blockReason}
                  onChange={(event) => store.setBlockReason(event.target.value)}
                  placeholder="Например: нарушение регламента"
                />
              </label>

              <div className={styles.blockPeriod}>
                <span className={styles.fieldLabel}>Срок блокировки</span>

                <div className={styles.quickActions}>
                  <button
                    className={
                      store.selectedQuickBlockDays === 1
                        ? styles.quickButtonActive
                        : styles.quickButton
                    }
                    type="button"
                    onClick={() => store.applyQuickBlockPeriod(1)}
                  >
                    На 1 день
                  </button>

                  <button
                    className={
                      store.selectedQuickBlockDays === 7
                        ? styles.quickButtonActive
                        : styles.quickButton
                    }
                    type="button"
                    onClick={() => store.applyQuickBlockPeriod(7)}
                  >
                    На 7 дней
                  </button>

                  <button
                    className={
                      store.selectedQuickBlockDays === 30
                        ? styles.quickButtonActive
                        : styles.quickButton
                    }
                    type="button"
                    onClick={() => store.applyQuickBlockPeriod(30)}
                  >
                    На месяц
                  </button>

                  <button
                    className={
                      store.isPermanentBlock ? styles.quickButtonActive : styles.quickButton
                    }
                    type="button"
                    onClick={() => store.setPermanentBlock(true)}
                  >
                    Навсегда
                  </button>
                </div>
              </div>

              {!store.isPermanentBlock ? (
                <label className={`${styles.field} ${styles.blockUntilField}`}>
                  <span className={styles.fieldLabel}>Дата окончания блокировки</span>
                  <input
                    className={styles.input}
                    type="datetime-local"
                    value={store.blockedUntil}
                    onChange={(event) => store.setBlockedUntil(event.target.value)}
                  />
                </label>
              ) : (
                <label className={`${styles.field} ${styles.blockUntilField}`}>
                  <span className={styles.fieldLabel}>Дата окончания блокировки</span>
                  <div className={styles.blockForeverValue}>Навсегда</div>
                </label>
              )}
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.modalCancelButton}
                type="button"
                disabled={Boolean(store.changingAdminId)}
                onClick={() => store.closeBlockModal()}
              >
                Отмена
              </button>

              <button
                className={styles.modalDangerButton}
                type="button"
                disabled={!store.canSubmitBlock}
                onClick={() => {
                  void store.confirmBlockAdmin();
                }}
              >
                {store.changingAdminId ? 'Сохраняем...' : 'Подтвердить блокировку'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
});