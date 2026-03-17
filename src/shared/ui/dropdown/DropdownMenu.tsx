// src/shared/ui/dropdown/DropdownMenu.tsx
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import styles from './DropdownMenu.module.css';

import type { FC } from 'react';

export interface NavItem {
  label: string;
  to: string;
}

interface DropdownMenuProps {
  label: string;
  items: NavItem[];
  isActive?: boolean;
  isMobile?: boolean;
  onClose?: () => void;
  className?: string;
}

const CLOSE_DELAY_MS = 150;

export const DropdownMenu: FC<DropdownMenuProps> = ({
  label,
  items,
  isActive = false,
  isMobile = false,
  onClose,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<number | null>(null);

  const clearCloseTimer = () => {
    if (closeTimerRef.current != null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setIsOpen(false);
      closeTimerRef.current = null;
    }, CLOSE_DELAY_MS);
  };

  // Закрытие при клике вне компонента
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // уборка таймера при размонтировании
  useEffect(() => {
    return () => {
      clearCloseTimer();
    };
  }, []);

  // Мобильный режим — только клик
  const handleTriggerClick = () => {
    if (!isMobile) return;
    setIsOpen((prev) => !prev);
  };

  // Десктоп: hover на одном wrapper + задержка закрытия
  const handleMouseEnter = () => {
    if (isMobile) return;
    clearCloseTimer();
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    scheduleClose();
  };

  const handleItemClick = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  return (
    <div
      ref={ref}
      className={clsx(
        styles.dropdown,
        isMobile ? styles.mobileMode : styles.desktopMode,
        className,
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        className={clsx(styles.trigger, isActive && styles.active, isOpen && styles.open)}
        onClick={handleTriggerClick}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {label}
        <span className={styles.arrow} />
      </button>

      {isOpen && (
        <ul
          className={styles.menu}
          // на всякий случай: если курсор попал на меню после ухода с кнопки — не закрываем
          onMouseEnter={() => {
            if (!isMobile) clearCloseTimer();
          }}
          onMouseLeave={() => {
            if (!isMobile) scheduleClose();
          }}
        >
          {items.map((item) => (
            <li key={item.to} className={styles.item}>
              <Link to={item.to} className={styles.link} onClick={handleItemClick}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};