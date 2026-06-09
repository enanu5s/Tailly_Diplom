//src/features/profile/ui/ProfileMainCard.tsx
import { observer } from 'mobx-react-lite';
import { useEffect, useState, type ChangeEvent, type ReactElement } from 'react';
import { Link } from 'react-router-dom';

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
    const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);

    useEffect(() => {
      if (!profileStore.profile && !profileStore.loading) {
        void profileStore.load();
      }
    }, []);

    useEffect(() => {
      if (!profileStore.editing) {
        setIsDeleteAccountModalOpen(false);
      }
    }, [profileStore.editing]);

    useEffect(() => {
      if (!isDeleteAccountModalOpen) {
        return;
      }

      const onKeyDown = (event: KeyboardEvent): void => {
        if (event.key === 'Escape') {
          setIsDeleteAccountModalOpen(false);
        }
      };

      window.addEventListener('keydown', onKeyDown);

      return () => {
        window.removeEventListener('keydown', onKeyDown);
      };
    }, [isDeleteAccountModalOpen]);

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
      <>
        <section className={cardClassName}>
          <div className={styles.headerRow}>
            <h2 className={styles.title}>Основные данные</h2>

            {!isEditing && profile && isOwnerMode ? (
              <button
                className={styles.editBtn}
                type="button"
                aria-label="Редактировать профиль"
                onClick={() => profileStore.startEdit()}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 28 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M24.7089 8.18027L19.8209 3.2923C19.6788 3.15009 19.5099 3.03729 19.3242 2.96032C19.1384 2.88336 18.9392 2.84375 18.7381 2.84375C18.537 2.84375 18.3379 2.88336 18.1521 2.96032C17.9663 3.03729 17.7975 3.15009 17.6553 3.2923L4.16719 16.7793C4.02471 16.9213 3.91174 17.0901 3.83477 17.2759C3.75781 17.4618 3.71838 17.661 3.71875 17.8621V22.7501C3.71875 23.1562 3.88008 23.5457 4.16725 23.8329C4.45441 24.12 4.84389 24.2814 5.25 24.2814H23.625C23.7991 24.2814 23.966 24.2122 24.089 24.0891C24.2121 23.9661 24.2813 23.7992 24.2813 23.6251C24.2813 23.4511 24.2121 23.2841 24.089 23.1611C23.966 23.038 23.7991 22.9689 23.625 22.9689H12.0848L24.7089 10.3459C24.8511 10.2037 24.9639 10.0349 25.0409 9.8491C25.1178 9.66331 25.1575 9.46418 25.1575 9.26308C25.1575 9.06198 25.1178 8.86285 25.0409 8.67706C24.9639 8.49127 24.8511 8.32246 24.7089 8.18027ZM8.3661 20.5626L17.9375 10.9901L20.0725 13.1251L10.5 22.6965L8.3661 20.5626ZM7.4375 19.6351L5.3036 17.5001L14.875 7.9287L17.01 10.0626L7.4375 19.6351ZM5.03125 22.7501V19.0839L8.91625 22.9689H5.25C5.19199 22.9689 5.13635 22.9458 5.09532 22.9048C5.0543 22.8638 5.03125 22.8081 5.03125 22.7501ZM23.7803 9.4173L21 12.1976L15.8036 7.00011L18.5828 4.22089C18.6031 4.20055 18.6273 4.18442 18.6538 4.17341C18.6804 4.1624 18.7088 4.15674 18.7376 4.15674C18.7663 4.15674 18.7948 4.1624 18.8214 4.17341C18.8479 4.18442 18.872 4.20055 18.8923 4.22089L23.7803 9.10777C23.8007 9.12808 23.8168 9.15221 23.8278 9.17876C23.8388 9.20532 23.8445 9.23379 23.8445 9.26253C23.8445 9.29128 23.8388 9.31975 23.8278 9.3463C23.8168 9.37286 23.8007 9.39698 23.7803 9.4173Z"
                    fill="#6F685D"
                  />
                </svg>
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
                    className={styles.nameInput}
                    value={profileStore.draftFirstName}
                    onChange={(event) =>
                      profileStore.setDraftFirstName(event.target.value)
                    }
                    placeholder="Имя"
                    required
                  />

                  <input
                    className={styles.nameInput}
                    value={profileStore.draftLastName}
                    onChange={(event) =>
                      profileStore.setDraftLastName(event.target.value)
                    }
                    placeholder="Фамилия"
                    required
                  />

                  <input
                    className={styles.nameInput}
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

        {isEditing && isOwnerMode ? (
          <section className={styles.securityCard}>
            <Link className={styles.securityButton} to="/profile/security/password">
              Сменить пароль
            </Link>
            <button
              className={styles.deleteAccountButton}
              type="button"
              onClick={() => {
                setIsDeleteAccountModalOpen(true);
              }}
            >
              Удалить аккаунт
            </button>
          </section>
        ) : null}

        {isDeleteAccountModalOpen ? (
          <div
            className={styles.deleteModalOverlay}
            role="presentation"
            onClick={() => {
              setIsDeleteAccountModalOpen(false);
            }}
          >
            <div
              className={styles.deleteModal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-account-client-title"
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              <button
                className={styles.deleteModalClose}
                type="button"
                aria-label="Закрыть"
                onClick={() => {
                  setIsDeleteAccountModalOpen(false);
                }}
              >
                <span className={styles.deleteModalCloseIcon} aria-hidden />
              </button>

              <h2 id="delete-account-client-title" className={styles.deleteModalTitle}>
                Удаление аккаунта клиента
              </h2>

              <p className={styles.deleteModalLead}>
                Вы уверены, что хотите удалить аккаунт клиента?
              </p>

              <Link
                className={styles.deleteModalConfirm}
                to="/account/delete"
                onClick={() => {
                  setIsDeleteAccountModalOpen(false);
                }}
              >
                Удалить
              </Link>
            </div>
          </div>
        ) : null}
      </>
    );
  },
);