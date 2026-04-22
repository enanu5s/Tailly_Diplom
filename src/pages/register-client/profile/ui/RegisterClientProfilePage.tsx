// src/pages/register-client/profile/ui/RegisterClientProfilePage.tsx

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactElement,
} from 'react';

import { registerService } from '@/features/auth/model/registerService';
import { useRegisterFlow } from '@/features/auth/model/useRegisterFlow';
import type { GeoSuggestItem } from '@/features/specialists-search/api/specialistsGeoApi';
import { specialistsGeoService } from '@/features/specialists-search/service/specialistsGeoService';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import styles from '../../RegisterClient.module.css';

export const RegisterClientProfilePage = (): ReactElement => {
  const navigate = useAppNavigate();
  const flow = useRegisterFlow();

  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');

  const [cityInput, setCityInput] = useState('');
  const [selectedLocality, setSelectedLocality] = useState<GeoSuggestItem | null>(null);
  const [localitySuggestions, setLocalitySuggestions] = useState<GeoSuggestItem[]>([]);
  const [localitySuggestionsLoading, setLocalitySuggestionsLoading] = useState(false);

  const localityBlurTimeoutRef = useRef<number | null>(null);
  const isSelectingLocalityRef = useRef(false);
  const localitySuggestRequestIdRef = useRef(0);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!flow.verificationToken) {
      navigate('/register/client', { replace: true });
    }
  }, [flow.verificationToken, navigate]);

  useEffect(() => {
    const normalizedQuery = cityInput.trim();

    if (normalizedQuery.length < 2) {
      setLocalitySuggestions([]);
      setLocalitySuggestionsLoading(false);
      return;
    }

    if (selectedLocality) {
      const chosen = (selectedLocality.fullName || selectedLocality.name || '').trim();

      if (chosen && normalizedQuery === chosen) {
        setLocalitySuggestions([]);
        setLocalitySuggestionsLoading(false);
        return;
      }
    }

    const requestId = ++localitySuggestRequestIdRef.current;

    const timer = window.setTimeout(async () => {
      setLocalitySuggestionsLoading(true);

      try {
        const items = await specialistsGeoService.suggestLocalities(normalizedQuery);

        if (requestId !== localitySuggestRequestIdRef.current) {
          return;
        }

        setLocalitySuggestions(items);
        setError(null);
      } catch (submissionError: unknown) {
        if (requestId !== localitySuggestRequestIdRef.current) {
          return;
        }

        setLocalitySuggestions([]);

        const message =
          submissionError instanceof Error
            ? submissionError.message
            : 'Не удалось загрузить подсказки городов';

        setError(message);
      } finally {
        if (requestId === localitySuggestRequestIdRef.current) {
          setLocalitySuggestionsLoading(false);
        }
      }
    }, 400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [cityInput, selectedLocality]);

  useEffect(() => {
    return () => {
      if (localityBlurTimeoutRef.current) {
        window.clearTimeout(localityBlurTimeoutRef.current);
      }
    };
  }, []);

  const onCityInputChange = (value: string): void => {
    setCityInput(value);

    if (selectedLocality) {
      const label = selectedLocality.fullName || selectedLocality.name || '';

      if (value.trim() !== label.trim()) {
        setSelectedLocality(null);
      }
    }
  };

  const handleLocalitySelect = (item: GeoSuggestItem): void => {
    const nextValue = item.fullName || item.name || '';

    localitySuggestRequestIdRef.current += 1;
    isSelectingLocalityRef.current = true;

    if (localityBlurTimeoutRef.current) {
      window.clearTimeout(localityBlurTimeoutRef.current);
      localityBlurTimeoutRef.current = null;
    }

    setCityInput(nextValue);
    setSelectedLocality(item);
    setLocalitySuggestions([]);
    setLocalitySuggestionsLoading(false);

    window.setTimeout(() => {
      isSelectingLocalityRef.current = false;
    }, 0);
  };

  const handleLocalityBlur = (): void => {
    if (isSelectingLocalityRef.current) {
      return;
    }

    localityBlurTimeoutRef.current = window.setTimeout(() => {
      if (isSelectingLocalityRef.current) {
        return;
      }

      setLocalitySuggestions([]);
    }, 150);
  };

  const handleLocalityKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      event.preventDefault();

      if (localitySuggestions.length > 0) {
        handleLocalitySelect(localitySuggestions[0]);
      }

      return;
    }

    if (event.key === 'Escape') {
      setLocalitySuggestions([]);
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);

    if (!flow.verificationToken) {
      return;
    }

    const normalizedCityInput = cityInput.trim();

    if (!normalizedCityInput) {
      setError('Введите населённый пункт');
      return;
    }

    const cityId = selectedLocality
      ? specialistsGeoService.localityToCityId(selectedLocality)
      : normalizedCityInput;

    const cityLabel = selectedLocality
      ? (selectedLocality.fullName || selectedLocality.name || '').trim()
      : normalizedCityInput;

    setLoading(true);

    try {
      await registerService.complete(
        flow.verificationToken,
        firstName.trim(),
        lastName.trim(),
        middleName,
        cityId,
        cityLabel,
      );

      navigate('/', { replace: true });
    } catch (submissionError: unknown) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : 'Ошибка завершения регистрации';

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.background} aria-hidden="true" />
      <button className={styles.backButton} type="button" onClick={() => navigate(-1)}>
        <span className={styles.backIcon}>←</span>
        <span>Назад</span>
      </button>
      <div className={styles.layout}>
        <div className={styles.stack}>
          <div className={styles.cardWrap}>
            <span className={styles.backgroundBlobLeft} aria-hidden="true" />
            <span className={styles.backgroundBlobRight} aria-hidden="true" />

            <div className={`${styles.card} ${styles.cardWithPets}`}>
              <div className={styles.cardInner}>
                <div className={styles.header}>
                  <h1 className={styles.title}>Заполнение профиля</h1>
                  <p className={styles.subtitle}>Шаг 3 из 3 — введите ваши данные</p>
                </div>

                <form className={styles.form} onSubmit={onSubmit}>
                  <label className={styles.field}>
                    <input
                      className={styles.input}
                      placeholder="Имя"
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      required
                      autoComplete="given-name"
                    />
                  </label>

                  <label className={styles.field}>
                    <input
                      className={styles.input}
                      placeholder="Фамилия"
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      required
                      autoComplete="family-name"
                    />
                  </label>

                  <label className={styles.field}>
                    <input
                      className={styles.input}
                      placeholder="Отчество (не обязательно)"
                      value={middleName}
                      onChange={(event) => setMiddleName(event.target.value)}
                      autoComplete="additional-name"
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Выберите город</span>

                    <div className={styles.autocomplete}>
                      <input
                        className={styles.input}
                        value={cityInput}
                        onChange={(event) => onCityInputChange(event.target.value)}
                        onKeyDown={handleLocalityKeyDown}
                        onBlur={handleLocalityBlur}
                        placeholder="Начните вводить название..."
                        autoComplete="off"
                        required
                        aria-autocomplete="list"
                      />

                      {localitySuggestionsLoading ? (
                        <div className={styles.suggestLoading}>Загрузка из 2GIS…</div>
                      ) : null}

                      {localitySuggestions.length > 0 ? (
                        <ul className={styles.suggestions} role="listbox">
                          {localitySuggestions.map((item, index) => {
                            const primaryText = item.name || item.fullName;
                            const secondaryText =
                              item.fullName && item.fullName !== item.name
                                ? item.fullName
                                : '';

                            return (
                              <li
                                key={`${item.id ?? 'noid'}-${primaryText}-${index}`}
                                className={styles.suggestionItem}
                                role="option"
                                onMouseDown={(mouseEvent) => {
                                  mouseEvent.preventDefault();
                                  handleLocalitySelect(item);
                                }}
                              >
                                <span className={styles.suggestionPrimary}>
                                  {primaryText}
                                </span>
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
                  </label>

                  {!selectedLocality && cityInput.trim() ? (
                    <div className={styles.mutedHint}>
                      Подсказки недоступны — город будет сохранён по введённому значению.
                    </div>
                  ) : null}

                  {error ? <div className={styles.error}>{error}</div> : null}

                  <button
                    className={styles.submitButton}
                    disabled={loading || localitySuggestionsLoading}
                    type="submit"
                  >
                    {loading ? 'Сохраняем...' : 'Завершить регистрацию'}
                  </button>

                  <div className={styles.petsDecor} aria-hidden="true">
                    <img
                      className={styles.petLeft}
                      src="/images/register-client/Group_dog.svg"
                      alt=""
                    />
                    <img
                      className={styles.petRight}
                      src="/images/register-client/Group_cat.svg"
                      alt=""
                    />
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
