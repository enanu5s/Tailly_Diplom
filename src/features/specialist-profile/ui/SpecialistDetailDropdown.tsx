// src/features/specialist-profile/ui/SpecialistDetailDropdown.tsx

import { useEffect, useRef, useState } from 'react';

import styles from './SpecialistDetailDropdown.module.css';

type DropdownOption<TValue extends string> = {
  value: TValue;
  label: string;
};

function ChevronIcon() {
  return (
    <svg
      className={styles.chevron}
      viewBox="0 0 12 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M1 1.5L6 6.5L11 1.5"
        stroke="currentColor"
        strokeWidth="1.58"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function useOutsideClickAndEscape(
  ref: React.RefObject<HTMLElement | null>,
  isOpen: boolean,
  close: () => void,
): void {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointer = (event: MouseEvent): void => {
      const node = ref.current;

      if (node && !node.contains(event.target as Node)) {
        close();
      }
    };

    const handleKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);

    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [ref, isOpen, close]);
}

type DetailSingleSelectProps<TValue extends string> = {
  value: TValue;
  options: ReadonlyArray<DropdownOption<TValue>>;
  onChange: (next: TValue) => void;
  ariaLabel?: string;
  placeholder?: string;
};

export function DetailSingleSelect<TValue extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  placeholder = 'Не выбрано',
}: DetailSingleSelectProps<TValue>): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useOutsideClickAndEscape(rootRef, isOpen, () => setIsOpen(false));

  const selectedOption = options.find((option) => option.value === value);
  const displayLabel = selectedOption?.label ?? '';

  return (
    <div
      ref={rootRef}
      className={`${styles.dropdown} ${isOpen ? styles.dropdownOpen : ''}`}
    >
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span
          className={`${styles.triggerLabel} ${
            displayLabel ? '' : styles.triggerPlaceholder
          }`}
        >
          {displayLabel || placeholder}
        </span>
        <ChevronIcon />
      </button>

      {isOpen ? (
        <div className={styles.panel} role="listbox">
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`${styles.optionRow} ${
                  isSelected ? styles.optionRowSelected : ''
                }`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

type DetailMultiSelectProps<TValue extends string> = {
  values: ReadonlyArray<TValue>;
  options: ReadonlyArray<DropdownOption<TValue>>;
  onToggle: (value: TValue) => void;
  onToggleAll: () => void;
  ariaLabel?: string;
  allLabel?: string;
  emptyLabel?: string;
};

export function DetailMultiSelect<TValue extends string>({
  values,
  options,
  onToggle,
  onToggleAll,
  ariaLabel,
  allLabel = 'Любой',
  emptyLabel = 'Не выбрано',
}: DetailMultiSelectProps<TValue>): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useOutsideClickAndEscape(rootRef, isOpen, () => setIsOpen(false));

  const allSelected = options.length > 0 && values.length === options.length;
  const selectedLabels = options
    .filter((option) => values.includes(option.value))
    .map((option) => option.label);

  let triggerText: string;
  if (allSelected) {
    triggerText = allLabel;
  } else if (selectedLabels.length === 0) {
    triggerText = emptyLabel;
  } else {
    triggerText = selectedLabels.join(', ');
  }

  return (
    <div
      ref={rootRef}
      className={`${styles.dropdown} ${isOpen ? styles.dropdownOpen : ''}`}
    >
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span
          className={`${styles.triggerLabel} ${
            selectedLabels.length === 0 && !allSelected
              ? styles.triggerPlaceholder
              : ''
          }`}
        >
          {triggerText}
        </span>
        <ChevronIcon />
      </button>

      {isOpen ? (
        <div
          className={styles.panel}
          role="listbox"
          aria-multiselectable="true"
        >
          <label
            className={`${styles.optionRow} ${styles.optionRowCheck} ${
              allSelected ? styles.optionRowSelected : ''
            }`}
          >
            <input
              type="checkbox"
              className={styles.optionCheckbox}
              checked={allSelected}
              onChange={onToggleAll}
            />
            <span>{allLabel}</span>
          </label>

          {options.map((option) => {
            const isChecked = values.includes(option.value);

            return (
              <label
                key={option.value}
                className={`${styles.optionRow} ${styles.optionRowCheck} ${
                  isChecked ? styles.optionRowSelected : ''
                }`}
              >
                <input
                  type="checkbox"
                  className={styles.optionCheckbox}
                  checked={isChecked}
                  onChange={() => onToggle(option.value)}
                />
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
