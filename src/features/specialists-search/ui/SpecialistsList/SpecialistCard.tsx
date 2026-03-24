//src/features/specialists-search/ui/SpecialistsList/SpecialistCard.tsx

import {
  countAvailableCalendarSlots,
  getNextAvailableCalendarSlot,
} from '../../data/mockSpecialistCalendar';
import styles from './SpecialistCard.module.css';

import type { Specialist, PetType, ServiceId } from '../../model/types';

function formatRuShortDate(iso: string): string {
  const parts = iso.trim().split('-');
  if (parts.length !== 3) {
    return iso;
  }
  const [y, m, d] = parts;
  return `${d}.${m}.${y?.slice(2) ?? ''}`;
}

type Props = {
  specialist: Specialist;
  currentServiceId: ServiceId | 'any';
  currentPetType: PetType | 'any';
  onClick: () => void;
};

function getPriceText(
  sp: Specialist,
  serviceId: ServiceId | 'any',
  petType: PetType | 'any',
) {
  const candidates = sp.services.filter((s) => {
    if (serviceId !== 'any' && s.serviceId !== serviceId) return false;
    if (petType !== 'any' && !s.petTypes.includes(petType)) return false;
    return true;
  });
  if (candidates.length === 0) return '—';
  const min = Math.min(...candidates.map((c) => c.priceFrom));
  return `${min} ₽`;
}

export function SpecialistCard({
  specialist,
  currentServiceId,
  currentPetType,
  onClick,
}: Props) {
  const priceText = getPriceText(specialist, currentServiceId, currentPetType);
  const freeSlots = countAvailableCalendarSlots(specialist.calendarSlots);
  const nextFree = getNextAvailableCalendarSlot(specialist.calendarSlots);

  return (
    <button type="button" className={styles.card} onClick={onClick}>
      <div className={styles.price}>{priceText}</div>

      <div className={styles.top}>
        <div className={styles.avatarWrap}>
          {specialist.avatarUrl ? (
            <img
              className={styles.avatar}
              src={specialist.avatarUrl}
              alt={specialist.name}
            />
          ) : (
            <div className={styles.avatarPlaceholder} />
          )}
        </div>

        <div className={styles.meta}>
          <div className={styles.name}>{specialist.name}</div>
          <div className={styles.place}>
            {specialist.city}, {specialist.district}
          </div>
          <div className={styles.rating}>
            <span className={styles.ratingValue}>{specialist.rating.toFixed(1)}</span>
            <span className={styles.reviews}>({specialist.reviewsCount} отзывов)</span>
          </div>
        </div>
      </div>

      <div className={styles.desc}>{specialist.description}</div>

      {freeSlots > 0 && nextFree ? (
        <div className={styles.scheduleHint}>
          Свободных окон: {freeSlots} · ближайшее: {formatRuShortDate(nextFree.date)}{' '}
          {nextFree.startTime}–{nextFree.endTime}
        </div>
      ) : null}
    </button>
  );
}
