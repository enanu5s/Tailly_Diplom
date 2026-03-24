// src/features/specialist-profile/ui/SpecialistProfileBookingCta.tsx

import styles from './SpecialistProfileBookingCta.module.css';

import type { ReactElement } from 'react';

type Props = {
  onStartBooking: () => void;
};

export function SpecialistProfileBookingCta({ onStartBooking }: Props): ReactElement {
  return (
    <section className={styles.card} aria-labelledby="specialist-booking-cta-title">
      <div className={styles.content}>
        <div className={styles.text}>
          <h2 id="specialist-booking-cta-title" className={styles.title}>
            Готовы оформить услугу?
          </h2>
          <p className={styles.description}>
            Выберите услугу, питомца, дату и время. После создания заказ сразу появится у
            вас в профиле.
          </p>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.primaryButton} onClick={onStartBooking}>
            Оформить заказ
          </button>
        </div>
      </div>
    </section>
  );
}
