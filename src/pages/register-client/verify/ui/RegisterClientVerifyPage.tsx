//src/pages/register-client/verify/ui/RegisterClientVerifyPage.tsx
import { useEffect, useState, type FormEvent, type ReactElement } from 'react';

import { logMockRegistrationCode } from '@/features/auth/data/mockRegister';
import { registerService } from '@/features/auth/model/registerService';
import { useRegisterFlow } from '@/features/auth/model/useRegisterFlow';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import styles from '../../RegisterClient.module.css';

export const RegisterClientVerifyPage = (): ReactElement => {
  const navigate = useAppNavigate();
  const flow = useRegisterFlow();

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!flow.registrationId) {
      navigate('/register/client', { replace: true });
    }
  }, [flow.registrationId, navigate]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);

    if (!flow.registrationId) {
      return;
    }

    setLoading(true);

    try {
      await registerService.verify(flow.registrationId, code);
      navigate('/register/client/profile');
    } catch (submissionError: unknown) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : 'Ошибка проверки кода';

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = (): void => {
    setError(null);
    logMockRegistrationCode('Код отправлен повторно (регистрация)');
  };

  return (
    <section className={styles.page}>
      <div className={styles.background} aria-hidden="true" />
      <button className={styles.backButton} type="button" onClick={() => navigate(-1)}>
        <span className={styles.backIcon}>←</span>
        <span>Назад</span>
      </button>
      <div className={styles.layout}>
        <div className={styles.stack}>
          <div className={styles.cardWrap}>
            <span className={styles.backgroundBlobLeft} aria-hidden="true" />
            <span className={styles.backgroundBlobRight} aria-hidden="true" />

            <div className={styles.card}>
              <div className={styles.cardInner}>
                <div className={styles.header}>
                  <h1 className={styles.title}>Подтверждение почты</h1>
                  <p className={styles.subtitle}>
                    Шаг 2 из 3 — введите код, отправленный
                    <br />
                    на email <b>{flow.email ?? 'client@tailly.local'}</b>
                  </p>
                </div>

                <form className={styles.form} onSubmit={onSubmit}>
                  <label className={styles.field}>
                    <input
                      className={styles.input}
                      inputMode="numeric"
                      placeholder="Введите код"
                      value={code}
                      onChange={(event) => setCode(event.target.value)}
                      autoComplete="one-time-code"
                      required
                    />
                  </label>

                  <div className={styles.actionsRowRight}>
                    <button
                      type="button"
                      className={styles.linkButton}
                      onClick={handleResend}
                      disabled={loading}
                    >
                      Отправить код ещё раз
                    </button>
                  </div>

                  {error ? <div className={styles.error}>{error}</div> : null}

                  <button
                    className={styles.submitButton}
                    disabled={loading}
                    type="submit"
                  >
                    {loading ? 'Проверяем...' : 'Подтвердить'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
