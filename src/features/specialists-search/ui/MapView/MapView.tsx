// src/features/specialists-search/ui/MapView/MapView.tsx

import { observer } from 'mobx-react-lite';

import { GisMap } from './2gisMap';
import styles from './MapView.module.css';
import { SpecialistCard } from '../SpecialistsList/SpecialistCard';

import type { SpecialistsSearchStore } from '../../model/specialistsSearchStore';

type Props = {
  store: SpecialistsSearchStore;
  onOpenSpecialist: (id: string) => void;
};

export const MapView = observer(({ store, onOpenSpecialist }: Props) => {
  const hasResults = store.filtered.length > 0;

  return (
    <div className={styles.root}>
      <div className={styles.listPane}>
        {!hasResults ? (
          <div className={styles.emptyState}>
            Никого не найдено — попробуйте изменить фильтры.
          </div>
        ) : (
          <div className={styles.list}>
            {store.filtered.map((sp) => (
              <SpecialistCard
                key={sp.id}
                specialist={sp}
                currentServiceId={store.filters.serviceId}
                currentPetType={store.filters.petType}
                onClick={() => onOpenSpecialist(sp.id)}
              />
            ))}
          </div>
        )}
      </div>

      <div className={styles.mapPane}>
        <GisMap store={store} onOpenSpecialist={onOpenSpecialist} />
      </div>
    </div>
  );
});