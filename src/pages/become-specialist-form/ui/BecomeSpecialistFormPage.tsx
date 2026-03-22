// src/pages/become-specialist-form/ui/BecomeSpecialistFormPage.tsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';


import { specialistApplicationsService } from '@/features/specialist-applications';

import styles from './BecomeSpecialistFormPage.module.css';

import type { FormEvent, ReactElement } from 'react';

export const BecomeSpecialistFormPage = (): ReactElement => {
  const navigate = useAppNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [about, setAbout] = useState('');
  const [consent, setConsent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    setError('');
    setSuccess(false);

    if (!consent) {
      setError('Нужно согласие на обработку персональных данных.');
      return;
    }

    setLoading(true);

    try {
      await specialistApplicationsService.createApplication({
        fullName: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        city: city.trim(),
        about: about.trim(),
      });

      setSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
      setCity('');
      setAbout('');
      setConsent(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Не удалось отправить заявку.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <button
          className={styles.backButton}
          type="button"
          onClick={() => navigate(-1)}
        >
          ← Назад
        </button>

        <div className={styles.card}>
          <div className={styles.header}>
            <span className={styles.badge}>Tailly</span>
            <h1 className={styles.title}>Анкета специалиста</h1>
            <p className={styles.subtitle}>
              Заполните данные — после отправки анкета попадёт на
              модерацию администраторам Tailly.
            </p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
              <span className={styles.label}>ФИО</span>
              <input
                className={styles.input}
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Иванова Анна Сергеевна"
                required
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Email</span>
              <input
                className={styles.input}
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="name@example.com"
                required
              />
            </label>


            <label className={styles.field}>
              <span className={styles.label}>Телефон</span>
              <input
                className={styles.input}
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
                placeholder="+7 (900) 000-00-00"
                required
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Город</span>
              <input
                className={styles.input}
                value={city}
                onChange={(event) =>
                  setCity(event.target.value)
                }
                placeholder="Москва"
                required
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>О себе</span>
              <textarea
                className={styles.textarea}
                rows={6}
                value={about}
                onChange={(event) =>
                  setAbout(event.target.value)
                }
                placeholder="Расскажите о своём опыте ухода за животными, условиях работы и сильных сторонах."
                required
              />
            </label>

            <label className={styles.consentRow}>
              <input
                className={styles.checkbox}
                type="checkbox"
                checked={consent}
                onChange={(event) =>
                  setConsent(event.target.checked)
                }
              />

              <span className={styles.consentText}>
                Я согласен на обработку персональных данных.{' '}
                <a
                  href="/docs/personal-data-agreement.pdf"
                  download
                >
                  Скачать документ
                </a>
              </span>
            </label>

            {error ? (
              <div className={styles.error}>{error}</div>
            ) : null}

            {success ? (
              <div className={styles.success}>
                Заявка отправлена и передана администраторам на
                проверку.
                <div className={styles.successLinkWrap}>
                  <Link
                    to="/become-specialist"
                    className={styles.link}
                  >
                    Вернуться на страницу “Стать
                    специалистом”
                  </Link>
                </div>
              </div>
            ) : null}


            <button
              className={styles.submitButton}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Отправляем...' : 'Отправить заявку'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};