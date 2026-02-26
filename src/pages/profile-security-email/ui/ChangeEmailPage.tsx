//src/pages/profile-security-email/ui/ChangeEmailPage.tsx
import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { emailChangeFlowStore } from '@/features/profileSecurity';
import styles from './ChangeEmailPage.module.css';

export const ChangeEmailPage = observer(() => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    // если flow уже на confirm/done — отправим на нужную страницу
    if (emailChangeFlowStore.state.step === 'confirm') {
      navigate('/profile/security/email/confirm', { replace: true });
    }
    if (emailChangeFlowStore.state.step === 'done') {
      navigate('/profile/security/email/confirm', { replace: true });
    }
  }, [navigate]);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.h1}>Безопасность</h1>

        <div className={styles.card}>
          <h2 className={styles.h2}>Смена почты</h2>
          <p className={styles.text}>
            Мы отправим код подтверждения на вашу текущую (старую) почту. После этого вы сможете указать новую почту.
          </p>

          {emailChangeFlowStore.error && <div className={styles.error}>{emailChangeFlowStore.error}</div>}

          <div className={styles.actions}>
            <button
              className={styles.primaryBtn}
              type="button"
              disabled={emailChangeFlowStore.loading}
              onClick={async () => {
                await emailChangeFlowStore.requestCode();
                if (emailChangeFlowStore.state.step === 'confirm') {
                  navigate('/profile/security/email/confirm');
                }
              }}
            >
              {emailChangeFlowStore.loading ? 'Отправляем...' : 'Отправить код на старую почту'}
            </button>

            <button className={styles.secondaryBtn} type="button" onClick={() => navigate('/profile')}>
              Назад в профиль
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});