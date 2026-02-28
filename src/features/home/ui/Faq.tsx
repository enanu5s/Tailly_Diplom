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

export function Faq() {
    const [open, setOpen] = useState<number | null>(0);

    return (
        <div className={styles.root}>
            <div className={styles.title}>FAQ</div>

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
        </div>
    );
}