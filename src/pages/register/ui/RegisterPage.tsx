// src/pages/register/ui/RegisterPage.tsx
import { Link } from 'react-router-dom';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import styles from './RegisterPage.module.css';

const RegisterPage = () => {
  const navigate = useAppNavigate();

  return (
    <>

      <div className={styles.page}>
        <div className={styles.container}>
          {/* Кнопка назад */}
          <button onClick={() => navigate(-1)} className={styles.backButton}>
            ← Вернуться назад
          </button>

          <h1 className={styles.title}>Регистрация</h1>

          <div className={styles.cards}>
            {/* Карточка 1 — Я клиент */}
            <Link to="/register/client" className={`${styles.card} ${styles.cardClient}`}>
              <div 
                className={styles.cardImage}
              />
              <div className={styles.overlay}>
                <h2 className={styles.cardTitle}>Я клиент</h2>
                <p className={styles.cardSubtitle}>
                  Зарегистрируйтесь, чтобы найти проверенного петситтера<br />
                  для вашего питомца
                </p>
              </div>
            </Link>

            {/* Карточка 2 — Я петситтер */}
            <Link to="/become-specialist" className={`${styles.card} ${styles.cardSitter}`}>
              <div 
                className={styles.cardImage}
              />
              <div className={styles.overlay}>
                <h2 className={styles.cardTitle}>Я петситтер</h2>
                <p className={styles.cardSubtitle}>
                  Присоединяйтесь к нашей команде<br />
                  заботливых петситтеров
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

    </>
  );
};

export default RegisterPage;