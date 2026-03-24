//src/features/specialists-search/ui/FiltersPanel/AdditionalFilters.tsx

import { observer } from 'mobx-react-lite';

import styles from './AdditionalFilters.module.css';

import type { SpecialistsSearchStore } from '../../model/specialistsSearchStore';

type Props = { store: SpecialistsSearchStore };

export const AdditionalFilters = observer(({ store }: Props) => {
  return (
    <div className={styles.root}>
      <div className={styles.row}>
        <div className={styles.block}>
          <div className={styles.label}>Опыт (лет) от</div>
          <input
            className={styles.input}
            inputMode="numeric"
            value={store.filters.experienceMinYears ?? ''}
            onChange={(e) =>
              store.updateFilters({
                experienceMinYears: e.target.value === '' ? null : Number(e.target.value),
              })
            }
            placeholder="0"
          />
        </div>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={store.filters.hasReviewsOnly}
            onChange={(e) => store.updateFilters({ hasReviewsOnly: e.target.checked })}
          />
          <span>Только с отзывами</span>
        </label>
      </div>
    </div>
  );
});
