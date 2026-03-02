//src/features/specialists-search/ui/SpecialistsList/SpecialistsList.tsx

import { observer } from 'mobx-react-lite';
import type { SpecialistsSearchStore } from '../../model/specialistsSearchStore';
import { SpecialistCard } from './SpecialistCard';
import styles from './SpecialistsList.module.css';

type Props = {
  store: SpecialistsSearchStore;
  onOpenSpecialist: (id: string) => void;
};

export const SpecialistsList = observer(({ store, onOpenSpecialist }: Props) => {
  if (store.loading) {
    return <div className={styles.state}>Загрузка…</div>;
  }
  if (store.error) {
    return <div className={styles.state}>Ошибка: {store.error}</div>;
  }
  if (store.filtered.length === 0) {
    return <div className={styles.state}>Никого не найдено — попробуйте изменить фильтры.</div>;
  }

  return (
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
  );
});