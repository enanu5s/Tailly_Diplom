//src/features/home/ui/ServicesMenu.tsx

import { useNavigate } from 'react-router-dom';
import type { HomeService } from '../model/types';
import styles from './ServicesMenu.module.css';

export function ServicesMenu(props: { items: HomeService[] }) {
  const navigate = useNavigate();

  return (
    <div className={styles.root}>
      {props.items.map((s) => (
        <button
          key={s.id}
          type="button"
          className={styles.card}
          onClick={() => navigate(`/services/${encodeURIComponent(s.id)}`)}
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