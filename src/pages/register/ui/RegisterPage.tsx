// src/pages/register/ui/RegisterPage.tsx
import { Link } from 'react-router-dom';
import type { ReactElement } from 'react';

import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import styles from './RegisterPage.module.css';

export default function RegisterPage(): ReactElement {
  const navigate = useAppNavigate();

  return (
    <section className={styles.page}>
      <div className={styles.background} aria-hidden="true" />
      <button className={styles.backButton} type="button" onClick={() => navigate(-1)}>
        <span className={styles.backIcon}>←</span>
        <span>Назад</span>
      </button>
      <div className={styles.layout}>
        <div className={styles.container}>
          <h1 className={styles.title}>Регистрация</h1>

          <div className={styles.cards}>
            <Link to="/register/client" className={`${styles.card} ${styles.clientCard}`}>
              <span className={styles.specialistBlurOrange} aria-hidden="true" />
              <div className={styles.cardContent}>
                <img
                  className={styles.clientPerson}
                  src="/images/register/Group.svg"
                  alt=""
                  aria-hidden="true"
                />
                <div className={styles.textBlock}>
                  <h2 className={styles.cardTitle}>Я клиент</h2>
                  <p className={styles.cardSubtitle}>
                    Зарегистрируйтесь, чтобы найти проверенного петситтера для вашего
                    питомца
                  </p>
                </div>
                <img
                  className={styles.clientFishbowl}
                  src="/images/register/Group2.svg"
                  alt=""
                  aria-hidden="true"
                />
              </div>
            </Link>

            <Link
              to="/become-specialist"
              className={`${styles.card} ${styles.specialistCard}`}
            >
              <span className={styles.specialistBlurGreen} aria-hidden="true" />

              <div className={styles.cardContent}>
                <img
                  className={styles.specialistLizard}
                  src="/images/register/Group3.svg"
                  alt=""
                  aria-hidden="true"
                />
                <div className={styles.textBlock}>
                  <h2 className={styles.cardTitle}>Я специалист</h2>
                  <p className={styles.cardSubtitle}>
                    Присоединяйтесь к нашей команде заботливых специалистов
                  </p>
                </div>
                <img
                  className={styles.specialistPerson}
                  src="/images/register/Group4.svg"
                  alt=""
                  aria-hidden="true"
                />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
