//src/pages/become-specialist/ui/BecomeSpecialistPage.tsx

import type { ReactElement } from 'react';

import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';
import { FeedbackSection } from '@/shared/ui/feedback';

import styles from './BecomeSpecialistPage.module.css';

export const BecomeSpecialistPage = (): ReactElement => {
  const navigate = useAppNavigate();

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.grid}>
            <div className={styles.left}>
              <h1 className={styles.title}>
                Стань частью нашей команды — дари заботу и получай радость от работы с
                животными!
              </h1>

              <div className={styles.textBlock}>
                <p className={styles.text}>
                  Превратите своё умение находить подход к животным в любимую работу. Мы
                  поможем с клиентами и безопасными условиями!
                </p>

                <p className={styles.text}>
                  Мы создали платформу, где ваша любовь к питомцам может стать настоящей
                  профессией. Здесь вы сможете самостоятельно выбирать подходящие заказы
                  рядом с домом, работать с самыми разными питомцами.
                </p>
              </div>

              <button
                type="button"
                className={styles.cta}
                onClick={() => navigate('/become-specialist/form')}
              >
                Заполнить форму
              </button>
            </div>

            <div className={styles.right} aria-hidden="true">
              <img
                className={styles.image}
                src="/images/become-specialist/Frame 337.svg"
                alt=""
              />
            </div>
          </div>
        </div>
      </section>

      <FeedbackSection />
    </>
  );
};