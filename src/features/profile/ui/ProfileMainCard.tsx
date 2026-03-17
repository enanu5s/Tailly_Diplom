import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import styles from './ProfileMainCard.module.css';
import { profileStore } from '../model/profileStore';

export const ProfileMainCard = observer(() => {
  useEffect(() => {
    if (!profileStore.profile && !profileStore.loading) {
      void profileStore.load();
    }
  }, []);

  const p = profileStore.profile;

  const avatarSrc = profileStore.editing
    ? profileStore.draftAvatarUrl
    : (p?.avatarUrl ?? '');
  const fullName = profileStore.editing
    ? `${profileStore.draftFirstName} ${profileStore.draftLastName}`.trim() || 'Профиль'
    : (p ? `${p.firstName} ${p.lastName}`.trim() : 'Профиль');

  return (
    <section className={styles.card}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>Основные данные</h2>
      </div>

      {profileStore.error && <div className={styles.error}>{profileStore.error}</div>}
      {profileStore.loading && !p && <div className={styles.state}>Загружаем профиль...</div>}

      {p && (
        <div className={styles.grid}>
          <div className={styles.avatarCol}>
            <div className={styles.avatarWrap}>
              {avatarSrc ? (
                <img className={styles.avatar} src={avatarSrc} alt={fullName} />
              ) : (
                <div className={styles.avatarPlaceholder}>Фото</div>
              )}
            </div>

            {profileStore.editing ? (
              <label className={styles.secondaryBtn}>
                Изменить фото
                <input
                  className={styles.fileInput}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) profileStore.setAvatarFromFile(file);
                  }}
                />
              </label>
            ) : null}

            <div className={styles.fullName}>
              {profileStore.editing ? (
                <div className={styles.nameRow}>
                  <input
                    className={styles.input}
                    value={profileStore.draftFirstName}
                    onChange={(e) => profileStore.setDraftFirstName(e.target.value)}
                    placeholder="Имя"
                    required
                  />
                  <input
                    className={styles.input}
                    value={profileStore.draftLastName}
                    onChange={(e) => profileStore.setDraftLastName(e.target.value)}
                    placeholder="Фамилия"
                    required
                  />
                </div>
              ) : (
                <>
                  {p.firstName} {p.lastName}
                </>
              )}
            </div>
          </div>

          <div className={styles.fieldsCol}>
            <div className={styles.field}>
              <div className={styles.label}>Город</div>
              {profileStore.editing ? (
                <input
                  className={styles.input}
                  value={profileStore.draftCity}
                  onChange={(e) => profileStore.setDraftCity(e.target.value)}
                  placeholder="Введите город"
                  required
                />
              ) : (
                <div className={styles.value}>
                  {profileStore.editing
                    ? (profileStore.draftCity || '—')
                    : (p.city || '—')}
                </div>
              )}
            </div>

            <div className={styles.field}>
              <div className={styles.label}>Телефон</div>
              {profileStore.editing ? (
                <input
                  className={styles.input}
                  value={profileStore.draftPhone}
                  onChange={(e) => profileStore.setDraftPhone(e.target.value)}
                  placeholder="+7 ..."
                  required
                />
              ) : (
                <div className={styles.value}>{profileStore.editing
                  ? (profileStore.draftPhone || '—')
                  : (p.phone || '—')}</div>
              )}
            </div>
            <div className={styles.field}>
              <div className={styles.label}>Почта</div>
              <div className={styles.value}>{p.email || '—'}</div>
              <div className={styles.muted}>Нужен код подтверждения.</div>
              <div className={styles.fieldActions}>
                <Link className={styles.secondaryBtn} to="/profile/security/email">
                  Сменить почту
                </Link>
              </div>
            </div>

            <div className={styles.field}>
              <div className={styles.label}>Пароль</div>
              <div className={styles.value}>••••••••</div>
              <div className={styles.muted}>Смена — в разделе безопасности.</div>
              <div className={styles.fieldActions}>
                <Link className={styles.secondaryBtn} to="/profile/security/password">
                  Сменить пароль
                </Link>
              </div>
            </div>

            <div className={styles.actions}>
              {profileStore.editing ? (
                <>
                  {profileStore.saveError && <div className={styles.error}>{profileStore.saveError}</div>}
                  {profileStore.saveSuccess && <div className={styles.success}>Данные сохранены.</div>}

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
                </>
              ) : (
                <button className={styles.primaryBtn} type="button" onClick={() => profileStore.startEdit()}>
                  Редактировать основные данные
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
});