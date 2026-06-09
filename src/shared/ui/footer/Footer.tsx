// src/shared/ui/footer/Footer.tsx
import { Link } from 'react-router-dom';

import { footerLinks } from '@/shared/config/navigation';
import { Logo } from '@/shared/ui/logo';

import styles from './Footer.module.css';

function getOptionalStringValue(source: unknown, key: string): string | null {
  if (typeof source !== 'object' || source === null) {
    return null;
  }

  const value = (source as Record<string, unknown>)[key];

  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

export const Footer = () => {
  const { menu, documents, contacts } = footerLinks;

  const telegramUrl = getOptionalStringValue(contacts, 'telegramUrl');
  const vkUrl = getOptionalStringValue(contacts, 'vkUrl');

  const navigationItems = menu.filter(
    (item) => item.to !== '/' && item.to !== '/messages',
  );
  const documentsOrder = [
    '/user-agreement',
    '/refund-policy',
    '/agency-contract',
    '/privacy-policy',
    '/public-offer',
  ];
  const documentItems = documentsOrder
    .map((to) => documents.find((item) => item.to === to))
    .filter((item): item is (typeof documents)[number] => Boolean(item));
  const telegramIcon = '/icons/telegram.svg';
  const vkIcon = '/icons/vk.svg';
  const displayPhone = '+7 (900) 765-43-21';
  const displayEmail = 'help@tailly.com';

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.brandColumn}>
            <Link to="/" className={styles.logoLink} aria-label="Перейти на главную">
              <Logo size="large" variant="light" />
            </Link>

            <p className={styles.copyright}>
              © {new Date().getFullYear()} Tailly.
              <br />
              Все права защищены.
            </p>
          </div>

          <nav className={`${styles.linksColumn} ${styles.linksColumnNav}`} aria-label="Основная навигация">
            <ul className={styles.linksList}>
              {navigationItems.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={styles.link}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className={`${styles.linksColumn} ${styles.linksColumnDocs}`} aria-label="Документы">
            <ul className={styles.linksList}>
              {documentItems.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={styles.link}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.contactsColumn}>
            <a
              href={`tel:${displayPhone.replace(/\D/g, '')}`}
              className={styles.contactLink}
            >
              {displayPhone}
            </a>

            <a href={`mailto:${displayEmail}`} className={styles.contactLink}>
              {displayEmail}
            </a>

            {(telegramUrl || vkUrl) && (
              <div className={styles.socials} aria-label="Социальные сети">
                {telegramUrl ? (
                  <a
                    href={telegramUrl}
                    className={styles.socialLink}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Telegram"
                  >
                    <img src={telegramIcon} alt="" />
                  </a>
                ) : null}

                {vkUrl ? (
                  <a
                    href={vkUrl}
                    className={styles.socialLink}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="VK"
                  >
                    <img src={vkIcon} alt="" />
                  </a>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
