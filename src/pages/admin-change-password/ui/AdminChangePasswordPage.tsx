// src/pages/admin-change-password/ui/AdminChangePasswordPage.tsx

import { useMemo, useState } from 'react';

import { adminSecurityService } from '@/features/admin-security';
import pageStyles from '@/pages/admin-profile/ui/AdminProfilePage.module.css';
import formStyles from '@/pages/profile-security-password/ui/ChangePasswordPage.module.css';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';
import { BackButton } from '@/shared/ui/back-button';

import type { ReactElement } from 'react';

export function AdminChangePasswordPage(): ReactElement {
  const navigate = useAppNavigate();

  const [oldPassword, setOldPassword] = useState('');
  const [new1, setNew1] = useState('');
  const [new2, setNew2] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
    <section className={pageStyles.page}>
      <div className={pageStyles.container}>
        <BackButton
          className={pageStyles.backButton}
          fallbackTo="/admin/profile"
          label="Назад в профиль"
        />

        <div className={formStyles.container}>
          <h1 className={formStyles.h1}>Безопасность</h1>

          <div className={formStyles.card}>
            <h2 className={formStyles.h2}>Смена пароля</h2>

            {error ? <div className={formStyles.error}>{error}</div> : null}
            {success ? (
              <div className={formStyles.success}>Пароль успешно изменён.</div>
            ) : null}

            <div className={formStyles.formGrid}>
              <label className={formStyles.field}>
                <div className={formStyles.label}>Текущий пароль</div>
                <div className={formStyles.passRow}>
                  <input
                    className={formStyles.input}
                    type={canRevealOld && revealOld ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Введите текущий пароль"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    className={formStyles.eyeBtn}
                    type="button"
                    disabled={!canRevealOld}
                    onClick={() => setRevealOld((v) => !v)}
                    title={canRevealOld ? 'Показать/скрыть' : 'Введите текущий пароль'}
                  >
                    {revealOld ? '🙈' : '👁'}
                  </button>
                </div>
              </label>

              <label className={formStyles.field}>
                <div className={formStyles.label}>Новый пароль</div>
                <input
                  className={formStyles.input}
                  type="password"
                  value={new1}
                  onChange={(e) => setNew1(e.target.value)}
                  placeholder="Минимум 8 символов"
                  required
                  autoComplete="new-password"
                />
              </label>

              <label className={formStyles.field}>
                <div className={formStyles.label}>Повторите новый пароль</div>
                <input
                  className={formStyles.input}
                  type="password"
                  value={new2}
                  onChange={(e) => setNew2(e.target.value)}
                  placeholder="Повторите новый пароль"
                  required
                  autoComplete="new-password"
                />
              </label>
            </div>

            <div className={formStyles.actions}>
              <button
                className={formStyles.primaryBtn}
                type="button"
                disabled={loading}
                onClick={submit}
              >
                {loading ? 'Сохраняем...' : 'Сохранить'}
              </button>
              <button
                className={formStyles.secondaryBtn}
                type="button"
                disabled={loading}
                onClick={() => navigate('/admin/profile')}
              >
                Назад в профиль
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
