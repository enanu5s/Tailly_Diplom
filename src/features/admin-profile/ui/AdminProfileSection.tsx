// src/features/admin-profile/ui/AdminProfileSection.tsx
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import { adminProfileStore } from '../model/adminProfileStore';

import styles from './AdminProfileSection.module.css';

import type { ReactElement } from 'react';

function formatBirthDate(value?: string): string {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export const AdminProfileSection = observer((): ReactElement => {
  const navigate = useAppNavigate();
  const store = adminProfileStore;

  useEffect(() => {
    if (!store.profile && !store.isLoading) {
      void store.load();
    }
  }, [store]);

  if (store.isLoading) {
    return <div className={styles.stateCard}>Загрузка профиля...</div>;
  }

  if (store.loadError) {
    return <div className={styles.errorBanner}>{store.loadError}</div>;
  }

  if (!store.profile) {
    return (
      <div className={styles.stateCard}>
        Профиль администратора пока недоступен.
      </div>
    );
  }

  const profile = store.profile;
  const isSuperAdmin = store.isSuperAdmin;

  return (
    <div className={styles.root}>
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.badge}>
            {isSuperAdmin ? 'Главный администратор' : 'Администратор'}
          </span>

          <h1 className={styles.title}>Профиль администратора</h1>

          {isSuperAdmin ? (
            <p className={styles.subtitle}>
              Вы можете редактировать ФИО, телефон и дату рождения. Смена email
              выполняется отдельно: сначала укажите новый адрес и пароль от
              аккаунта — на текущую почту придёт код; после ввода кода почта
              обновится. Роль, должность и отдел здесь не меняются.
            </p>
          ) : (
            <p className={styles.subtitle}>
              Здесь можно просматривать и редактировать часть персональных
              данных. Email, дата рождения, роль, должность и отдел заполняются
              системой и в этом разделе не меняются. Должность и отдел назначает
              главный администратор в разделе «Управление администраторами».
            </p>
          )}
        </div>

        <div className={styles.heroActions}>
          {!store.isEditing ? (
            <button
              className={styles.primaryButton}
              type="button"
              onClick={() => store.startEdit()}
            >
              Редактировать профиль
            </button>
          ) : null}

          {isSuperAdmin ? (
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={() => store.openEmailChangeModal()}
            >
              Сменить email
            </button>
          ) : null}

          <button
            className={styles.secondaryButton}
            type="button"
            onClick={() => navigate('/admin/profile/security/password')}
          >
            Сменить пароль
          </button>
        </div>
      </div>

      {!store.isEditing ? (
        <div className={styles.card}>
          <div className={styles.grid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Фамилия</span>
              <span className={styles.value}>{profile.lastName}</span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.label}>Имя</span>
              <span className={styles.value}>{profile.firstName}</span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.label}>Отчество</span>
              <span className={styles.value}>{profile.middleName || '—'}</span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.label}>Email</span>
              <span className={styles.value}>{profile.email}</span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.label}>Телефон</span>
              <span className={styles.value}>{profile.phone || '—'}</span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.label}>Дата рождения</span>
              <span className={styles.value}>
                {formatBirthDate(profile.birthDate)}
              </span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.label}>Должность</span>
              <span className={styles.value}>{profile.position || '—'}</span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.label}>Отдел</span>
              <span className={styles.value}>{profile.department || '—'}</span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.label}>Роль</span>
              <span className={styles.value}>
                {isSuperAdmin ? 'Главный администратор' : 'Администратор'}
              </span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.label}>ID администратора</span>
              <span className={styles.value}>{profile.adminId}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.card}>
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Фамилия</span>
              <input
                className={styles.input}
                value={store.form.lastName}
                onChange={(event) =>
                  store.setFormField('lastName', event.target.value)
                }
                placeholder="Фамилия"
                required
              />
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Имя</span>
              <input
                className={styles.input}
                value={store.form.firstName}
                onChange={(event) =>
                  store.setFormField('firstName', event.target.value)
                }
                placeholder="Имя"
                required
              />
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Отчество</span>
              <input
                className={styles.input}
                value={store.form.middleName}
                onChange={(event) =>
                  store.setFormField('middleName', event.target.value)
                }
                placeholder="Отчество"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Телефон</span>
              <input
                className={styles.input}
                value={store.form.phone}
                onChange={(event) =>
                  store.setFormField('phone', event.target.value)
                }
                placeholder="+7 (900) 000-00-00"
              />
            </label>

            {isSuperAdmin ? (
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Дата рождения</span>
                <input
                  className={styles.input}
                  type="date"
                  value={store.form.birthDate}
                  onChange={(event) =>
                    store.setFormField('birthDate', event.target.value)
                  }
                  required
                />
              </label>
            ) : null}
          </div>

          {store.saveError ? (
            <div className={styles.errorBanner}>{store.saveError}</div>
          ) : null}

          <div className={styles.actions}>
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={() => store.cancelEdit()}
              disabled={store.isSaving}
            >
              Отмена
            </button>

            <button
              className={styles.primaryButton}
              type="button"
              onClick={() => {
                void store.save();
              }}
              disabled={!store.canSubmit}
            >
              {store.isSaving ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </div>
      )}

      {store.isEmailChangeModalOpen ? (
        <div className={styles.overlay}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="email-change-title"
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle} id="email-change-title">
                Смена email
              </h2>
              <button
                className={styles.modalClose}
                type="button"
                onClick={() => store.closeEmailChangeModal()}
              >
                Закрыть
              </button>
            </div>

            {store.emailChangePhase === 'credentials' ? (
              <>
                <p className={styles.modalLead}>
                  Текущий адрес:{' '}
                  <strong className={styles.modalEmphasis}>
                    {profile.email}
                  </strong>
                  . После проверки пароля на эту почту будет отправлен код.
                  Новый адрес вступит в силу только после ввода кода.
                </p>

                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Новый email</span>
                  <input
                    className={styles.input}
                    type="email"
                    autoComplete="off"
                    value={store.emailChangeNewEmail}
                    onChange={(event) =>
                      store.setEmailChangeField('newEmail', event.target.value)
                    }
                    placeholder="new@example.com"
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Пароль от аккаунта</span>
                  <input
                    className={styles.input}
                    type="password"
                    autoComplete="current-password"
                    value={store.emailChangePassword}
                    onChange={(event) =>
                      store.setEmailChangeField(
                        'password',
                        event.target.value,
                      )
                    }
                  />
                </label>
              </>
            ) : (
              <>
                <p className={styles.modalLead}>
                  Введите код из письма, отправленного на{' '}
                  <strong className={styles.modalEmphasis}>
                    {profile.email}
                  </strong>
                  .
                </p>

                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Код подтверждения</span>
                  <input
                    className={styles.input}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={store.emailChangeCode}
                    onChange={(event) =>
                      store.setEmailChangeField('code', event.target.value)
                    }
                    placeholder="000000"
                  />
                </label>

                <button
                  className={styles.linkButton}
                  type="button"
                  disabled={
                    store.isRequestingEmailChange || store.isConfirmingEmailChange
                  }
                  onClick={() => store.backEmailChangeToCredentials()}
                >
                  Указать другой email и запросить код заново
                </button>
              </>
            )}

            {store.emailChangeInfoMessage ? (
              <div className={styles.infoBanner}>
                {store.emailChangeInfoMessage}
              </div>
            ) : null}

            {store.emailChangeMockHint ? (
              <div className={styles.mockHintBanner}>
                Демо-режим: код из «письма» —{' '}
                <span className={styles.mockHintCode}>
                  {store.emailChangeMockHint}
                </span>
              </div>
            ) : null}

            {store.emailChangeError ? (
              <div className={styles.errorBanner}>{store.emailChangeError}</div>
            ) : null}

            <div className={styles.modalActions}>
              {store.emailChangePhase === 'credentials' ? (
                <>
                  <button
                    className={styles.secondaryButton}
                    type="button"
                    disabled={store.isRequestingEmailChange}
                    onClick={() => store.closeEmailChangeModal()}
                  >
                    Отмена
                  </button>
                  <button
                    className={styles.primaryButton}
                    type="button"
                    disabled={!store.canSubmitEmailChangeRequest}
                    onClick={() => {
                      void store.requestSuperAdminEmailChange();
                    }}
                  >
                    {store.isRequestingEmailChange
                      ? 'Отправка...'
                      : 'Отправить код'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={styles.secondaryButton}
                    type="button"
                    disabled={store.isConfirmingEmailChange}
                    onClick={() => store.closeEmailChangeModal()}
                  >
                    Отмена
                  </button>
                  <button
                    className={styles.primaryButton}
                    type="button"
                    disabled={!store.canSubmitEmailChangeConfirm}
                    onClick={() => {
                      void store.confirmSuperAdminEmailChange();
                    }}
                  >
                    {store.isConfirmingEmailChange
                      ? 'Проверка...'
                      : 'Подтвердить смену email'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
});
