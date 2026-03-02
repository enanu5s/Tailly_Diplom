// src/shared/ui/header/Header.tsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { mainNav } from '@/shared/config/navigation';
import { Logo } from '../logo/Logo.tsx';           // создайте отдельно
import { Burger } from '../icons/Burger.tsx';     // иконки лучше в shared/ui/icons
import { DropdownMenu } from '../dropdown/DropdownMenu.tsx';
import styles from './Header.module.css';     // CSS-модули
import clsx from 'clsx';
import { useAuth } from '@/features/auth/model/useAuth';
import { authService } from '@/features/auth/model/authService';

export const Header = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const { isAuth, user } = useAuth();

  const navItems = mainNav
    .filter((item) => (isAuth ? true : item.to !== '/messages'))
    .filter((item) => item.to !== '/login');

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
            {navItems.map((item) => (
              <li key={item.to} className={styles.navItem}>
                {item.children ? (
                  <DropdownMenu
                    label={item.label}
                    items={item.children}
                    isActive={
                      location.pathname === '/services'
                    }
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

        {/* Правая часть (десктоп) */}
        <div className={styles.rightDesktop}>
          {isAuth ? (
            <div className={styles.userBox}>
              <Link to="/profile" className={styles.userName}>
                {user?.name ?? user?.email ?? 'Профиль'}
              </Link>

              <button
                type="button"
                className={styles.logoutBtn}
                onClick={() => authService.logout()}
              >
                Выйти
              </button>
            </div>
          ) : (
            <Link to="/login" className={styles.loginBtn}>
              Войти
            </Link>
          )}
        </div>

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
              {navItems.map((item) => (
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