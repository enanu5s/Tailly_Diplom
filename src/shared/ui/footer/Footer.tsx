// src/shared/ui/footer/Footer.tsx
import { Link } from 'react-router-dom';
import { footerLinks } from '@/shared/config/navigation';
import { Logo } from '@/shared/ui/logo';
import styles from './Footer.module.css';

export const Footer = () => {
  const { menu, documents, contacts } = footerLinks;

  return (
    <footer className={styles.footer}>           {/* ← это уже есть, но проверьте */}
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Колонка 1 */}
          <div className={styles.column}>
            <div className={styles.logoWrapper}>
              <Logo size="medium" variant="light" />
            </div>
            <p className={styles.description}>
              Сервис заботы о ваших питомцах: груминг, выгул, передержка и товары
            </p>
          </div>

          {/* Колонка 2 — Навигация */}
          <div className={styles.column}>
            <h3 className={styles.title}>Навигация</h3>
            <ul className={styles.list}>
              {menu.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={styles.link}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Колонка 3 — Документы */}
          <div className={styles.column}>
            <h3 className={styles.title}>Документы</h3>
            <ul className={styles.list}>
              {documents.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={styles.link}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Колонка 4 — Контакты */}
          <div className={styles.column}>
            <h3 className={styles.title}>Контакты</h3>
            <ul className={styles.list}>
              <li>
                <a href={'mailto:${contacts.email}'} className={styles.link}>
                  {contacts.email}
                </a>
              </li>
              <li>
                <a href={"tel:" + contacts.phone.replace(/\D/g, '')}
                className={styles.link}>
                  {contacts.phone}
                </a>
              </li>
              <li className={styles.address}>{contacts.address}</li>
            </ul>
          </div>
        </div>

        {/* Блок копирайта — теперь внутри общего <footer> */}
        <div className={styles.copyright}>
          © {new Date().getFullYear()} Tailly. Все права защищены.
        </div>
      </div>
    </footer>
  );
};