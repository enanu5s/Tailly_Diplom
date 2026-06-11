// src/features/admin-profile/ui/AdminProfileSection.tsx
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';

import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import { adminProfileStore } from '../model/adminProfileStore';
import styles from './AdminProfileSection.module.css';

import type { ReactElement } from 'react';

function formatBirthDate(value?: string): string {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function formatDateTime(value?: string | null): string {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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
      <div className={styles.stateCard}>Профиль администратора пока недоступен.</div>
    );
  }

  const profile = store.profile;
  const isSuperAdmin = store.isSuperAdmin;

  const fullName = [profile.lastName, profile.firstName, profile.middleName]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.root}>
      <button className={styles.backButton} type="button" onClick={() => navigate(-1)}>
        <span className={styles.backIcon}>←</span>
        Назад
      </button>

      <h1 className={styles.title}>Профиль администратора</h1>

      <div className={styles.profileLayout}>
        <img
          className={styles.leftImage}
          src="/images/admin-profile/admin-profile-left.png"
          alt=""
          aria-hidden="true"
        />

        {!store.isEditing ? (
          <div className={styles.profileColumn}>
            <section className={styles.profileCard}>
              <div className={styles.cardTop}>
                <span className={styles.department}>
                  Отдел: {profile.department || 'Администрация'}
                </span>
                <span className={styles.email}>{profile.email}</span>
              </div>

              <h2 className={styles.name}>
                {[profile.lastName, profile.firstName, profile.middleName]
                  .filter(Boolean)
                  .map((part, i) => (
                    <span key={i} style={{ display: 'block' }}>{part}</span>
                  ))}
              </h2>
              
              <div className={styles.meta}>
                <p>
                  <span>Телефон:</span> <strong>{profile.phone || '—'}</strong>
                </p>
                <p>
                  <span>Дата рождения:</span>{' '}
                  <strong>{formatBirthDate(profile.birthDate)}</strong>
                </p>
              </div>

              {!store.isEditing ? (
                <button
                  className={styles.primaryButton}
                  type="button"
                  onClick={() => store.startEdit()}
                >
                  Редактировать профиль
                </button>
              ) : null}
            </section>

            <div className={styles.securityActions}>
              {isSuperAdmin ? (
                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={() => {
                    store.initSuperAdminEmailChangeFlow();
                    navigate('/admin/profile/security/email');
                  }}
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
        ) : (
          <section className={styles.editCard}>
            <div className={styles.editCardTop}>
              <span className={styles.department}>
                Отдел: {profile.department || 'Администрация'}
              </span>
              <span className={styles.email}>{profile.email}</span>
            </div>

            <div className={styles.editNameGrid}>
              <input
                className={`${styles.input} ${styles.nameInput} ${styles.lastNameInput}`}
                value={store.form.lastName}
                onChange={(event) => store.setFormField('lastName', event.target.value)}
                placeholder="Фамилия"
                required
              />

              <input
                className={`${styles.input} ${styles.nameInput} ${styles.firstNameInput}`}
                value={store.form.firstName}
                onChange={(event) => store.setFormField('firstName', event.target.value)}
                placeholder="Имя"
                required
              />

              <input
                className={`${styles.input} ${styles.nameInput} ${styles.middleNameInput}`}
                value={store.form.middleName}
                onChange={(event) => store.setFormField('middleName', event.target.value)}
                placeholder="Отчество"
              />
            </div>

            <div className={styles.editRow}>
              <span className={styles.editLabel}>Телефон:</span>
              <input
                className={`${styles.input} ${styles.smallInput}`}
                value={store.form.phone}
                onChange={(event) => store.setFormField('phone', event.target.value)}
                placeholder="+7 (900) 000-00-00"
              />
            </div>

            {isSuperAdmin ? (
              <div className={styles.editRow}>
                <span className={styles.editLabel}>Дата рождения:</span>
                <input
                  className={`${styles.input} ${styles.smallInput}`}
                  type="date"
                  value={store.form.birthDate}
                  onChange={(event) =>
                    store.setFormField('birthDate', event.target.value)
                  }
                  required
                />
              </div>
            ) : null}

            {store.saveError ? (
              <div className={styles.errorBanner}>{store.saveError}</div>
            ) : null}

            <div className={styles.editActions}>
              <button
                className={styles.saveButton}
                type="button"
                onClick={() => {
                  void store.save();
                }}
                disabled={!store.canSubmit}
              >
                {store.isSaving ? 'Сохранение...' : 'Сохранить'}
              </button>

              <button
                className={styles.cancelEditButton}
                type="button"
                onClick={() => store.cancelEdit()}
                disabled={store.isSaving}
              >
                Отмена
              </button>
            </div>
          </section>
        )}

        <img
          className={styles.rightImage}
          src="/images/admin-profile/admin-profile-right.png"
          alt=""
          aria-hidden="true"
        />
      </div>

      {isSuperAdmin && profile.loginSecurity ? (
        <div className={styles.loginSecurityStack}>
          {profile.loginSecurity.isManuallyBlocked ? (
            <div className={styles.errorBanner}>
              Вход в аккаунт заблокирован администратором. Причина:{' '}
              <strong>{profile.loginSecurity.blockReason || 'не указана'}</strong>.{' '}
              {profile.loginSecurity.isPermanentBlock ? (
                <>Срок: без ограничения по времени.</>
              ) : (
                <>
                  Блокировка до:{' '}
                  <strong>{formatDateTime(profile.loginSecurity.blockedUntil)}</strong>.
                </>
              )}
            </div>
          ) : null}

          {profile.loginSecurity.passwordAttemptsLockUntil ? (
            <div className={styles.warningBanner}>
              <p className={styles.warningBannerText}>
                Вход временно заблокирован из-за превышения лимита неверных попыток ввода
                пароля. Доступ будет восстановлен после{' '}
                <strong>
                  {formatDateTime(profile.loginSecurity.passwordAttemptsLockUntil)}
                </strong>
                . Неудачных попыток подряд:{' '}
                <strong>{profile.loginSecurity.failedPasswordAttempts}</strong>.
              </p>

              <div className={styles.passwordLockActions}>
                <button
                  className={styles.secondaryButton}
                  type="button"
                  disabled={store.isClearingPasswordLock}
                  onClick={() => {
                    void store.clearPasswordAttemptsLock();
                  }}
                >
                  {store.isClearingPasswordLock
                    ? 'Снимаем...'
                    : 'Снять временный лок входа'}
                </button>
              </div>

              {store.passwordLockClearError ? (
                <div className={styles.passwordLockError}>
                  {store.passwordLockClearError}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

    </div>
  );
});
