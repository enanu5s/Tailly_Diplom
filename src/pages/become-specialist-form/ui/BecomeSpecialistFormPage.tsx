//src/pages/become-specialist-form/ui/BecomeSpecialistFormPage.tsx

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './BecomeSpecialistFormPage.module.css';
import { specialistApplicationApi } from '@/shared/api/specialistApplicationApi';

export const BecomeSpecialistFormPage = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [about, setAbout] = useState('');
  const [consent, setConsent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!consent) {
      setError('Нужно согласие на обработку персональных данных');
      return;
    }

    setLoading(true);
    try {
      await specialistApplicationApi.send({ name, email, phone, city, about });
      setSuccess(true);
      // можно оставить успех и кнопку "Вернуться", либо сделать редирект:
      // navigate('/become-specialist', { replace: true });
    } catch (e: any) {
      setError(e?.message ?? 'Не удалось отправить заявку');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          ← Назад
        </button>

        <h1 className={styles.title}>Анкета специалиста</h1>
        <p className={styles.subtitle}>Заполните данные — мы свяжемся с вами</p>

        <div className={styles.card}>
          <form className={styles.form} onSubmit={onSubmit}>
            <input
              className={styles.input}
              placeholder="Имя и фамилия"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              className={styles.input}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              className={styles.input}
              placeholder="Телефон"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />

            <input
              className={styles.input}
              placeholder="Город"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />

            <textarea
              className={styles.textarea}
              placeholder="Расскажите о себе и опыте (какие услуги готовы оказывать)"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              rows={5}
              required
            />

            <label className={styles.consentRow}>
              <input
                className={styles.checkbox}
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <span className={styles.consentText}>
                Я согласен на обработку персональных данных.{' '}
                <a href="/docs/personal-data-agreement.pdf" download>
                  Скачать документ
                </a>
              </span>
            </label>

            {error && <div className={styles.error}>{error}</div>}
            {success && (
              <div className={styles.success}>
                Заявка отправлена! Мы свяжемся с вами в ближайшее время.
                <div style={{ marginTop: 8 }}>
                  <Link to="/become-specialist" className={styles.link}>
                    Вернуться на страницу “Стать специалистом”
                  </Link>
                </div>
              </div>
            )}
            <button className={styles.submitButton} type="submit" disabled={loading}>
              {loading ? 'Отправляем...' : 'Отправить заявку'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};