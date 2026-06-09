import clsx from 'clsx';
import { useState } from 'react';

import styles from './Faq.module.css';

type FaqItem = { q: string; a: string };

const FAQ: FaqItem[] = [
  {
    q: 'Как выбираются специалисты?',
    a: 'Мы показываем профили специалистов с описанием услуг и отзывами. В будущем добавим расширенную верификацию.',
  },
  {
    q: 'Можно ли отменить заказ?',
    a: 'Да, отмена доступна из карточки заказа в профиле. Условия зависят от статуса заказа.',
  },
  {
    q: 'Безопасна ли оплата?',
    a: 'Сейчас проект работает в режиме mock. При подключении backend оплата будет обрабатываться через платёжного провайдера.',
  },
  {
    q: 'Можно ли добавить несколько питомцев?',
    a: 'Да, в профиле можно добавить нескольких питомцев и выбирать их при оформлении заказа.',
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className={styles.root}>
      <h2 className={styles.title}>Часто задаваемые вопросы</h2>

      <div className={styles.layout}>
        <div className={styles.list}>
          {FAQ.map((it, i) => {
            const isOpen = open === i;

            return (
              <div
                key={it.q}
                className={clsx(styles.item, isOpen && styles.itemActive)}
              >
                <button
                  type="button"
                  className={styles.qRow}
                  onClick={() => setOpen((current) => (current === i ? null : i))}
                  aria-expanded={isOpen}
                >
                  <span className={styles.q}>{it.q}</span>
                  <img
                    className={clsx(styles.chev, isOpen && styles.chevOpen)}
                    src="/icons/chevron.svg"
                    alt=""
                    aria-hidden="true"
                  />
                </button>

                <div className={clsx(styles.aWrap, isOpen && styles.aWrapOpen)}>
                  <div className={clsx(styles.a, isOpen && styles.aOpen)}>
                    {it.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.artCol}>
          <img
            className={styles.artImage}
            src="/images/home/home-faq-people-pets.png"
            alt="Счастливые владельцы с питомцами"
          />
        </div>
      </div>
    </div>
  );
}