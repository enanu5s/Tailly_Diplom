// src/features/specialists-search/ui/LocalitySuggestInput/LocalitySuggestInput.tsx

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

import type { GeoSuggestItem } from '../../api/specialistsGeoApi';
import { specialistsGeoService } from '../../service/specialistsGeoService';

import styles from './LocalitySuggestInput.module.css';

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Например класс поля из родительского CSS Module */
  inputClassName?: string;
  required?: boolean;
  id?: string;
};

function labelsMatch(a: string, b: string): boolean {
  return a.trim() === b.trim();
}

/**
 * Ввод населённого пункта с подсказками 2GIS (города, ПГТ, прочие НП).
 * Можно выбрать из списка или ввести текст вручную.
 * После выбора из списка подсказки для того же текста не запрашиваются.
 */
export function LocalitySuggestInput({
  value,
  onChange,
  placeholder,
  inputClassName,
  required,
  id,
}: Props) {
  const [suggestions, setSuggestions] = useState<GeoSuggestItem[]>([]);
  const [loading, setLoading] = useState(false);
  /** Пока значение совпадает с последним выбором из 2GIS — не дергаем suggests */
  const [pickedLabel, setPickedLabel] = useState<string | null>(null);
  /** Не запрашивать подсказки до фокуса поля (избегаем запроса при открытии редактирования) */
  const [allowSuggest, setAllowSuggest] = useState(false);

  const blurTimeoutRef = useRef<number | null>(null);
  const isSelectingRef = useRef(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        window.clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!allowSuggest) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const q = value.trim();

    if (q.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    if (pickedLabel !== null && labelsMatch(value, pickedLabel)) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;

    const timer = window.setTimeout(async () => {
      setLoading(true);

      try {
        const items = await specialistsGeoService.suggestLocalities(q);

        if (requestId !== requestIdRef.current) {
          return;
        }

        setSuggestions(items);
      } catch (error) {
        console.error('Ошибка подсказок населённых пунктов 2GIS:', error);

        if (requestId !== requestIdRef.current) {
          return;
        }

        setSuggestions([]);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    }, 400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [value, pickedLabel, allowSuggest]);

  const handleInputChange = (next: string) => {
    setAllowSuggest(true);

    if (pickedLabel !== null && !labelsMatch(next, pickedLabel)) {
      setPickedLabel(null);
    }

    onChange(next);
  };

  const handleSelect = (item: GeoSuggestItem) => {
    const nextValue = item.fullName || item.name || '';

    requestIdRef.current += 1;
    setAllowSuggest(true);

    isSelectingRef.current = true;

    if (blurTimeoutRef.current) {
      window.clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }

    setPickedLabel(nextValue.trim());
    setSuggestions([]);
    setLoading(false);
    onChange(nextValue);

    window.setTimeout(() => {
      isSelectingRef.current = false;
    }, 0);
  };

  const handleBlur = () => {
    if (isSelectingRef.current) {
      return;
    }

    blurTimeoutRef.current = window.setTimeout(() => {
      if (isSelectingRef.current) {
        return;
      }

      setSuggestions([]);
    }, 150);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      if (suggestions.length > 0) {
        handleSelect(suggestions[0]);
      }

      return;
    }

    if (event.key === 'Escape') {
      setSuggestions([]);
    }
  };

  const suggestionsOpen = suggestions.length > 0 || loading;

  return (
    <div
      className={styles.wrap}
      data-suggestions-open={suggestionsOpen ? '' : undefined}
    >
      <input
        id={id}
        className={inputClassName}
        value={value}
        onChange={(event) => handleInputChange(event.target.value)}
        onFocus={() => setAllowSuggest(true)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        autoComplete="off"
        aria-autocomplete="list"
        required={required}
      />
      {loading ? <div className={styles.hint}>Загрузка из 2GIS…</div> : null}
      {suggestions.length > 0 ? (
        <ul className={styles.suggestions} role="listbox">
          {suggestions.map((item, index) => {
            const primaryText = item.name || item.fullName;
            const secondaryText =
              item.fullName && item.fullName !== item.name ? item.fullName : '';

            return (
              <li
                key={`${item.id ?? 'noid'}-${primaryText}-${index}`}
                className={styles.suggestionItem}
                role="option"
                onMouseDown={(event) => {
                  event.preventDefault();
                  handleSelect(item);
                }}
              >
                <span className={styles.suggestionPrimary}>{primaryText}</span>
                {secondaryText ? (
                  <span className={styles.suggestionSecondary}>
                    {' '}
                    — {secondaryText}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
