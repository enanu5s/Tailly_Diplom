//src/pages/not-found/ui/NotFoundPage.tsx

import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import styles from './NotFoundPage.module.css';

const PET_MESSAGES = [
    'Похоже, страница убежала гулять без поводка.',
    'Кажется, эту страницу утащили на передержку.',
    'Похоже, питомец спрятал нужную страницу где-то в квартире.',
    'Эта страница не нашлась, но мы можем помочь вернуться в безопасное место.',
];

export function NotFoundPage() {
    const navigate = useAppNavigate();
    const location = useLocation();

    const randomMessage = useMemo(() => {
        const pathSeed = location.pathname.length;
        return PET_MESSAGES[pathSeed % PET_MESSAGES.length];
    }, [location.pathname]);

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <main className={styles.page}>
            <div className={styles.backgroundGlow} />
            <div className={styles.backgroundGlowSecondary} />

            <section className={styles.card}>
                <div className={styles.left}>
                    <div className={styles.codeRow}>
                        <span className={styles.code}>4</span>
                        <div className={styles.zeroWrap} aria-hidden="true">
                            <div className={styles.zeroOuter}>
                                <div className={styles.zeroInner}>
                                    <span className={styles.paw}>🐾</span>
                                </div>
                            </div>
                        </div>
                        <span className={styles.code}>4</span>
                    </div>

                    <div className={styles.badge}>Страница не найдена</div>

                    <h1 className={styles.title}>
                        Упс, похоже, мы потеряли след этой страницы
                    </h1>

                    <p className={styles.description}>
                        {randomMessage}
                    </p>

                    <div className={styles.actions}>
                        <Link to="/" className={styles.primaryButton}>
                            На главную
                        </Link>

                        <button
                            type="button"
                            className={styles.ghostButton}
                            onClick={handleGoBack}
                        >
                            Назад
                        </button>
                    </div>

                    <div className={styles.meta}>
                        <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>Текущий путь</span>
                            <span className={styles.metaValue}>{location.pathname}</span>
                        </div>

                    </div>
                </div>

                <div className={styles.right}>
                    <div className={styles.illustration}>
                        <div className={styles.blob} />

                        <div className={styles.petCard}>
                            <div className={styles.petAvatar}>🐶</div>
                            <div className={styles.petTextBlock}>
                                <div className={styles.petTitle}>След потерян</div>
                                <div className={styles.petText}>
                                    Но хороший маршрут всегда можно найти заново
                                </div>
                            </div>
                        </div>

                        <div className={styles.trail}>
                            <span className={styles.trailPaw}>🐾</span>
                            <span className={styles.trailPaw}>🐾</span>
                            <span className={styles.trailPaw}>🐾</span>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}