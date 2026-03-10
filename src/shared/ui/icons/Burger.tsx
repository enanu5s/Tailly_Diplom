// src/shared/ui/icons/Burger.tsx
import type { FC, HTMLAttributes } from 'react';
import clsx from 'clsx';

import styles from './Burger.module.css';

interface BurgerProps extends HTMLAttributes<HTMLSpanElement> {
  isOpen: boolean;
  size?: number;
  color?: string;
}

export const Burger: FC<BurgerProps> = ({
  isOpen = false,
  size = 24,
  color = 'currentColor',
  className,
  ...props
}) => {
  return (
    <span
      className={clsx(styles.burger, className)}
      aria-hidden="true"
      {...props}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={clsx(styles.icon, isOpen && styles.open)}
      >
        <line className={styles.line1} x1="3" y1="6" x2="21" y2="6" />
        <line className={styles.line2} x1="3" y1="12" x2="21" y2="12" />
        <line className={styles.line3} x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </span>
  );
};