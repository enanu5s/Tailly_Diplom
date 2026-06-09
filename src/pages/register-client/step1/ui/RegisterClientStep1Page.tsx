// src/pages/register-client/step1/ui/RegisterClientStep1Page.tsx
import { useState, type FormEvent, type ReactElement } from 'react';
import { Link } from 'react-router-dom';

import { registerService } from '@/features/auth/model/registerService';
import { HttpError } from '@/shared/api/http';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import styles from '../../RegisterClient.module.css';

export const RegisterClientStep1Page = (): ReactElement => {
  const navigate = useAppNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Пароль должен быть минимум 8 символов');
      return;
    }

    if (password !== password2) {
      setError('Пароли не совпадают');
      return;
    }

    setLoading(true);

    try {
      await registerService.start(email, password);
      navigate('/register/client/verify');
    } catch (submissionError: unknown) {
      console.log('[RegisterClientStep1Page] start register error:', submissionError);

      if (submissionError instanceof HttpError) {
        console.log('[RegisterClientStep1Page] status:', submissionError.status);
        console.log('[RegisterClientStep1Page] body:', submissionError.body);
        console.log('[RegisterClientStep1Page] code:', submissionError.code);
        console.log(
          '[RegisterClientStep1Page] fieldErrors:',
          submissionError.fieldErrors,
        );

        const firstFieldError =
          submissionError.fieldErrors &&
          Object.values(submissionError.fieldErrors).find(Boolean);

        setError(
          firstFieldError ||
            submissionError.message ||
            'Не удалось начать регистрацию. Проверьте введённые данные.',
        );
      } else if (submissionError instanceof Error) {
        setError(submissionError.message);
      } else {
        setError('Ошибка регистрации');
      }
    } finally {
      setLoading(false);
    }
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
                  <h1 className={styles.title}>Регистрация клиента</h1>
                  <p className={styles.subtitle}>Шаг 1 из 3 — создайте аккаунт</p>
                </div>

                <form className={styles.form} onSubmit={onSubmit}>
                  <label className={styles.field}>
                    <input
                      className={styles.input}
                      type="email"
                      placeholder="Ваш email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="email"
                      required
                    />
                  </label>

                  <label className={styles.field}>
                    <input
                      className={styles.input}
                      type="password"
                      placeholder="Пароль"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="new-password"
                      required
                    />
                  </label>

                  <label className={styles.field}>
                    <input
                      className={styles.input}
                      type="password"
                      placeholder="Повторить пароль"
                      value={password2}
                      onChange={(event) => setPassword2(event.target.value)}
                      autoComplete="new-password"
                      required
                    />
                  </label>

                  <label className={styles.consentRow}>
                    <input
                      className={styles.checkbox}
                      type="checkbox"
                      checked={consent}
                      onChange={(event) => setConsent(event.target.checked)}
                      required
                    />
                    <span className={styles.consentText}>
                      Я согласен(на) на{' '}
                      <a
                        className={styles.consentLink}
                        href="/docs/personal-data-agreement.pdf"
                        download
                      >
                        обработку персональных данных
                      </a>
                    </span>
                  </label>

                  {error ? <div className={styles.error}>{error}</div> : null}

                  <button
                    className={styles.submitButton}
                    disabled={loading || !consent}
                    type="submit"
                  >
                    {loading ? 'Отправляем код...' : 'Продолжить'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className={styles.loginCard}>
            <div className={styles.loginCardInner}>
              <p className={styles.loginText}>У вас уже есть аккаунт?</p>
              <Link className={styles.loginButton} to="/login">
                Войти
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
