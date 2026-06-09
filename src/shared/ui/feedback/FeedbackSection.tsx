//src/shared/ui/feedback/FeedbackSection.tsx

import { useState } from 'react';

import { feedbackApi } from '@/shared/api/feedbackApi';

import styles from './FeedbackSection.module.css';

type Props = {
  phone?: string;
  email?: string;
  className?: string;
};

export const FeedbackSection = ({
  phone = '+7 (900) 765-43-21',
  email = 'help@tailly.com',
  className,
}: Props) => {
  const [name, setName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!consent) {
      setError('Нужно согласие на обработку персональных данных');
      return;
    }

    setLoading(true);

    try {
      await feedbackApi.send({
        name,
        email: userEmail,
        message,
      });

      setSuccess(true);
      setName('');
      setUserEmail('');
      setMessage('');
      setConsent(false);
    } catch (submissionError: unknown) {
      const nextMessage =
        submissionError instanceof Error
          ? submissionError.message
          : 'Не удалось отправить вопрос';

      setError(nextMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={`${styles.section} ${className ?? ''}`}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.left}>
            <h2 className={styles.title}>
              Всегда на связи — с заботой
              <br />
              о вас и ваших питомцах!
            </h2>

            <p className={styles.text}>
              Наша команда готова помочь в любое время — отвечаем на вопросы,
              подбираем идеального петситтера и поддерживаем на каждом этапе.
            </p>

            <div className={styles.contacts}>
              <a className={styles.contactLink} href={`tel:${phone.replace(/\D/g, '')}`}>
                {phone}
              </a>

              <a className={styles.contactLink} href={`mailto:${email}`}>
                {email}
              </a>
            </div>

            <div className={styles.bottomDecor} aria-hidden="true">
              <img
                className={styles.catBlob}
                src="/images/home/feedback-cat-blob.png"
                alt=""
              />
              <img
                className={styles.parrot}
                src="/images/home/feedback-parrot.png"
                alt=""
              />
            </div>
          </div>

          <div className={styles.right}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                Задайте вопрос — мы с радостью поможем!
              </h3>

              <form className={styles.form} onSubmit={onSubmit}>
                <input
                  className={styles.input}
                  placeholder="Ваше имя"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />

                <input
                  className={styles.input}
                  type="email"
                  placeholder="Email"
                  value={userEmail}
                  onChange={(event) => setUserEmail(event.target.value)}
                  required
                />

                <textarea
                  className={styles.textarea}
                  placeholder="Опишите ваш вопрос"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={5}
                  required
                />

                <label className={styles.consentRow}>
                  <input
                    className={styles.checkbox}
                    type="checkbox"
                    checked={consent}
                    onChange={(event) => setConsent(event.target.checked)}
                  />
                  <span className={styles.consentText}>
                    Я согласен на обработку персональных данных
                  </span>
                </label>

                {error ? <div className={styles.error}>{error}</div> : null}
                {success ? (
                  <div className={styles.success}>Вопрос отправлен! Мы скоро ответим.</div>
                ) : null}

                <button className={styles.submitButton} type="submit" disabled={loading}>
                  {loading ? 'Отправляем...' : 'Отправить вопрос'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};