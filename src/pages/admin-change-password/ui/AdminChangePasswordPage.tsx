// src/pages/admin-change-password/ui/AdminChangePasswordPage.tsx

import { useState } from 'react';

import { adminSecurityService } from '@/features/admin-security';
import { EyeIcon } from '@/pages/profile-security-password/ui/ChangePasswordPage';
import styles from '@/pages/profile-security-password/ui/ChangePasswordPage.module.css';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import type { ReactElement } from 'react';

export function AdminChangePasswordPage(): ReactElement {
  const navigate = useAppNavigate();

  const [oldPassword, setOldPassword] = useState('');
  const [new1, setNew1] = useState('');
  const [new2, setNew2] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [revealOld, setRevealOld] = useState(false);
  const [revealNew1, setRevealNew1] = useState(false);
  const [revealNew2, setRevealNew2] = useState(false);

  const submit = async () => {
    setError(null);
    setSuccess(false);

    if (!oldPassword.trim()) {
      setError('Введите текущий пароль');
      return;
    }
    if (new1.trim().length < 8) {
      setError('Новый пароль должен быть не короче 8 символов');
      return;
    }
    if (new1 !== new2) {
      setError('Новые пароли не совпадают');
      return;
    }

    setLoading(true);
    try {
      await adminSecurityService.changePassword({
        oldPassword,
        newPassword: new1,
      });
      setSuccess(true);
      setOldPassword('');
      setNew1('');
      setNew2('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось изменить пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <button
          className={styles.backBtn}
          type="button"
          onClick={() => navigate('/admin/profile', { replace: true })}
        >
          <svg
            className={styles.backIcon}
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M10.2531 3.44143C10.0901 3.27852 9.86918 3.18701 9.63879 3.18701C9.4084 3.18701 9.18744 3.27852 9.02448 3.44143L3.81698 8.64893C3.73616 8.72958 3.67203 8.82535 3.62828 8.93078C3.58453 9.0362 3.56201 9.14922 3.56201 9.26336C3.56201 9.37751 3.58453 9.49053 3.62828 9.59595C3.67203 9.70137 3.73616 9.79715 3.81698 9.8778L9.02448 15.0853C9.18838 15.2436 9.40788 15.3312 9.63572 15.3292C9.86355 15.3272 10.0815 15.2357 10.2426 15.0746C10.4037 14.9135 10.4952 14.6955 10.4972 14.4677C10.4992 14.2399 10.4116 14.0204 10.2531 13.8564L6.5286 10.1319H15.825C16.0552 10.1319 16.276 10.0405 16.4388 9.87774C16.6015 9.71499 16.693 9.49422 16.693 9.26399C16.693 9.03375 16.6015 8.81298 16.4388 8.65023C16.276 8.48749 16.0552 8.39605 15.825 8.39605H6.5286L10.2531 4.6703C10.416 4.50734 10.5075 4.28638 10.5075 4.05599C10.5075 3.8256 10.416 3.60439 10.2531 3.44143Z"
              fill="currentColor"
            />
          </svg>
          Назад
        </button>

        <div className={styles.card}>
          <h2 className={styles.h2}>Смена пароля</h2>

          {error ? <div className={styles.error}>{error}</div> : null}
          {success ? (
            <div className={styles.success}>Пароль успешно изменён.</div>
          ) : null}

          <div className={styles.formGrid}>
            <label className={styles.field}>
              <div className={styles.label}>Текущий пароль</div>
              <div className={styles.passRow}>
                <input
                  className={styles.input}
                  type={revealOld ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Введите текущий пароль"
                  required
                  autoComplete="current-password"
                />
                <button
                  className={styles.eyeBtn}
                  type="button"
                  onClick={() => setRevealOld((v) => !v)}
                  title="Показать/скрыть"
                >
                  <EyeIcon isOff={!revealOld} />
                </button>
              </div>
            </label>

            <label className={styles.field}>
              <div className={styles.label}>Новый пароль</div>
              <div className={styles.passRow}>
                <input
                  className={styles.input}
                  type={revealNew1 ? 'text' : 'password'}
                  value={new1}
                  onChange={(e) => setNew1(e.target.value)}
                  placeholder="Введите новый пароль"
                  required
                  autoComplete="new-password"
                />
                <button
                  className={styles.eyeBtn}
                  type="button"
                  onClick={() => setRevealNew1((v) => !v)}
                  title="Показать/скрыть"
                >
                  <EyeIcon isOff={!revealNew1} />
                </button>
              </div>
            </label>

            <label className={styles.field}>
              <div className={styles.label}>Повторите новый пароль</div>
              <div className={styles.passRow}>
                <input
                  className={styles.input}
                  type={revealNew2 ? 'text' : 'password'}
                  value={new2}
                  onChange={(e) => setNew2(e.target.value)}
                  placeholder="Повторите новый пароль"
                  required
                  autoComplete="new-password"
                />
                <button
                  className={styles.eyeBtn}
                  type="button"
                  onClick={() => setRevealNew2((v) => !v)}
                  title="Показать/скрыть"
                >
                  <EyeIcon isOff={!revealNew2} />
                </button>
              </div>
            </label>
          </div>

          <button
            className={styles.primaryBtn}
            type="button"
            disabled={loading}
            onClick={submit}
          >
            {loading ? 'Сохраняем...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
}
