//src/pages/profile-security-password/ui/ChangePasswordPage.tsx
import { useState } from 'react';

import { securityService } from '@/features/profileSecurity/service/securityService';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import styles from './ChangePasswordPage.module.css';

export const ChangePasswordPage = () => {
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
      await securityService.changePassword({ oldPassword, newPassword: new1 });
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
        <button className={styles.backBtn} type="button" onClick={() => navigate('/profile')}>
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

          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>Пароль успешно изменён.</div>}

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
                  onClick={() => setRevealOld((value) => !value)}
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
                  onClick={() => setRevealNew1((value) => !value)}
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
                  onClick={() => setRevealNew2((value) => !value)}
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
};

export function EyeIcon({ isOff }: { isOff?: boolean }) {
  if (isOff) {
    return (
      <svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M1.83464 4.83116L3.00797 3.66699L18.3346 18.9937L17.1705 20.167L14.3471 17.3437C13.293 17.692 12.1746 17.8753 11.0013 17.8753C6.41797 17.8753 2.5038 15.0245 0.917969 11.0003C1.55047 9.38699 2.5588 7.96616 3.84214 6.83866L1.83464 4.83116ZM11.0013 8.25033C11.7306 8.25033 12.4301 8.54006 12.9458 9.05578C13.4616 9.57151 13.7513 10.271 13.7513 11.0003C13.7518 11.3125 13.6991 11.6225 13.5955 11.917L10.0846 8.40616C10.3791 8.30256 10.6891 8.24986 11.0013 8.25033ZM11.0013 4.12533C15.5846 4.12533 19.4988 6.97616 21.0846 11.0003C20.3361 12.9005 19.0648 14.55 17.418 15.7578L16.1163 14.447C17.384 13.5702 18.4064 12.3837 19.0863 11.0003C18.3453 9.4877 17.1948 8.21332 15.7656 7.32207C14.3363 6.43081 12.6857 5.95844 11.0013 5.95866C10.0021 5.95866 9.0213 6.12366 8.10464 6.41699L6.69297 5.01449C8.01297 4.44616 9.47047 4.12533 11.0013 4.12533ZM2.9163 11.0003C3.65729 12.5129 4.8078 13.7873 6.23705 14.6786C7.6663 15.5698 9.31694 16.0422 11.0013 16.042C11.6338 16.042 12.2571 15.9778 12.8346 15.8495L10.7446 13.7503C10.1068 13.682 9.51156 13.3973 9.05795 12.9437C8.60433 12.4901 8.31967 11.8948 8.2513 11.257L5.13463 8.13116C4.22714 8.91033 3.4663 9.88199 2.9163 11.0003Z"
          fill="#211500"
        />
      </svg>
    );
  }

  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M10.9974 8.25C11.7267 8.25 12.4262 8.53973 12.9419 9.05546C13.4577 9.57118 13.7474 10.2707 13.7474 11C13.7474 11.7293 13.4577 12.4288 12.9419 12.9445C12.4262 13.4603 11.7267 13.75 10.9974 13.75C10.2681 13.75 9.56858 13.4603 9.05285 12.9445C8.53713 12.4288 8.2474 11.7293 8.2474 11C8.2474 10.2707 8.53713 9.57118 9.05285 9.05546C9.56858 8.53973 10.2681 8.25 10.9974 8.25ZM10.9974 4.125C15.5807 4.125 19.4949 6.97583 21.0807 11C19.4949 15.0242 15.5807 17.875 10.9974 17.875C6.41406 17.875 2.4999 15.0242 0.914062 11C2.4999 6.97583 6.41406 4.125 10.9974 4.125ZM2.9124 11C3.6533 12.5128 4.80376 13.7874 6.233 14.6788C7.66224 15.5703 9.31293 16.0429 10.9974 16.0429C12.6819 16.0429 14.3325 15.5703 15.7618 14.6788C17.191 13.7874 18.3415 12.5128 19.0824 11C18.3415 9.48722 17.191 8.21265 15.7618 7.32118C14.3325 6.42972 12.6819 5.95712 10.9974 5.95712C9.31293 5.95712 7.66224 6.42972 6.233 7.32118C4.80376 8.21265 3.6533 9.48722 2.9124 11Z"
        fill="#211500"
      />
    </svg>
  );
}
