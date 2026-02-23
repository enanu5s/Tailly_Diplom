// src/shared/ui/dropdown/DropdownMenu.tsx
import { useRef, useState, useEffect } from 'react';           // значения + типы
import type { HTMLAttributes, FC } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import styles from './DropdownMenu.module.css';

export interface NavItem {
  label: string;
  to: string;
}

interface DropdownMenuProps {
  label: string;
  items: NavItem[];
  isActive?: boolean;          // подсветка, если текущий путь начинается с этого раздела
  isMobile?: boolean;          // режим мобильного меню (всегда клик, без hover)
  onClose?: () => void;        // для мобильного — закрыть бургер после выбора
  className?: string;
}

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

  // Закрытие при клике вне компонента (важно для десктопа)
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

  // Для десктопа — hover, для мобильного — только клик
  const handleToggle = () => {
    if (isMobile) {
      setIsOpen(prev => !prev);
    }
  };

  const handleMouseEnter = () => {
    if (!isMobile) setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (!isMobile) setIsOpen(false);
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
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        className={clsx(
          styles.trigger,
          isActive && styles.active,
          isOpen && styles.open
        )}
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {label}
        <span className={styles.arrow} />
      </button>

      {isOpen && (
        <ul className={styles.menu}>
          {items.map(item => (
            <li key={item.to} className={styles.item}>
              <Link
                to={item.to}
                className={styles.link}
                onClick={handleItemClick}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};