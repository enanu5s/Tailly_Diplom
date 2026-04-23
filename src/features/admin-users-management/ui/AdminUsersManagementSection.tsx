// src/features/admin-users-management/ui/AdminUsersManagementSection.tsx

import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';

import styles from './AdminUsersManagementSection.module.css';
import { adminUsersManagementStore } from '../model/adminUsersManagementStore';

import type { ReactElement } from 'react';

function getRoleLabel(role: 'client' | 'specialist'): string {
  return role === 'client' ? 'Клиент' : 'Специалист';
}

function userRowKey(user: { id: string; role: string }): string {
  return `${user.id}:${user.role}`;
}

function getFullName(
  lastName?: string,
  firstName?: string,
  middleName?: string,
  fallback?: string,
): string {
  const value = [lastName, firstName, middleName].filter(Boolean).join(' ').trim();

  return value || fallback || 'Без имени';
}

function formatDateTime(value?: string): string {
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

export const AdminUsersManagementSection = observer((): ReactElement => {
  const store = adminUsersManagementStore;

  useEffect(() => {
    void store.load();
  }, [store]);

  return (
    <div className={styles.root}>
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.badge}>Администрирование пользователей</span>

          <h1 className={styles.title}>Управление пользователями</h1>

          <p className={styles.subtitle}>
            Здесь можно просматривать клиентов и специалистов, искать пользователей по
            данным аккаунта, править ФИО и (для специалистов) публичный slug профиля,
            управлять блокировкой с указанием причины и срока, а также восстанавливать
            аккаунты в период отложенного удаления (30 дней). Email и роль меняются только
            через отдельные процедуры.
          </p>
        </div>

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{store.clientsCount}</span>
            <span className={styles.statLabel}>Клиенты</span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statValue}>{store.specialistsCount}</span>
            <span className={styles.statLabel}>Специалисты</span>
          </div>
        </div>
      </div>

      <div className={styles.filtersCard}>
        <div className={styles.filtersGrid}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Поиск</span>

            <input
              className={styles.input}
              value={store.search}
              onChange={(event) => store.setSearch(event.target.value)}
              placeholder="Имя, email или slug специалиста"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Роль</span>

            <select
              className={styles.select}
              value={store.roleFilter}
              onChange={(event) =>
                store.setRoleFilter(event.target.value as 'all' | 'client' | 'specialist')
              }
            >
              <option value="all">Все</option>
              <option value="client">Клиенты</option>
              <option value="specialist">Специалисты</option>
            </select>
          </label>
        </div>
      </div>

      {store.changeError && !store.isEditModalOpen ? (
        <div className={styles.errorBanner}>{store.changeError}</div>
      ) : null}

      {store.successMessage ? (
        <div className={styles.successBanner}>{store.successMessage}</div>
      ) : null}

      {store.isLoading ? (
        <div className={styles.stateCard}>Загрузка пользователей...</div>
      ) : null}

      {!store.isLoading && store.loadError ? (
        <div className={styles.errorBanner}>{store.loadError}</div>
      ) : null}

      {!store.isLoading && !store.loadError ? (
        <>
          {store.filteredUsers.length === 0 ? (
            <div className={styles.emptyCard}>
              Пользователи по текущим фильтрам не найдены.
            </div>
          ) : (
            <div className={styles.grid}>
              {store.filteredUsers.map((user) => (
                <article key={userRowKey(user)} className={styles.card}>
                  <div className={styles.cardTop}>
                    <div>
                      <div className={styles.cardTitle}>
                        {getFullName(
                          user.lastName,
                          user.firstName,
                          user.middleName,
                          user.name,
                        )}
                      </div>

                      <div className={styles.cardEmail}>{user.email}</div>
                    </div>

                    <div className={styles.badges}>
                      <span
                        className={
                          user.role === 'specialist'
                            ? styles.roleSpecialist
                            : styles.roleClient
                        }
                      >
                        {getRoleLabel(user.role)}
                      </span>

                      <span
                        className={
                          user.isScheduledForDeletion
                            ? styles.statusDeletionPending
                            : user.isBlocked
                              ? styles.statusBlocked
                              : styles.statusActive
                        }
                      >
                        {user.isScheduledForDeletion
                          ? 'К удалению'
                          : user.isBlocked
                            ? 'Заблокирован'
                            : 'Активен'}
                      </span>
                    </div>
                  </div>

                  <div className={styles.metaGrid}>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>ID пользователя</span>
                      <span className={styles.metaValue}>{user.id}</span>
                    </div>

                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Роль</span>
                      <span className={styles.metaValue}>{getRoleLabel(user.role)}</span>
                    </div>

                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>ID специалиста</span>
                      <span className={styles.metaValue}>{user.specialistId || '—'}</span>
                    </div>

                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Slug специалиста</span>
                      <span className={styles.metaValue}>
                        {user.specialistSlug || '—'}
                      </span>
                    </div>

                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Причина блокировки</span>
                      <span className={styles.metaValue}>{user.blockReason || '—'}</span>
                    </div>

                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Блокировка до</span>
                      <span className={styles.metaValue}>
                        {user.isPermanentBlock
                          ? 'Навсегда'
                          : formatDateTime(user.blockedUntil)}
                      </span>
                    </div>

                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Окончательное удаление</span>
                      <span className={styles.metaValue}>
                        {user.isScheduledForDeletion
                          ? formatDateTime(user.scheduledDeletionDeadline)
                          : '—'}
                      </span>
                    </div>
                  </div>

                  <div className={styles.cardActions}>
                    <button
                      className={styles.editButton}
                      type="button"
                      disabled={
                        store.changingUserKey === userRowKey(user) ||
                        store.editingUserKey === userRowKey(user)
                      }
                      onClick={() => store.openEditModal(user)}
                    >
                      Редактировать
                    </button>

                    <div className={styles.cardActionsRisk}>
                      {user.isScheduledForDeletion ? (
                        <button
                          className={styles.secondaryButton}
                          type="button"
                          disabled={store.changingUserKey === userRowKey(user)}
                          onClick={() => {
                            void store.restoreUserFromScheduledDeletion(user);
                          }}
                        >
                          {store.changingUserKey === userRowKey(user)
                            ? 'Сохраняем...'
                            : 'Восстановить аккаунт'}
                        </button>
                      ) : null}

                      {user.isBlocked ? (
                        <button
                          className={styles.secondaryButton}
                          type="button"
                          disabled={store.changingUserKey === userRowKey(user)}
                          onClick={() => {
                            void store.unblockUser(user);
                          }}
                        >
                          {store.changingUserKey === userRowKey(user)
                            ? 'Сохраняем...'
                            : 'Разблокировать'}
                        </button>
                      ) : (
                        <button
                          className={styles.dangerButton}
                          type="button"
                          disabled={
                            store.changingUserKey === userRowKey(user) ||
                            user.isScheduledForDeletion
                          }
                          onClick={() => store.openBlockModal(user)}
                        >
                          Заблокировать
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      ) : null}

      {store.isEditModalOpen && store.editTargetUser ? (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>Редактирование пользователя</h2>

                <p className={styles.modalSubtitle}>{store.editTargetUser.email}</p>

                <p className={styles.modalHint}>
                  Роль: {getRoleLabel(store.editTargetUser.role)}. Почту здесь изменить
                  нельзя.
                </p>
              </div>

              <button
                className={styles.modalClose}
                type="button"
                onClick={() => store.closeEditModal()}
              >
                Закрыть
              </button>
            </div>

            {store.changeError ? (
              <div className={styles.errorBanner}>{store.changeError}</div>
            ) : null}

            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Фамилия</span>

                <input
                  className={styles.input}
                  value={store.editLastName}
                  onChange={(event) => store.setEditLastName(event.target.value)}
                  placeholder="Фамилия"
                />
              </label>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Имя</span>

                <input
                  className={styles.input}
                  value={store.editFirstName}
                  onChange={(event) => store.setEditFirstName(event.target.value)}
                  placeholder="Имя"
                />
              </label>

              <label className={styles.fieldWide}>
                <span className={styles.fieldLabel}>Отчество</span>

                <input
                  className={styles.input}
                  value={store.editMiddleName}
                  onChange={(event) => store.setEditMiddleName(event.target.value)}
                  placeholder="Необязательно"
                />
              </label>

              {store.editTargetUser.role === 'specialist' ? (
                <label className={styles.fieldWide}>
                  <span className={styles.fieldLabel}>Slug профиля специалиста</span>

                  <input
                    className={styles.input}
                    value={store.editSpecialistSlug}
                    onChange={(event) => store.setEditSpecialistSlug(event.target.value)}
                    placeholder="например, maria-ivanova"
                    autoComplete="off"
                  />

                  <span className={styles.fieldHelp}>
                    Латиница в нижнем регистре, цифры и дефисы. Используется в URL
                    публичной страницы специалиста.
                  </span>
                </label>
              ) : null}
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.secondaryButton}
                type="button"
                onClick={() => store.closeEditModal()}
                disabled={Boolean(store.editingUserKey)}
              >
                Отмена
              </button>

              <button
                className={styles.primaryButton}
                type="button"
                onClick={() => {
                  void store.saveEditedProfile();
                }}
                disabled={!store.canSubmitEdit}
              >
                {store.editingUserKey ? 'Сохраняем...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {store.isBlockModalOpen && store.selectedUser ? (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>Блокировка пользователя</h2>

                <p className={styles.modalSubtitle}>{store.selectedUser.email}</p>
                <p className={styles.modalHint}>
                  Блокируется роль: {getRoleLabel(store.selectedUser.role)}.
                </p>
              </div>

              <button
                className={styles.modalClose}
                type="button"
                onClick={() => store.closeBlockModal()}
              >
                Закрыть
              </button>
            </div>

            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Причина блокировки</span>

                <input
                  className={styles.input}
                  value={store.blockReason}
                  onChange={(event) => store.setBlockReason(event.target.value)}
                  placeholder="Например: нарушение правил сервиса"
                />
              </label>

              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={store.isPermanentBlock}
                  onChange={(event) => store.setPermanentBlock(event.target.checked)}
                />
                <span>Заблокировать навсегда</span>
              </label>
            </div>

            {!store.isPermanentBlock ? (
              <>
                <div className={styles.quickActions}>
                  <button
                    className={styles.quickButton}
                    type="button"
                    onClick={() => store.applyQuickBlockPeriod(1)}
                  >
                    На 1 день
                  </button>

                  <button
                    className={styles.quickButton}
                    type="button"
                    onClick={() => store.applyQuickBlockPeriod(7)}
                  >
                    На 7 дней
                  </button>

                  <button
                    className={styles.quickButton}
                    type="button"
                    onClick={() => store.applyQuickBlockPeriod(30)}
                  >
                    На месяц
                  </button>
                </div>

                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Дата и время окончания</span>

                  <input
                    className={styles.input}
                    type="datetime-local"
                    value={store.blockedUntil}
                    onChange={(event) => store.setBlockedUntil(event.target.value)}
                  />
                </label>
              </>
            ) : null}

            <div className={styles.modalActions}>
              <button
                className={styles.secondaryButton}
                type="button"
                onClick={() => store.closeBlockModal()}
                disabled={Boolean(store.changingUserKey)}
              >
                Отмена
              </button>

              <button
                className={styles.dangerButton}
                type="button"
                onClick={() => {
                  void store.confirmBlock();
                }}
                disabled={!store.canSubmitBlock}
              >
                {store.changingUserKey ? 'Сохраняем...' : 'Подтвердить блокировку'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
});
