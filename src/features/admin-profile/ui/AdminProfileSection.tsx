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

  return (
    <div className={styles.root}>
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.badge}>
            {profile.role === 'super_admin'
              ? 'Главный администратор'
              : 'Администратор'}
          </span>

          <h1 className={styles.title}>Профиль администратора</h1>

          <p className={styles.subtitle}>
            Здесь можно просматривать и редактировать персональные данные
            администратора. Email, дата рождения и роль заполняются системой и
            не редактируются в этом разделе.
          </p>
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

          <button
            className={styles.secondaryButton}
            type="button"
            onClick={() => navigate('/profile/security/password')}
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
                {profile.role === 'super_admin'
                  ? 'Главный администратор'
                  : 'Администратор'}
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

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Должность</span>
              <input
                className={styles.input}
                value={store.form.position}
                onChange={(event) =>
                  store.setFormField('position', event.target.value)
                }
                placeholder="Администратор поддержки"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Отдел</span>
              <input
                className={styles.input}
                value={store.form.department}
                onChange={(event) =>
                  store.setFormField('department', event.target.value)
                }
                placeholder="Поддержка"
              />
            </label>
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
    </div>
  );
});