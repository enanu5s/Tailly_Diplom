// src/shared/ui/header/Header.tsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { mainNav } from '@/shared/config/navigation';
import { Logo } from '../logo/Logo.tsx';           // создайте отдельно
import { Burger } from '../icons/Burger.tsx';     // иконки лучше в shared/ui/icons
import { DropdownMenu } from '../dropdown/DropdownMenu.tsx';
import styles from './Header.module.css';     // CSS-модули
import clsx from 'clsx';

export const Header = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Логотип */}
        <Link to="/" className={styles.logo}>
          <Logo />
        </Link>

        {/* Десктопное меню */}
        <nav className={styles.navDesktop}>
          <ul className={styles.navList}>
            {mainNav.map((item) => (
              <li key={item.to} className={styles.navItem}>
                {item.children ? (
                  <DropdownMenu 
                    label={item.label} 
                    items={item.children} 
                    isActive={location.pathname.startsWith(item.to)}
                  />
                ) : (
                    <Link
                        to={item.to}
                        className={clsx(
                            styles.navLink,
                            location.pathname === item.to && styles.active
                        )}
                        >
                        {item.label}
                    </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Кнопка бургер (только мобильные) */}
        <button 
          className={styles.burger} 
          onClick={toggleMobile}
          aria-label="Открыть меню"
        >
          <Burger isOpen={isMobileOpen} />
        </button>

        {/* Мобильное меню (выезжает/появляется) */}
        {isMobileOpen && (
          <div className={styles.mobileMenu}>
            <ul className={styles.mobileNavList}>
              {mainNav.map((item) => (
                <li key={item.to}>
                  {item.children ? (
                    // В мобильном — тоже дропдаун или просто список подуслуг
                    <DropdownMenu 
                      label={item.label} 
                      items={item.children} 
                      isMobile 
                      onClose={() => setIsMobileOpen(false)}
                    />
                  ) : (
                    <Link 
                      to={item.to} 
                      onClick={() => setIsMobileOpen(false)}
                      className={styles.mobileLink}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};