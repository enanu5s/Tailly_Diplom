// src/shared/ui/header/Header.tsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';

import { useAuth } from '@/features/auth/model/useAuth';
import { authService } from '@/features/auth/model/authService';
import { mainNav } from '@/shared/config/navigation';

import { DropdownMenu } from '../dropdown/DropdownMenu.tsx';
import { Burger } from '../icons/Burger.tsx';
import { Logo } from '../logo/Logo.tsx';
import styles from './Header.module.css';

export const Header = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const { isAuth, user } = useAuth();

  const navItems = mainNav
    .filter((item) => (isAuth ? true : item.to !== '/messages'))
    .filter((item) => item.to !== '/login');

  const toggleMobile = () => {
    setIsMobileOpen((prev) => !prev);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <Logo />
        </Link>

        <nav className={styles.navDesktop}>
          <ul className={styles.navList}>
            {navItems.map((item) => (
              <li key={item.to} className={styles.navItem}>
                {item.children ? (
                  <DropdownMenu
                    label={item.label}
                    items={item.children}
                    isActive={location.pathname === '/services'}
                  />
                ) : (
                  <Link
                    to={item.to}
                    className={clsx(
                      styles.navLink,
                      location.pathname === item.to && styles.active,
                    )}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

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

        <button
          type="button"
          className={styles.burger}
          onClick={toggleMobile}
          aria-label={isMobileOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={isMobileOpen}
          aria-controls="mobile-menu"
        >
          <Burger isOpen={isMobileOpen} />
        </button>

        {isMobileOpen && (
          <div id="mobile-menu" className={styles.mobileMenu}>
            <ul className={styles.mobileNavList}>
              {navItems.map((item) => (
                <li key={item.to}>
                  {item.children ? (
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