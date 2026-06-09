// src/shared/ui/header/Header.tsx
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { authService } from '@/features/auth/service/authService';
import { useAuth } from '@/features/auth/model/useAuth';
import { getMessagesViewerFromUser, messagesUnreadStore } from '@/features/messages';
import { MESSAGES_UPDATED_EVENT } from '@/features/messages/model/messagesEvents';
import { shopCartStore } from '@/features/shop';
import { mainNav } from '@/shared/config/navigation';
import { shouldShowShopConsumerControls } from '@/shared/lib/auth/roleAccess';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import styles from './Header.module.css';
import { DropdownMenu } from '../dropdown/DropdownMenu.tsx';
import { Burger } from '../icons/Burger.tsx';
import { Logo } from '../logo/Logo.tsx';

export const Header = observer(() => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useAppNavigate();

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

  const shopBadgeCount = shouldShowShopConsumerControls(user)
    ? shopCartStore.totalItems
    : 0;
  const navItems = mainNav.filter(
    (item) => item.to !== '/messages' && item.to !== '/login',
  );

  const toggleMobile = (): void => {
    setIsMobileOpen((prev) => !prev);
  };

  const renderNavBadge = (itemTo: string) => {
    if (itemTo === '/messages' && messagesBadgeCount > 0) {
      return <span className={styles.navBadge}>{messagesBadgeCount}</span>;
    }

    if (itemTo === '/shop' && shopBadgeCount > 0) {
      return <span className={styles.navBadge}>{shopBadgeCount}</span>;
    }

    return null;
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logoLink} aria-label="Перейти на главную">
          <Logo size="large" variant="dark" />
        </Link>

        <nav className={styles.navDesktop} aria-label="Основное меню">
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
                    {renderNavBadge(item.to)}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.rightDesktop}>
          {isAuth ? (
            <div className={styles.userBox}>
              <Link
                to="/messages"
                className={styles.messagesLink}
                aria-label={
                  messagesBadgeCount > 0
                    ? `Открыть сообщения, непрочитанных: ${messagesBadgeCount}`
                    : 'Открыть сообщения'
                }
              >
                <img
                  className={styles.messagesIcon}
                  src="/icons/tabler_message.svg"
                  alt=""
                  aria-hidden="true"
                />
                {messagesBadgeCount > 0 ? (
                  <span className={styles.messagesBadge}>{messagesBadgeCount}</span>
                ) : null}
              </Link>

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
                      {renderNavBadge(item.to)}
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            <div className={styles.mobileAuthBox}>
              {isAuth ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileOpen(false)}
                    className={styles.mobileProfileLink}
                  >
                    {user?.name ?? user?.email ?? 'Профиль'}
                  </Link>

                  <button
                    type="button"
                    className={styles.mobileAuthButton}
                    onClick={() => {
                      authService.logout();
                      messagesUnreadStore.reset();
                      setIsMobileOpen(false);
                      navigate('/', { replace: true });
                    }}
                  >
                    Выйти
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMobileOpen(false)}
                  className={styles.mobileAuthButton}
                >
                  Войти
                </Link>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
});
