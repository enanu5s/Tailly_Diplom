//src/pages/about/ui/AboutPage.tsx

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { PostsCarousel } from '@/features/posts/ui/PostsCarousel';
import { consumeScrollPosition } from '@/shared/lib/scroll';
import { FeedbackSection } from '@/shared/ui/feedback';

import styles from './AboutPage.module.css';

export const AboutPage = () => {
  const location = useLocation();

  useEffect(() => {
    const y = consumeScrollPosition(location.pathname);
    if (y != null) {
      window.scrollTo({ top: y, left: 0, behavior: 'auto' });
    }
  }, [location.pathname]);

  return (
    <div className={styles.page}>
      <section className={styles.banner}>
        <div className={styles.container}>
          <div className={styles.bannerGrid}>
            <div className={styles.bannerText}>
              <h1 className={styles.h1}>О нас</h1>

              <h2 className={styles.h2}>Пет.Сит — сервис, где питомцы как дома</h2>

              <p className={styles.p}>
                Пет.Сит — это сервис, который помогает вашим питомцам чувствовать себя комфортно, когда вас нет рядом. Мы
                подбираем ответственных ситтеров, которые искренне любят животных и умеют находить к ним подход. Каждый
                специалист проходит тщательный отбор, чтобы обеспечить вашему любимцу правильный уход и внимание.
              </p>

              <p className={styles.p}>
                Мы понимаем, что у каждого животного свои привычки и характер. Поэтому перед началом работы обязательно
                знакомимся с вашим питомцем, узнаём его распорядок дня и особенности поведения. Это позволяет создать для
                него максимально комфортные условия, будь то разовый выгул, присмотр дома или длительная передержка.
              </p>

              <p className={styles.p}>
                Особое внимание уделяем животным, требующим специального ухода. Наши ситтеры имеют опыт работы с пожилыми
                питомцами, животными после операций и экзотическими видами. Вы всегда будете в курсе, как чувствует себя
                ваш любимец, благодаря регулярным фото- и видеоотчётам.
              </p>

              <p className={styles.p}>
                Главное для нас — ваше спокойствие и комфорт вашего питомца. Мы делаем всё, чтобы время разлуки прошло
                для него легко и незаметно.
              </p>
            </div>

            <div className={styles.bannerImageWrap}>
              <img className={styles.bannerImage} src="/images/Picture_bg_5.png" alt="Пет.Сит — забота о питомцах" />
            </div>
          </div>
        </div>
      </section>

      <PostsCarousel />

      <section className={styles.docs}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Наши правила и условия</h2>

          <div className={styles.docsGrid}>
            <a className={styles.docCard} href="/docs/user-agreement.pdf" download>
              Пользовательское соглашение
            </a>
            <a className={styles.docCard} href="/docs/refund-terms.pdf" download>
              Условия возврата
            </a>
            <a className={styles.docCard} href="/docs/agency-contract.pdf" download>
              Агентский договор
            </a>
            <a className={styles.docCard} href="/docs/privacy-policy.pdf" download>
              Политика конфиденциальности
            </a>
          </div>
        </div>
      </section>

      <section className={styles.reqs}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Реквизиты и контактные данные</h2>

          <div className={styles.reqsGrid}>
            <div className={styles.reqCol}>
              <div className={styles.reqTitle}>ООО и регистрационные данные</div>
              <div className={styles.reqText}>ООО «Пет.Сит»</div>
              <div className={styles.reqText}>ИНН: 7723456789</div>
              <div className={styles.reqText}>ОГРН: 1237700001234</div>
            </div>

            <div className={styles.reqCol}>
              <div className={styles.reqTitle}>Адрес главного офиса</div>
              <div className={styles.reqText}>123456, г. Москва, ул. Тверская, д. 10, офис 5</div>
            </div>
            <div className={styles.reqCol}>
              <div className={styles.reqTitle}>Оператор персональных данных</div>
              <div className={styles.reqText}>
                ООО «Пет.Сит» является зарегистрированным оператором, осуществляющим сбор персональных данных пользователей.
              </div>
              <div className={styles.reqText}>Номер в Реестре Роскомнадзора: 77-24-012345</div>
            </div>
          </div>
        </div>
      </section>

      <FeedbackSection />
    </div>
  );
};