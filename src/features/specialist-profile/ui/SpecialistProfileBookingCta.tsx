// src/features/specialist-profile/ui/SpecialistProfileBookingCta.tsx

import styles from './SpecialistProfileBookingCta.module.css';

type SpecialistProfileBookingCtaProps = {
  onStartBooking: () => void;
};

export function SpecialistProfileBookingCta(
  props: SpecialistProfileBookingCtaProps,
) {
  return (
    <section className={styles.card} aria-label="Быстрое оформление бронирования">
      <div className={styles.content}>
        <div className={styles.text}>
          <h3 className={styles.title}>Готовы оформить заказ?</h3>
          <p className={styles.description}>
            Выберите услугу и свободное время в один шаг.
          </p>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={props.onStartBooking}
          >
            Забронировать
          </button>
        </div>
      </div>
    </section>
  );
}
