//src/features/profile/ui/ProfileMainCard.tsx

import { observer } from 'mobx-react-lite';
import { useEffect, type ChangeEvent, type ReactElement } from 'react';
import { Link } from 'react-router-dom';

import styles from './ProfileMainCard.module.css';
import { profileStore } from '../model/profileStore';


function buildFullName(params: {
  lastName?: string;
  firstName?: string;
  middleName?: string;
}): string {
  return [params.lastName, params.firstName, params.middleName]
    .map((part) => (part ?? '').trim())
    .filter(Boolean)
    .join(' ')
    .trim();
}

export const ProfileMainCard = observer((): ReactElement => {
  useEffect(() => {
    if (!profileStore.profile && !profileStore.loading) {
      void profileStore.load();
    }
  }, []);

  const profile = profileStore.profile;
  const isEditing = profileStore.editing;

  const avatarSrc = isEditing
    ? profileStore.draftAvatarUrl.trim()
    : (profile?.avatarUrl ?? '').trim();

  const fullName = isEditing
    ? buildFullName({
        lastName: profileStore.draftLastName,
        firstName: profileStore.draftFirstName,
        middleName: profileStore.draftMiddleName,
      }) || 'Профиль'
    : buildFullName({
        lastName: profile?.lastName,
        firstName: profile?.firstName,
        middleName: profile?.middleName,
      }) || 'Профиль';

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    profileStore.setAvatarFromFile(file);
    event.target.value = '';
  };

  return (
    <section className={styles.card}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>Основные данные</h2>

        {!isEditing && profile ? (
          <button
            className={styles.secondaryBtn}
            type="button"
            onClick={() => profileStore.startEdit()}
          >
            Редактировать
          </button>
        ) : null}
      </div>

      {profileStore.error ? (
        <div className={styles.error}>{profileStore.error}</div>
      ) : null}

      {profileStore.loading && !profile ? (
        <div className={styles.state}>Загружаем профиль...</div>
      ) : null}

      {profile ? (
        <div className={styles.grid}>
          <div className={styles.avatarCol}>
            <div className={styles.avatarWrap}>
              {avatarSrc ? (
                <img
                  className={styles.avatar}
                  src={avatarSrc}
                  alt={fullName}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>Фото</div>
              )}
            </div>

            <div className={styles.fullName}>{fullName}</div>

            {isEditing ? (
              <div className={styles.fieldActions}>
                <label className={styles.secondaryBtn}>
                  Изменить фото
                  <input
                    className={styles.fileInput}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
            ) : null}

            <div className={styles.note}>
              Данные профиля клиента используются в заказах и при общении со
              специалистами.
            </div>
          </div>

          <div className={styles.fieldsCol}>
            <div>
              <div className={styles.label}>ФИО</div>

              {isEditing ? (
                <div className={styles.nameRow}>
                  <input
                    className={styles.input}
                    value={profileStore.draftLastName}
                    onChange={(event) =>
                      profileStore.setDraftLastName(event.target.value)
                    }
                    placeholder="Фамилия"
                    required
                  />

                  <input
                    className={styles.input}
                    value={profileStore.draftFirstName}
                    onChange={(event) =>
                      profileStore.setDraftFirstName(event.target.value)
                    }
                    placeholder="Имя"
                    required
                  />

                  <input
                    className={styles.input}
                    value={profileStore.draftMiddleName}
                    onChange={(event) =>
                      profileStore.setDraftMiddleName(event.target.value)
                    }
                    placeholder="Отчество"
                  />
                </div>
              ) : (
                <div className={styles.value}>{fullName || '—'}</div>
              )}
            </div>

            <div>
              <div className={styles.label}>Город</div>

              {isEditing ? (
                <input
                  className={styles.input}
                  value={profileStore.draftCity}
                  onChange={(event) =>
                    profileStore.setDraftCity(event.target.value)
                  }
                  placeholder="Введите город"
                  required
                />
              ) : (
                <div className={styles.value}>{profile.city || '—'}</div>
              )}
            </div>

            <div>
              <div className={styles.label}>Телефон</div>

              {isEditing ? (
                <input
                  className={styles.input}
                  value={profileStore.draftPhone}
                  onChange={(event) =>
                    profileStore.setDraftPhone(event.target.value)
                  }
                  placeholder="+7 ..."
                  required
                />
              ) : (
                <div className={styles.value}>{profile.phone || '—'}</div>
              )}
            </div>

            <div>
              <div className={styles.label}>Почта</div>
              <div className={styles.value}>{profile.email || '—'}</div>
              <div className={styles.muted}>Нужен код подтверждения.</div>
            </div>

            <div>
              <div className={styles.label}>Пароль</div>
              <div className={styles.value}>••••••••</div>
              <div className={styles.muted}>
                Смена пароля находится в разделе безопасности.
              </div>
            </div>

            <div className={styles.securityBtns}>
              <Link className={styles.secondaryBtn} to="/profile/security/email">
                Сменить почту
              </Link>

              <Link
                className={styles.secondaryBtn}
                to="/profile/security/password"
              >
                Сменить пароль
              </Link>

              <Link className={styles.dangerLink} to="/account/delete">
                Удалить аккаунт
              </Link>
            </div>

            {isEditing ? (
              <div className={styles.actions}>
                {profileStore.saveError ? (
                  <div className={styles.error}>{profileStore.saveError}</div>
                ) : null}

                {profileStore.saveSuccess ? (
                  <div className={styles.success}>Данные сохранены.</div>
                ) : null}

                <button
                  className={styles.primaryBtn}
                  type="button"
                  disabled={profileStore.saveLoading}
                  onClick={() => void profileStore.save()}
                >
                  {profileStore.saveLoading ? 'Сохраняем...' : 'Сохранить'}
                </button>

                <button
                  className={styles.secondaryBtn}
                  type="button"
                  disabled={profileStore.saveLoading}
                  onClick={() => profileStore.cancelEdit()}
                >
                  Отмена
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
});