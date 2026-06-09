//src/pages/about/ui/AboutPage.tsx
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { PostsCarousel } from '@/features/posts/ui/PostsCarousel';
import { consumeScrollPosition } from '@/shared/lib/scroll';
import { FeedbackSection } from '@/shared/ui/feedback';
import documentsIcon1Url from '@/shared/assets/icons/documents-1.svg';
import documentsIcon2Url from '@/shared/assets/icons/documents-2.svg';
import documentsIcon3Url from '@/shared/assets/icons/documents-3.svg';
import documentsIcon4Url from '@/shared/assets/icons/documents-4.svg';
import documentsIcon5Url from '@/shared/assets/icons/documents-5.svg';

import styles from './AboutPage.module.css';

type DocItem = {
  to: string;
  title: string;
  icon: string;
  activeIcon?: string;
  isActive?: boolean;
};

const docs: DocItem[] = [
  {
    to: '/user-agreement',
    title: 'Пользовательское соглашение',
    icon: documentsIcon1Url,
  },
  {
    to: '/refund-policy',
    title: 'Условия возврата',
    icon: documentsIcon3Url,
    activeIcon: documentsIcon2Url,
    isActive: true,
  },
  {
    to: '/agency-contract',
    title: 'Агентский договор',
    icon: documentsIcon3Url,
  },
  {
    to: '/privacy-policy',
    title: 'Политика конфи-денциальности',
    icon: documentsIcon4Url,
  },
  {
    to: '/public-offer',
    title: 'Публичная оферта',
    icon: documentsIcon5Url,
  },
];

export const AboutPage = () => {
  const location = useLocation();

  useEffect(() => {
    const y = consumeScrollPosition(location.pathname);

    if (y != null) {
      window.scrollTo({ top: y, left: 0, behavior: 'auto' });
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div className={styles.heroText}>
              <h1 className={styles.heroTitle}>
                Тейлли — там, где ваши питомцы в надёжных руках
              </h1>

              <div className={styles.heroDescription}>
                <p>
                  Тейлли — сервис подбора проверенных специалистов для питомцев и
                  магазин товаров для животных. Мы тщательно отбираем ситтеров,
                  грумеров, кинологов и других специалистов, которые искренне любят
                  животных. Подбор всегда индивидуальный с учётом характера, возраста
                  и особенностей вашего любимца.
                </p>

                <p>
                  В нашем магазине только полезные и проверенные товары: корма,
                  средства ухода, лежанки и аксессуары. Главное для нас — ваше
                  спокойствие и комфорт питомца.
                </p>

                <p>С Тейлли о вашем любимце позаботятся с душой!</p>
              </div>
            </div>

            <div className={styles.heroImageWrap}>
              <img
                className={styles.heroImage}
                src="/images/Picture_bg_6.png"
                alt="Тейлли — забота о питомцах"
              />
            </div>
          </div>
        </div>
      </section>

      <PostsCarousel />

      <section className={styles.docs}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Наши правила и условия</h2>

          <div className={styles.docsGrid}>
            {docs.map((doc) => (
              <Link
                key={doc.to}
                className={`${styles.docCard} ${doc.isActive ? styles.docCardActive : ''}`}
                to={doc.to}
                state={{
                  from: {
                    pathname: location.pathname,
                    scrollY: window.scrollY,
                  },
                }}
              >
                <span className={styles.docIcon} aria-hidden="true">
                  <img
                    className={styles.docIconImage}
                    src={doc.isActive && doc.activeIcon ? doc.activeIcon : doc.icon}
                    alt=""
                  />
                </span>

                <span className={styles.docTitle}>{doc.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.reqs}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Реквизиты и контактные данные</h2>

          <div className={styles.reqsGrid}>
            <div className={styles.reqCol}>
              <p>ООО «Тейлли»</p>
              <p>ИНН: 7723456789</p>
              <p>ОГРН: 1237700001234</p>
            </div>

            <div className={styles.reqCol}>
              <p>Адрес главного офиса:</p>
              <p>123456, г. Москва, ул. Тверская, д. 10, офис 5</p>
            </div>

            <div className={styles.reqCol}>
              <p>
                ООО «Тейлли» является зарегистрированным оператором, осуществляющим
                сбор персональных данных пользователей.
              </p>
              <p>Номер в Реестре Роскомнадзора: 77-24-012345</p>
            </div>
          </div>
        </div>
      </section>

      <FeedbackSection />
    </div>
  );
};