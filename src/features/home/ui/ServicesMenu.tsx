// src/features/home/ui/ServicesMenu.tsx

import type { ServiceConfig } from '@/shared/config/services';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';


import styles from './ServicesMenu.module.css';

type Props = {
  items: ServiceConfig[];
};

export function ServicesMenu({ items }: Props) {
  const navigate = useAppNavigate();

  return (
    <div className={styles.root}>
      {items.map((s) => (
        <button
          key={s.id}
          type="button"
          className={styles.card}
          onClick={() =>
            navigate(`/services?service=${encodeURIComponent(s.id)}`)
          }
        >
          <div className={styles.iconWrap}>
            <img className={styles.icon} src={s.iconUrl} alt={s.title} />
          </div>

          <div className={styles.title}>{s.title}</div>
          <div className={styles.subtitle}>{s.subtitle}</div>
        </button>
      ))}
    </div>
  );
}