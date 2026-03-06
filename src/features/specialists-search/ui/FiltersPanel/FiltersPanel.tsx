//src/features/specialists-search/ui/FiltersPanel/FiltersPanel.tsx
import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';

import type { SpecialistsSearchStore } from '../../model/specialistsSearchStore';
import type { PetType } from '../../model/types';
import { specialistsGeoService } from '../../service/specialistsGeoService';
import type { GeoSuggestItem } from '../../api/specialistsGeoApi';

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

  const [cityInput, setCityInput] = useState(store.filters.cityQuery);
  const [districtInput, setDistrictInput] = useState(store.filters.districtQuery);

  const [citySuggestions, setCitySuggestions] = useState<GeoSuggestItem[]>([]);
  const [districtSuggestions, setDistrictSuggestions] = useState<GeoSuggestItem[]>([]);

  const [citySuggestionsLoading, setCitySuggestionsLoading] = useState(false);
  const [districtSuggestionsLoading, setDistrictSuggestionsLoading] = useState(false);

  const cityBlurTimeoutRef = useRef<number | null>(null);
  const districtBlurTimeoutRef = useRef<number | null>(null);

  const isSelectingCitySuggestionRef = useRef(false);
  const isSelectingDistrictSuggestionRef = useRef(false);

  const citySuggestRequestIdRef = useRef(0);
  const districtSuggestRequestIdRef = useRef(0);

  useEffect(() => {
    setCityInput(store.filters.cityQuery);
  }, [store.filters.cityQuery]);

  useEffect(() => {
    setDistrictInput(store.filters.districtQuery);
  }, [store.filters.districtQuery]);

  useEffect(() => {
    const normalizedQuery = cityInput.trim();

    if (normalizedQuery.length < 2) {
      setCitySuggestions([]);
      setCitySuggestionsLoading(false);
      return;
    }

    const requestId = ++citySuggestRequestIdRef.current;

    const timer = window.setTimeout(async () => {
      setCitySuggestionsLoading(true);

      try {
        const items = await specialistsGeoService.suggestCities(normalizedQuery);

        if (requestId !== citySuggestRequestIdRef.current) {
          return;
        }

        setCitySuggestions(items);
      } catch (error) {
        console.error('Ошибка загрузки подсказок городов:', error);

        if (requestId !== citySuggestRequestIdRef.current) {
          return;
        }

        setCitySuggestions([]);
      } finally {
        if (requestId === citySuggestRequestIdRef.current) {
          setCitySuggestionsLoading(false);
        }
      }
    }, 400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [cityInput]);

  useEffect(() => {
    const normalizedDistrictQuery = districtInput.trim();
    const normalizedCityQuery = cityInput.trim();

    if (normalizedDistrictQuery.length < 2) {
      setDistrictSuggestions([]);
      setDistrictSuggestionsLoading(false);
      return;
    }

    const requestId = ++districtSuggestRequestIdRef.current;

    const timer = window.setTimeout(async () => {
      setDistrictSuggestionsLoading(true);

      try {
        const items = await specialistsGeoService.suggestDistricts(
          normalizedDistrictQuery,
          normalizedCityQuery,
        );

        if (requestId !== districtSuggestRequestIdRef.current) {
          return;
        }

        console.log('city suggest items', items);
        console.log('district suggest items', items);

        setDistrictSuggestions(items);
      } catch (error) {
        console.error('Ошибка загрузки подсказок районов:', error);

        if (requestId !== districtSuggestRequestIdRef.current) {
          return;
        }
        setDistrictSuggestions([]);
      } finally {
        if (requestId === districtSuggestRequestIdRef.current) {
          setDistrictSuggestionsLoading(false);
        }
      }
    }, 400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [districtInput, cityInput]);

  useEffect(() => {
    return () => {
      if (cityBlurTimeoutRef.current) {
        window.clearTimeout(cityBlurTimeoutRef.current);
      }

      if (districtBlurTimeoutRef.current) {
        window.clearTimeout(districtBlurTimeoutRef.current);
      }
    };
  }, []);

  const commitCityQuery = (value: string) => {
    const normalizedValue = value.trim();

    setCityInput(normalizedValue);
    setCitySuggestions([]);

    if (normalizedValue === store.filters.cityQuery) {
      return;
    }

    store.updateFilters({
      cityQuery: normalizedValue,
    });
  };

  const commitDistrictQuery = (value: string) => {
    const normalizedValue = value.trim();

    setDistrictInput(normalizedValue);
    setDistrictSuggestions([]);

    if (normalizedValue === store.filters.districtQuery) {
      return;
    }

    store.updateFilters({
      districtQuery: normalizedValue,
    });
  };

  const handleCitySelect = (item: GeoSuggestItem) => {
    const nextValue = item.fullName || item.name || '';

    isSelectingCitySuggestionRef.current = true;

    if (cityBlurTimeoutRef.current) {
      window.clearTimeout(cityBlurTimeoutRef.current);
      cityBlurTimeoutRef.current = null;
    }

    commitCityQuery(nextValue);

    window.setTimeout(() => {
      isSelectingCitySuggestionRef.current = false;
    }, 0);
  };

  const handleDistrictSelect = (item: GeoSuggestItem) => {
    const nextValue = item.name || item.fullName || '';

    isSelectingDistrictSuggestionRef.current = true;

    if (districtBlurTimeoutRef.current) {
      window.clearTimeout(districtBlurTimeoutRef.current);
      districtBlurTimeoutRef.current = null;
    }

    commitDistrictQuery(nextValue);

    window.setTimeout(() => {
      isSelectingDistrictSuggestionRef.current = false;
    }, 0);
  };

  const handleCityBlur = () => {
    if (isSelectingCitySuggestionRef.current) {
      return;
    }

    cityBlurTimeoutRef.current = window.setTimeout(() => {
      if (isSelectingCitySuggestionRef.current) {
        return;
      }

      commitCityQuery(cityInput);
    }, 150);
  };

  const handleDistrictBlur = () => {
    if (isSelectingDistrictSuggestionRef.current) {
      return;
    }

    districtBlurTimeoutRef.current = window.setTimeout(() => {
      if (isSelectingDistrictSuggestionRef.current) {
        return;
      }

      commitDistrictQuery(districtInput);
    }, 150);
  };

  const handleCityKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      if (citySuggestions.length > 0) {
        handleCitySelect(citySuggestions[0]);
        return;
      }

      commitCityQuery(cityInput);
      return;
    }

    if (event.key === 'Escape') {
      setCitySuggestions([]);
    }
  };

  const handleDistrictKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      if (districtSuggestions.length > 0) {
        handleDistrictSelect(districtSuggestions[0]);
        return;
      }

      commitDistrictQuery(districtInput);
      return;
    }

    if (event.key === 'Escape') {
      setDistrictSuggestions([]);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.grid}>
        <div className={styles.field}>
          <div className={styles.label}>Город</div>

          <div className={styles.autocomplete}>
            <input
              className={styles.input}
              value={cityInput}
              onChange={(event) => setCityInput(event.target.value)}
              onKeyDown={handleCityKeyDown}
              onBlur={handleCityBlur}
              placeholder="Начните вводить…"
              autoComplete="off"
            />
            {citySuggestionsLoading && (
              <div className={styles.loading}>Загрузка подсказок…</div>
            )}

            {citySuggestions.length > 0 && (
              <ul className={styles.suggestions}>
                {citySuggestions.map((item, index) => {
                  const primaryText = item.name || item.fullName;
                  const secondaryText =
                    item.fullName && item.fullName !== item.name ? item.fullName : '';

                  return (
                    <li
                      key={`${item.fullName || item.name || 'city'}-${index}`}
                      className={styles.suggestionItem}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        handleCitySelect(item);
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
            )}
          </div>
        </div>

        <div className={styles.field}>
          <div className={styles.label}>Район</div>

          <div className={styles.autocomplete}>
            <input
              className={styles.input}
              value={districtInput}
              onChange={(event) => setDistrictInput(event.target.value)}
              onKeyDown={handleDistrictKeyDown}
              onBlur={handleDistrictBlur}
              placeholder="Начните вводить…"
              autoComplete="off"
            />

            {districtSuggestionsLoading && (
              <div className={styles.loading}>Загрузка подсказок…</div>
            )}

            {districtSuggestions.length > 0 && (
              <ul className={styles.suggestions}>
                {districtSuggestions.map((item, index) => {
                  const primaryText = item.name || item.fullName;
                  const secondaryText =
                    item.fullName && item.fullName !== item.name ? item.fullName : '';

                  return (
                    <li
                      key={`${item.fullName || item.name || 'district'}-${index}`}
                      className={styles.suggestionItem}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        handleDistrictSelect(item);
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
            )}
          </div>
        </div>
        <div className={styles.field}>
          <div className={styles.label}>С</div>
          <input
            className={styles.input}
            type="date"
            value={store.filters.dateRange.from ?? ''}
            onChange={(event) =>
              store.updateFilters({
                dateRange: {
                  ...store.filters.dateRange,
                  from: event.target.value || null,
                },
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
            onChange={(event) =>
              store.updateFilters({
                dateRange: {
                  ...store.filters.dateRange,
                  to: event.target.value || null,
                },
              })
            }
          />
        </div>

        <div className={styles.field}>
          <div className={styles.label}>Тип питомца</div>
          <select
            className={styles.select}
            value={store.filters.petType}
            onChange={(event) =>
              store.updateFilters({
                petType: event.target.value as PetType | 'any',
              })
            }
          >
            {PETS.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.title}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <div className={styles.label}>Услуга</div>
          <select
            className={styles.select}
            value={store.filters.serviceId}
            onChange={(event) =>
              store.updateFilters({
                serviceId: event.target.value as ServiceId | 'any',
              })
            }
          >
            <option value="any">Любая</option>
            {SERVICES.map((service) => (
              <option key={service.id} value={service.id}>
                {service.title}
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
            onChange={(event) =>
              store.updateFilters({
                priceMin:
                  event.target.value.trim() === ''
                    ? null
                    : Number(event.target.value),
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
            onChange={(event) =>
              store.updateFilters({
                priceMax:
                  event.target.value.trim() === ''
                    ? null
                    : Number(event.target.value),
              })
            }
            placeholder="100"
          />
        </div>
      </div>

      <button
        type="button"
        className={styles.moreBtn}
        onClick={() => setExpanded((value) => !value)}
      >
        {expanded ? 'Скрыть дополнительные фильтры' : 'Дополнительные фильтры'}
      </button>

      {expanded && <AdditionalFilters store={store} />}
    </div >
  );
});