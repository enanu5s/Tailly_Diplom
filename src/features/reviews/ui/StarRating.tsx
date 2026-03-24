//src/features/reviews/ui/StarRating.tsx

import { memo } from 'react';

import styles from './StarRating.module.css';

type Props = {
  value: number; // 0..5
  onChange: (v: number) => void;
  disabled?: boolean;
};

export const StarRating = memo((props: Props) => {
  const v = Math.max(0, Math.min(5, Math.floor(props.value)));

  return (
    <div className={styles.root} aria-label="Оценка">
      {Array.from({ length: 5 }).map((_, i) => {
        const star = i + 1;
        const active = star <= v;
        return (
          <button
            key={star}
            type="button"
            className={active ? styles.starActive : styles.star}
            disabled={props.disabled}
            onClick={() => props.onChange(star)}
            aria-label={`Поставить ${star}`}
          >
            {active ? '★' : '☆'}
          </button>
        );
      })}
    </div>
  );
});
