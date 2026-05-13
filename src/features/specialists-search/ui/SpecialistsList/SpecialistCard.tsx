//src/features/specialists-search/ui/SpecialistsList/SpecialistCard.tsx

import styles from './SpecialistCard.module.css';

import type { Specialist, PetType, ServiceId } from '../../model/types';

type Props = {
  specialist: Specialist;
  currentServiceId: ServiceId | 'any';
  currentPetType: PetType | 'any';
  onClick: () => void;
};

function getMinPrice(
  sp: Specialist,
  serviceId: ServiceId | 'any',
  petType: PetType | 'any',
): number | null {
  const candidates = sp.services.filter((s) => {
    if (serviceId !== 'any' && s.serviceId !== serviceId) return false;
    if (petType !== 'any' && !s.petTypes.includes(petType)) return false;
    return true;
  });
  if (candidates.length === 0) return null;
  return Math.min(...candidates.map((c) => c.priceFrom));
}

export function SpecialistCard({
  specialist,
  currentServiceId,
  currentPetType,
  onClick,
}: Props) {
  const minPrice = getMinPrice(specialist, currentServiceId, currentPetType);

  return (
    <button type="button" className={styles.card} onClick={onClick}>
      <div className={styles.cardInner}>
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

        <div className={styles.main}>
          <div className={styles.name}>{specialist.name}</div>
          <div className={styles.place}>
            {specialist.city}, {specialist.district}
          </div>
          <div className={styles.rating}>
            <span className={styles.star} aria-hidden="true">
              <img
                className={styles.starIcon}
                src="/images/specialist-profile/Star.svg"
                alt=""
              />
            </span>
            <span className={styles.ratingValue}>{specialist.rating.toFixed(2)}</span>
            <span className={styles.reviews}>{specialist.reviewsCount} отзывов</span>
          </div>
        </div>

        <div className={styles.aside}>
          <div className={styles.priceBlock}>
            {minPrice != null ? (
              <>
                <div className={styles.priceMain}>
                  от {minPrice.toLocaleString('ru-RU')} ₽
                </div>
                <div className={styles.priceHint}>за услугу</div>
              </>
            ) : (
              <div className={styles.priceMain}>—</div>
            )}
          </div>
          <span className={styles.cta}>Записаться на услугу</span>
        </div>
      </div>
    </button>
  );
}
