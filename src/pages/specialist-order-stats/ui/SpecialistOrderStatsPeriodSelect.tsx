// src/pages/specialist-order-stats/ui/SpecialistOrderStatsPeriodSelect.tsx

import { useEffect, useRef, useState } from 'react';

import type { StatsPeriod } from '../lib/computeSpecialistOrderStats';

import styles from './SpecialistOrderStatsPeriodSelect.module.css';

import type { ReactElement } from 'react';

export type PeriodOption = { value: StatsPeriod; label: string };

type Props = {
  options: PeriodOption[];
  value: StatsPeriod;
  onChange: (value: StatsPeriod) => void;
};

export function SpecialistOrderStatsPeriodSelect({
  options,
  value,
  onChange,
}: Props): ReactElement {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onDocPointerDown = (event: PointerEvent): void => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', onDocPointerDown);
    return () => document.removeEventListener('pointerdown', onDocPointerDown);
  }, [open]);

  const currentLabel = options.find((o) => o.value === value)?.label ?? '';

  return (
    <div
      ref={rootRef}
      className={styles.root}
      data-open={open ? 'true' : 'false'}
    >
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.triggerLabel}>{currentLabel}</span>
        <span className={styles.chevron} aria-hidden />
      </button>

      {open ? (
        <ul className={styles.list} role="listbox" aria-label="Выбор периода">
          {options.map((opt) => {
            const selected = opt.value === value;
            return (
              <li key={opt.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={styles.option}
                  data-selected={selected ? 'true' : 'false'}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  {opt.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
