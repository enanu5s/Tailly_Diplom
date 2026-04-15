import clsx from 'clsx';
import type { FC, HTMLAttributes } from 'react';

import styles from './Logo.module.css';

export interface LogoProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'light' | 'dark' | 'color';
  size?: 'small' | 'medium' | 'large';
  withText?: boolean;
}

const LOGO_SRC_BY_VARIANT: Record<NonNullable<LogoProps['variant']>, string> = {
  light: '/icons/logo-light.svg',
  dark: '/icons/logo-dark.svg',
  color: '/icons/logo-color.svg',
};

export const Logo: FC<LogoProps> = ({
  variant = 'color',
  size = 'medium',
  className,
  ...props
}) => {
  const rootClass = clsx(styles.logo, styles[variant], styles[size], className);
  const logoSrc = LOGO_SRC_BY_VARIANT[variant];

  return (
    <div className={rootClass} {...props}>
      <img src={logoSrc} alt="Tailly" className={styles.image} />
    </div>
  );
};