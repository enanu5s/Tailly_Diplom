//src/features/home/ui/Faq.tsx
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

function FaqArt() {
  return (
    <svg
      className={styles.artSvg}
      viewBox="0 0 400 320"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="faqBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f0f4e4" />
          <stop offset="100%" stopColor="#fff8e8" />
        </linearGradient>
      </defs>
      <rect width="400" height="320" rx="28" fill="url(#faqBg)" />
      <circle cx="320" cy="48" r="18" fill="#ffb700" opacity="0.35" />
      <path
        d="M48 72 C 38 62 38 52 48 44 C 58 36 72 40 78 52 L 82 60"
        fill="none"
        stroke="#a9c400"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <ellipse cx="120" cy="200" rx="42" ry="28" fill="#d4a574" />
      <circle cx="108" cy="188" r="14" fill="#f5d0b5" />
      <ellipse cx="200" cy="210" rx="48" ry="30" fill="#c9e86c" />
      <circle cx="185" cy="195" r="16" fill="#f5e6d8" />
      <ellipse cx="268" cy="218" rx="38" ry="26" fill="#e8b896" />
      <circle cx="278" cy="202" r="13" fill="#f5d0b5" />
      <ellipse cx="155" cy="248" rx="22" ry="14" fill="#6b5344" />
      <ellipse cx="235" cy="252" rx="26" ry="15" fill="#8b6914" />
    </svg>
  );
}

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
              <div key={it.q} className={styles.item}>
                <button
                  type="button"
                  className={styles.qRow}
                  onClick={() => setOpen((v) => (v === i ? null : i))}
                  aria-expanded={isOpen}
                >
                  <span className={styles.q}>{it.q}</span>
                  <span className={styles.chev}>{isOpen ? '▾' : '▸'}</span>
                </button>

                {isOpen && <div className={styles.a}>{it.a}</div>}
              </div>
            );
          })}
        </div>

        <div className={styles.artCol}>
          <FaqArt />
        </div>
      </div>
    </div>
  );
}
