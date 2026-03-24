// src/shared/ui/footer/Footer.tsx
import { Link } from 'react-router-dom';

import { footerLinks } from '@/shared/config/navigation';
import { Logo } from '@/shared/ui/logo';

import styles from './Footer.module.css';

export const Footer = () => {
  const { menu, documents, contacts } = footerLinks;

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.column}>
            <div className={styles.logoWrapper}>
              <Logo size="medium" variant="light" />
            </div>
            <p className={styles.description}>
              Сервис заботы о ваших питомцах: груминг, выгул, передержка и товары
            </p>
          </div>

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

          <div className={styles.column}>
            <h3 className={styles.title}>Контакты</h3>
            <ul className={styles.list}>
              <li>
                <a href={`mailto:${contacts.email}`} className={styles.link}>
                  {contacts.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${contacts.phone.replace(/\D/g, '')}`}
                  className={styles.link}
                >
                  {contacts.phone}
                </a>
              </li>
              <li className={styles.address}>{contacts.address}</li>
            </ul>
          </div>
        </div>

        <div className={styles.copyright}>
          © {new Date().getFullYear()} Tailly. Все права защищены.
        </div>
      </div>
    </footer>
  );
};
