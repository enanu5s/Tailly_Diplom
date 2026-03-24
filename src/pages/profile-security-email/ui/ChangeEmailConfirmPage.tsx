//src/pages/profile-security-email/ui/ChangeEmailConfirmPage.tsx
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';

import { emailChangeFlowStore } from '@/features/profileSecurity';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';


import styles from './ChangeEmailPage.module.css';

export const ChangeEmailConfirmPage = observer(() => {
  const navigate = useAppNavigate();
  const [code, setCode] = useState('');
  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    // guard: если нет requestId — нельзя быть на confirm
    if (!emailChangeFlowStore.state.requestId) {
      navigate('/profile/security/email', { replace: true });
    }
  }, [navigate]);

  const masked = emailChangeFlowStore.state.maskedOldEmail;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.h1}>Безопасность</h1>

        <div className={styles.card}>
          <h2 className={styles.h2}>Подтверждение смены почты</h2>

          <p className={styles.text}>
            Код отправлен на: <span className={styles.inlineStrong}>{masked ?? 'вашу почту'}</span>
          </p>

          {emailChangeFlowStore.confirmError && <div className={styles.error}>{emailChangeFlowStore.confirmError}</div>}
          {emailChangeFlowStore.success && (
            <div className={styles.success}>Почта успешно изменена.</div>
          )}

          <div className={styles.formGrid}>
            <label className={styles.field}>
              <div className={styles.label}>Код подтверждения</div>
              <input
                className={styles.input}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Введите код"
                required
              />
            </label>

            <label className={styles.field}>
              <div className={styles.label}>Новая почта</div>
              <input
                className={styles.input}
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="new@email.com"
                required
              />
            </label>
          </div>

          <div className={styles.actions}>
            <button
              className={styles.primaryBtn}
              type="button"
              disabled={emailChangeFlowStore.confirmLoading || emailChangeFlowStore.success}
              onClick={() => void emailChangeFlowStore.confirm({ code, newEmail })}
            >
              {emailChangeFlowStore.confirmLoading ? 'Проверяем...' : 'Подтвердить и изменить'}
            </button>

            <button
              className={styles.secondaryBtn}
              type="button"
              disabled={emailChangeFlowStore.confirmLoading}
              onClick={() => {
                emailChangeFlowStore.resetFlow();
                navigate('/profile/security/email', { replace: true });
              }}
            >
              Запросить код заново
            </button>

            <button
              className={styles.secondaryBtn}
              type="button"
              onClick={() => {
                emailChangeFlowStore.resetFlow();
                navigate('/profile');
              }}
            >
              Готово
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});