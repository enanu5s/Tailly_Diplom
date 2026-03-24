//src/pages/profile-security-password/ui/ChangePasswordPage.tsx
import { useMemo, useState } from 'react';

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

  // “полный пароль можно увидеть только при вводе активного пароля”
  const canRevealOld = useMemo(() => oldPassword.trim().length > 0, [oldPassword]);

  const [revealOld, setRevealOld] = useState(false);

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
        <h1 className={styles.h1}>Безопасность</h1>

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
                  type={canRevealOld && revealOld ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Введите текущий пароль"
                  required
                />
                <button
                  className={styles.eyeBtn}
                  type="button"
                  disabled={!canRevealOld}
                  onClick={() => setRevealOld((v) => !v)}
                  title={canRevealOld ? 'Показать/скрыть' : 'Введите текущий пароль'}
                >
                  {revealOld ? '🙈' : '👁'}
                </button>
              </div>
            </label>

            <label className={styles.field}>
              <div className={styles.label}>Новый пароль</div>
              <input
                className={styles.input}
                type="password"
                value={new1}
                onChange={(e) => setNew1(e.target.value)}
                placeholder="Минимум 8 символов"
                required
              />
            </label>

            <label className={styles.field}>
              <div className={styles.label}>Повторите новый пароль</div>
              <input
                className={styles.input}
                type="password"
                value={new2}
                onChange={(e) => setNew2(e.target.value)}
                placeholder="Повторите новый пароль"
                required
              />
            </label>
          </div>

          <div className={styles.actions}>
            <button
              className={styles.primaryBtn}
              type="button"
              disabled={loading}
              onClick={submit}
            >
              {loading ? 'Сохраняем...' : 'Сохранить'}
            </button>
            <button
              className={styles.secondaryBtn}
              type="button"
              disabled={loading}
              onClick={() => navigate('/profile')}
            >
              Назад в профиль
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
