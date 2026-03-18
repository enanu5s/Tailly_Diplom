// src/shared/ui/header/Header.tsx
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { authService } from '@/features/auth/model/authService';
import { useAuth } from '@/features/auth/model/useAuth';
import {
  getMessagesViewerFromUser,
  messagesUnreadStore,
} from '@/features/messages';
import { MESSAGES_UPDATED_EVENT } from '@/features/messages/model/messagesEvents';
import { mainNav } from '@/shared/config/navigation';

import styles from './Header.module.css';
import { DropdownMenu } from '../dropdown/DropdownMenu.tsx';
import { Burger } from '../icons/Burger.tsx';
import { Logo } from '../logo/Logo.tsx';

export const Header = observer(() => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { isAuth, user } = useAuth();

  const messagesViewer = useMemo(() => getMessagesViewerFromUser(user), [user]);

  useEffect(() => {
    if (!isAuth || !messagesViewer.userId) {
      messagesUnreadStore.reset();
      return;
    }

    void messagesUnreadStore.refresh(messagesViewer);

    const handleMessagesUpdated = (): void => {
      void messagesUnreadStore.refresh(messagesViewer);
    };

    const handleStorage = (event: StorageEvent): void => {
      if (
        event.key === 'tailly_messages_threads' ||
        event.key === 'tailly_messages_messages'
      ) {
        void messagesUnreadStore.refresh(messagesViewer);
      }
    };

    window.addEventListener(MESSAGES_UPDATED_EVENT, handleMessagesUpdated);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(MESSAGES_UPDATED_EVENT, handleMessagesUpdated);
      window.removeEventListener('storage', handleStorage);
    };
  }, [isAuth, messagesViewer]);

  const messagesBadgeCount =
    user?.role === 'admin' || user?.role === 'super_admin'
      ? messagesUnreadStore.unreadThreadsCount
      : messagesUnreadStore.unreadMessagesCount;

  const navItems = mainNav
    .filter((item) => (isAuth ? true : item.to !== '/messages'))
    .filter((item) => item.to !== '/login');

  const toggleMobile = (): void => {
    setIsMobileOpen((prev) => !prev);
  };

  const renderMessagesBadge = (itemTo: string) => {
    if (itemTo !== '/messages' || messagesBadgeCount <= 0) {
      return null;
    }

    return <span className={styles.messagesBadge}>{messagesBadgeCount}</span>;
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
                    <span>{item.label}</span>
                    {renderMessagesBadge(item.to)}
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
                onClick={() => {
                  authService.logout();
                  messagesUnreadStore.reset();
                  setIsMobileOpen(false);
                  navigate('/', { replace: true });
                }}
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

        {isMobileOpen ? (
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
                      <span>{item.label}</span>
                      {renderMessagesBadge(item.to)}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </header>
  );
});