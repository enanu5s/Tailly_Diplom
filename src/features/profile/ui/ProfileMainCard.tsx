//src/features/profile/ui/ProfileMainCard.tsx
import { observer } from 'mobx-react-lite';
import { useEffect, type ChangeEvent, type ReactElement } from 'react';

import { LocalitySuggestInput } from '@/features/specialists-search/ui/LocalitySuggestInput/LocalitySuggestInput';

import { profileStore } from '../model/profileStore';
import styles from './ProfileMainCard.module.css';

type ProfileMainCardMode = 'visitor' | 'owner';

type ProfileMainCardProps = {
  mode?: ProfileMainCardMode;
};

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

export const ProfileMainCard = observer(
  ({ mode = 'owner' }: ProfileMainCardProps): ReactElement => {
    useEffect(() => {
      if (!profileStore.profile && !profileStore.loading) {
        void profileStore.load();
      }
    }, []);

    const profile = profileStore.profile;
    const isEditing = profileStore.editing;
    const isOwnerMode = mode === 'owner';

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

    const cardClassName = [
      styles.card,
      isEditing
        ? styles.cardEdit
        : isOwnerMode
          ? styles.cardOwner
          : styles.cardVisitor,
    ].join(' ');

    return (
      <section className={cardClassName}>
        <div className={styles.headerRow}>
          <h2 className={styles.title}>Основные данные</h2>

          {!isEditing && profile && isOwnerMode ? (
            <button
              className={styles.editBtn}
              type="button"
              aria-label="Редактировать профиль"
              onClick={() => profileStore.startEdit()}
            />
          ) : null}
        </div>

        {profileStore.error ? (
          <div className={styles.error}>{profileStore.error}</div>
        ) : null}

        {profileStore.loading && !profile ? (
          <div className={styles.state}>Загружаем профиль...</div>
        ) : null}

        {profile ? (
          isEditing ? (
            <div className={styles.editContent}>
              <div className={styles.editTopRow}>
                <div className={styles.avatarBlock}>
                  <div className={styles.avatarWrap}>
                    {avatarSrc ? (
                      <img className={styles.avatar} src={avatarSrc} alt={fullName} />
                    ) : (
                      <div className={styles.avatarPlaceholder}>Фото</div>
                    )}
                  </div>

                  <label className={styles.uploadBtn}>
                    Загрузить
                    <input
                      className={styles.fileInput}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>

                <div className={styles.nameFields}>
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
                    value={profileStore.draftLastName}
                    onChange={(event) =>
                      profileStore.setDraftLastName(event.target.value)
                    }
                    placeholder="Фамилия"
                    required
                  />

                  <input
                    className={styles.input}
                    value={profileStore.draftMiddleName}
                    onChange={(event) =>
                      profileStore.setDraftMiddleName(event.target.value)
                    }
                    placeholder="Отчество (не обязательно)"
                  />
                </div>
              </div>

              <div className={styles.editFields}>
                <div className={styles.editFieldRow}>
                  <label className={styles.editLabel} htmlFor="profile-client-city">
                    Город:
                  </label>

                  <LocalitySuggestInput
                    id="profile-client-city"
                    value={profileStore.draftCity}
                    onChange={(next) => profileStore.setDraftCity(next)}
                    placeholder="Город"
                    inputClassName={styles.input}
                    required
                  />
                </div>

                <div className={styles.editFieldRow}>
                  <div className={styles.editLabel}>Район:</div>
                  <div className={styles.inputLike}>—</div>
                </div>

                <div className={styles.editFieldRow}>
                  <label className={styles.editLabel} htmlFor="profile-client-phone">
                    Телефон:
                  </label>

                  <input
                    id="profile-client-phone"
                    className={styles.input}
                    value={profileStore.draftPhone}
                    onChange={(event) =>
                      profileStore.setDraftPhone(event.target.value)
                    }
                    placeholder="+7 ..."
                    required
                  />
                </div>

                <div className={styles.editFieldRow}>
                  <div className={styles.editLabel}>Email:</div>
                  <div className={styles.inputLike}>{profile.email || '—'}</div>
                </div>
              </div>

              {profileStore.saveError ? (
                <div className={styles.error}>{profileStore.saveError}</div>
              ) : null}

              {profileStore.saveSuccess ? (
                <div className={styles.success}>Данные сохранены.</div>
              ) : null}

              <div className={styles.actions}>
                <button
                  className={styles.cancelBtn}
                  type="button"
                  disabled={profileStore.saveLoading}
                  onClick={() => profileStore.cancelEdit()}
                >
                  Отмена
                </button>

                <button
                  className={styles.saveBtn}
                  type="button"
                  disabled={profileStore.saveLoading}
                  onClick={() => void profileStore.save()}
                >
                  {profileStore.saveLoading ? 'Сохраняем...' : 'Сохранить'}
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.viewContent}>
              <div className={styles.avatarWrap}>
                {avatarSrc ? (
                  <img className={styles.avatar} src={avatarSrc} alt={fullName} />
                ) : (
                  <div className={styles.avatarPlaceholder}>Фото</div>
                )}
              </div>

              <div className={styles.viewInfo}>
                <div className={styles.fullName}>{fullName || '—'}</div>

                <div className={styles.metaList}>
                  <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>Город:</span>
                    <span className={styles.metaValue}>{profile.city || '—'}</span>
                  </div>

                  <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>Район:</span>
                    <span className={styles.metaValue}>—</span>
                  </div>

                  {isOwnerMode ? (
                    <>
                      <div className={styles.metaRow}>
                        <span className={styles.metaLabel}>Телефон:</span>
                        <span className={styles.metaValueMuted}>
                          {profile.phone || '—'}
                        </span>
                      </div>

                      <div className={styles.metaRow}>
                        <span className={styles.metaLabel}>Email:</span>
                        <span className={styles.metaValueMuted}>
                          {profile.email || '—'}
                        </span>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          )
        ) : null}
      </section>
    );
  },
);