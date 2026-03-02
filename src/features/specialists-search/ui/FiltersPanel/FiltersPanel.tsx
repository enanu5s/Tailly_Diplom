// src/features/specialists-search/ui/FiltersPanel/FiltersPanel.tsx

import { observer } from 'mobx-react-lite';
import { useMemo, useState } from 'react';

import type { SpecialistsSearchStore } from '../../model/specialistsSearchStore';
import type { PetType } from '../../model/types';

import { SERVICES } from '@/shared/config/services';
import type { ServiceId } from '@/shared/config/services';

import { AdditionalFilters } from './AdditionalFilters';
import styles from './FiltersPanel.module.css';

type Props = { store: SpecialistsSearchStore };

const PETS: Array<{ id: PetType | 'any'; title: string }> = [
  { id: 'any', title: 'Любой' },
  { id: 'dog', title: 'Собака' },
  { id: 'cat', title: 'Кошка' },
  { id: 'other', title: 'Другой' },
];

export const FiltersPanel = observer(({ store }: Props) => {
  const [expanded, setExpanded] = useState(false);

  const citySuggestions = useMemo(() => ['Рига', 'Юрмала', 'Лиепая', 'Даугавпилс'], []);
  const districtSuggestions = useMemo(() => ['Центр', 'Пурвциемс', 'Иманта', 'Кенгарагс'], []);

  return (
    <div className={styles.root}>
      <div className={styles.grid}>
        <div className={styles.field}>
          <div className={styles.label}>Город</div>
          <input
            className={styles.input}
            value={store.filters.cityQuery}
            onChange={(e) => store.updateFilters({ cityQuery: e.target.value })}
            list="city-suggest"
            placeholder="Начните вводить…"
          />
          <datalist id="city-suggest">
            {citySuggestions.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        <div className={styles.field}>
          <div className={styles.label}>Район</div>
          <input
            className={styles.input}
            value={store.filters.districtQuery}
            onChange={(e) => store.updateFilters({ districtQuery: e.target.value })}
            list="district-suggest"
            placeholder="Начните вводить…"
          />
          <datalist id="district-suggest">
            {districtSuggestions.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
        </div>

        <div className={styles.field}>
          <div className={styles.label}>С</div>
          <input
            className={styles.input}
            type="date"
            value={store.filters.dateRange.from ?? ''}
            onChange={(e) =>
              store.updateFilters({
                dateRange: { ...store.filters.dateRange, from: e.target.value || null },
              })
            }
          />
        </div>

        <div className={styles.field}>
          <div className={styles.label}>До</div>
          <input
            className={styles.input}
            type="date"
            value={store.filters.dateRange.to ?? ''}
            onChange={(e) =>
              store.updateFilters({
                dateRange: { ...store.filters.dateRange, to: e.target.value || null },
              })
            }
          />
        </div>

        <div className={styles.field}>
          <div className={styles.label}>Тип питомца</div>
          <select
            className={styles.select}
            value={store.filters.petType}
            onChange={(e) =>
              store.updateFilters({
                petType: e.target.value as PetType | 'any',
              })
            }
          >
            {PETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <div className={styles.label}>Услуга</div>
          <select
            className={styles.select}
            value={store.filters.serviceId}
            onChange={(e) =>
              store.updateFilters({
                serviceId: e.target.value as ServiceId | 'any',
              })
            }
          >
            <option value="any">Любая</option>
            {SERVICES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <div className={styles.label}>Цена от</div>
          <input
            className={styles.input}
            inputMode="numeric"
            value={store.filters.priceMin ?? ''}
            onChange={(e) =>
              store.updateFilters({
                priceMin: e.target.value.trim() === '' ? null : Number(e.target.value),
              })
            }
            placeholder="0"
          />
        </div>

        <div className={styles.field}>
          <div className={styles.label}>Цена до</div>
          <input
            className={styles.input}
            inputMode="numeric"
            value={store.filters.priceMax ?? ''}
            onChange={(e) =>
              store.updateFilters({
                priceMax: e.target.value.trim() === '' ? null : Number(e.target.value),
              })
            }
            placeholder="100"
          />
        </div>
      </div>

      <button type="button" className={styles.moreBtn} onClick={() => setExpanded((v) => !v)}>
        {expanded ? 'Скрыть дополнительные фильтры' : 'Дополнительные фильтры'}
      </button>

      {expanded && <AdditionalFilters store={store} />}
    </div>
  );
});