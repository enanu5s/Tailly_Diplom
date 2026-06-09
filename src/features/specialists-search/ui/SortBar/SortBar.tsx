//src/features/specialists-search/ui/SortBar/SortBar.tsx

import { observer } from 'mobx-react-lite';

import styles from './SortBar.module.css';

import type { SpecialistsSearchStore } from '../../model/specialistsSearchStore';

type Props = { store: SpecialistsSearchStore };

export const SortBar = observer(({ store }: Props) => {
  const isMap = store.viewMode === 'map';

  return (
    <div className={styles.root}>
      <div className={styles.sort}>
        <span className={styles.label}>Сортировка:</span>

        <button
          type="button"
          className={store.sortMode === 'rating' ? styles.active : styles.btn}
          onClick={() => store.setSortMode('rating')}
        >
          по рейтингу
        </button>

        <button
          type="button"
          className={store.sortMode === 'price' ? styles.active : styles.btn}
          onClick={() => store.setSortMode('price')}
        >
          по цене
        </button>
      </div>

      <button
        type="button"
        className={styles.mapBtn}
        onClick={() => store.setViewMode(isMap ? 'list' : 'map')}
      >
        {isMap ? 'Показать списком' : 'Показать на карте'}
      </button>
    </div>
  );
});
