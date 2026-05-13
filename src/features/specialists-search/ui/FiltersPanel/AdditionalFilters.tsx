//src/features/specialists-search/ui/FiltersPanel/AdditionalFilters.tsx

import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useId, useRef, useState, type RefObject } from 'react';

import styles from './AdditionalFilters.module.css';

import type { SpecialistsSearchStore } from '../../model/specialistsSearchStore';
import type { PetAgeCategory, PetSizeCategory } from '../../model/types';

type Props = { store: SpecialistsSearchStore };

function useDropdownDismiss(
  open: boolean,
  close: () => void,
  rootRef: RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        close();
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, close, rootRef]);
}

const PET_SIZE_ORDER: PetSizeCategory[] = ['under_2', '2_to_8', '8_15', '15_25', 'over_25'];

const PET_SIZE_LABELS: Record<PetSizeCategory, string> = {
  under_2: 'Менее 2 кг',
  '2_to_8': '2 - 8 кг',
  '8_15': '8 - 15 кг',
  '15_25': '15 - 25 кг',
  over_25: 'Более 25 кг',
};

function petSizeHeaderText(sizes: PetSizeCategory[]): string {
  if (sizes.length === 0) {
    return 'Любой';
  }
  return [...sizes]
    .sort((a, b) => PET_SIZE_ORDER.indexOf(a) - PET_SIZE_ORDER.indexOf(b))
    .map((s) => PET_SIZE_LABELS[s])
    .join(', ');
}

function togglePetSize(current: PetSizeCategory[], cat: PetSizeCategory): PetSizeCategory[] {
  if (current.includes(cat)) {
    return current.filter((c) => c !== cat);
  }
  return [...current, cat];
}

const PET_AGE_ORDER: PetAgeCategory[] = ['under_6mo', '6mo_to_2', '2_to_5', 'over_5'];

const PET_AGE_LABELS: Record<PetAgeCategory, string> = {
  under_6mo: 'Менее 6 месяцев',
  '6mo_to_2': '6 мес - 2 года',
  '2_to_5': '2 - 5 лет',
  over_5: 'Более 5 лет',
};

function petAgeHeaderText(ages: PetAgeCategory[]): string {
  if (ages.length === 0) {
    return 'Любой';
  }
  return [...ages]
    .sort((a, b) => PET_AGE_ORDER.indexOf(a) - PET_AGE_ORDER.indexOf(b))
    .map((s) => PET_AGE_LABELS[s])
    .join(', ');
}

function togglePetAge(current: PetAgeCategory[], cat: PetAgeCategory): PetAgeCategory[] {
  if (current.includes(cat)) {
    return current.filter((c) => c !== cat);
  }
  return [...current, cat];
}

const PetSizeDropdown = observer(({ store }: Props) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const petSizes = store.filters.petSizes;

  const close = useCallback(() => setOpen(false), []);
  useDropdownDismiss(open, close, rootRef);

  return (
    <div ref={rootRef} className={styles.petSizeDropdown}>
      <button
        type="button"
        className={clsx(styles.petSizeTrigger, open && styles.petSizeTriggerOpen)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={listboxId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.petSizeHeaderText}>{petSizeHeaderText(petSizes)}</span>
        <span
          className={clsx(styles.petSizeChevron, open && styles.petSizeChevronOpen)}
          aria-hidden
        />
      </button>

      {open ? (
        <div id={listboxId} className={styles.petSizeList} role="group" aria-label="Размер питомца">
          {PET_SIZE_ORDER.map((cat) => {
            const checked = petSizes.includes(cat);
            return (
              <label
                key={cat}
                className={clsx(styles.petSizeRow, checked && styles.petSizeRowChecked)}
              >
                <input
                  type="checkbox"
                  className={styles.petSizeCheckbox}
                  checked={checked}
                  onChange={() =>
                    store.updateFilters({ petSizes: togglePetSize(petSizes, cat) })
                  }
                />
                <span className={styles.petSizeRowLabel}>{PET_SIZE_LABELS[cat]}</span>
              </label>
            );
          })}
          <label className={clsx(styles.petSizeRow, styles.petSizeRowAny)}>
            <input
              type="checkbox"
              className={styles.petSizeCheckbox}
              checked={petSizes.length === 0}
              onChange={(e) => {
                if (e.target.checked) {
                  store.updateFilters({ petSizes: [] });
                }
              }}
            />
            <span className={styles.petSizeRowLabel}>Любой</span>
          </label>
        </div>
      ) : null}
    </div>
  );
});

const PetAgeDropdown = observer(({ store }: Props) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const petAges = store.filters.petAges;

  const close = useCallback(() => setOpen(false), []);
  useDropdownDismiss(open, close, rootRef);

  return (
    <div ref={rootRef} className={styles.petAgeDropdown}>
      <button
        type="button"
        className={clsx(styles.petAgeTrigger, open && styles.petAgeTriggerOpen)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.petAgeHeaderText}>{petAgeHeaderText(petAges)}</span>
        <span
          className={clsx(styles.petAgeChevron, open && styles.petAgeChevronOpen)}
          aria-hidden
        />
      </button>

      {open ? (
        <div id={listId} className={styles.petAgeList} role="group" aria-label="Возраст питомца">
          {PET_AGE_ORDER.map((cat) => {
            const checked = petAges.includes(cat);
            return (
              <label
                key={cat}
                className={clsx(styles.petAgeRow, checked && styles.petAgeRowChecked)}
              >
                <input
                  type="checkbox"
                  className={styles.petAgeCheckbox}
                  checked={checked}
                  onChange={() =>
                    store.updateFilters({ petAges: togglePetAge(petAges, cat) })
                  }
                />
                <span className={styles.petAgeRowLabel}>{PET_AGE_LABELS[cat]}</span>
              </label>
            );
          })}
          <label className={clsx(styles.petAgeRow, styles.petAgeRowAny)}>
            <input
              type="checkbox"
              className={styles.petAgeCheckbox}
              checked={petAges.length === 0}
              onChange={(e) => {
                if (e.target.checked) {
                  store.updateFilters({ petAges: [] });
                }
              }}
            />
            <span className={styles.petAgeRowLabel}>Любой</span>
          </label>
        </div>
      ) : null}
    </div>
  );
});

export const AdditionalFilters = observer(({ store }: Props) => {
  return (
    <div className={styles.root}>
      <div className={styles.row}>
        <div className={styles.field}>
          <div className={styles.label}>Размер питомца</div>
          <PetSizeDropdown store={store} />
        </div>

        <div className={styles.field}>
          <div className={styles.label}>Возраст питомца</div>
          <PetAgeDropdown store={store} />
        </div>

        <div className={styles.field}>
          <div className={styles.label}>Опыт от (кол-во лет)</div>
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
