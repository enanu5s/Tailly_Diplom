// src/pages/admin-change-email/ui/AdminChangeEmailConfirmPage.tsx
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

import { adminProfileStore } from '@/features/admin-profile';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import styles from './AdminChangeEmailPage.module.css';

import type { ReactElement } from 'react';

export const AdminChangeEmailConfirmPage = observer((): ReactElement => {
  const navigate = useAppNavigate();
  const store = adminProfileStore;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    void store.load();
  }, [store]);

  if (store.isLoading && !store.profile) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.stateCard}>Загрузка...</div>
        </div>
      </div>
    );
  }

  if (!store.isSuperAdmin || !store.profile) {
    return <Navigate to="/admin/profile" replace />;
  }

  if (store.emailChangePhase !== 'code') {
    return <Navigate to="/admin/profile/security/email" replace />;
  }

  const profile = store.profile;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <button
          className={styles.backBtn}
          type="button"
          onClick={() => {
            store.backEmailChangeToCredentials();
            navigate('/admin/profile/security/email');
          }}
        >
          <svg
            className={styles.backIcon}
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M10.2531 3.44143C10.0901 3.27852 9.86918 3.18701 9.63879 3.18701C9.4084 3.18701 9.18744 3.27852 9.02448 3.44143L3.81698 8.64893C3.73616 8.72958 3.67203 8.82535 3.62828 8.93078C3.58453 9.0362 3.56201 9.14922 3.56201 9.26336C3.56201 9.37751 3.58453 9.49053 3.62828 9.59595C3.67203 9.70137 3.73616 9.79715 3.81698 9.8778L9.02448 15.0853C9.18838 15.2436 9.40788 15.3312 9.63572 15.3292C9.86355 15.3272 10.0815 15.2357 10.2426 15.0746C10.4037 14.9135 10.4952 14.6955 10.4972 14.4677C10.4992 14.2399 10.4116 14.0204 10.2531 13.8564L6.5286 10.1319H15.825C16.0552 10.1319 16.276 10.0405 16.4388 9.87774C16.6015 9.71499 16.693 9.49422 16.693 9.26399C16.693 9.03375 16.6015 8.81298 16.4388 8.65023C16.276 8.48749 16.0552 8.39605 15.825 8.39605H6.5286L10.2531 4.6703C10.416 4.50734 10.5075 4.28638 10.5075 4.05599C10.5075 3.8256 10.416 3.60439 10.2531 3.44143Z"
              fill="currentColor"
            />
          </svg>
          Назад
        </button>

        <div className={`${styles.card} ${styles.cardConfirm}`}>
          <h2 className={styles.h2}>Смена email</h2>

          <p className={`${styles.lead} ${styles.leadConfirm}`}>
            Шаг 2 из 2
            <br />
            Введите код из письма, отправленного на {profile.email}
          </p>

          <div className={`${styles.field} ${styles.rowCode}`}>
            <div className={styles.label}>Код подтверждения</div>
            <input
              className={`${styles.input} ${styles.inputPlain}`}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={store.emailChangeCode}
              onChange={(event) => store.setEmailChangeField('code', event.target.value)}
              placeholder="000000"
            />
          </div>

          {store.emailChangeInfoMessage ? (
            <div className={styles.infoBanner}>{store.emailChangeInfoMessage}</div>
          ) : null}

          {store.emailChangeMockHint ? (
            <div className={styles.mockHint}>
              Демо-режим: код —{' '}
              <span className={styles.mockHintCode}>{store.emailChangeMockHint}</span>
            </div>
          ) : null}

          {store.emailChangeError ? (
            <div className={styles.error}>{store.emailChangeError}</div>
          ) : null}

          <button
            className={styles.primaryBtn}
            type="button"
            disabled={!store.canSubmitEmailChangeConfirm}
            onClick={async () => {
              await store.confirmSuperAdminEmailChange();
              if (!store.emailChangeError && store.emailChangePhase === 'credentials') {
                navigate('/admin/profile');
              }
            }}
          >
            {store.isConfirmingEmailChange ? 'Проверяем...' : 'Подтвердить'}
          </button>
        </div>
      </div>
    </div>
  );
});
