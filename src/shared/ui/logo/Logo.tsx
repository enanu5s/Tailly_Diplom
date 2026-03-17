// src/shared/ui/logo/Logo.tsx
import clsx from 'clsx';           // npm install clsx    (очень удобно для классов)

import styles from './Logo.module.css';

import type { FC, HTMLAttributes } from 'react';

export interface LogoProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'light' | 'dark' | 'color';
  size?: 'small' | 'medium' | 'large';
  withText?: boolean;
}

export const Logo: FC<LogoProps> = ({
  variant = 'color',
  size = 'medium',
  withText = true,
  className,
  ...props
}) => {
  const rootClass = clsx(
    styles.logo,
    styles[variant],
    styles[size],
    className
  );

  return (
    <div className={rootClass} {...props}>
      {/* SVG-иконка (можно вставить через <svg> или как компонент) */}
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.icon}
        aria-hidden="true"
      >
        {/* Пример простого логотипа — лапка + хвостик */}
        <path
          d="M20 8C13.373 8 8 13.373 8 20C8 26.627 13.373 32 20 32C26.627 32 32 26.627 32 20C32 13.373 26.627 8 20 8Z"
          fill="currentColor"
          opacity="0.2"
        />
        <path
          d="M15 18C15 16.343 16.343 15 18 15C19.657 15 21 16.343 21 18"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M25 22C25 23.657 23.657 25 22 25C20.343 25 19 23.657 19 22"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M12 28L28 12"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>

      {withText && (
        <span className={styles.text}>Tailly</span>
      )}
    </div>
  );
};
