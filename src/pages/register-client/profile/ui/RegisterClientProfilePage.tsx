//src/pages/register-client/profile/ui/RegisterClientProfilePage.tsx

import { useEffect, useRef, useState } from "react";


import { registerService } from "@/features/auth/model/registerService";
import { useRegisterFlow } from "@/features/auth/model/useRegisterFlow";
import type { GeoSuggestItem } from "@/features/specialists-search/api/specialistsGeoApi";
import { specialistsGeoService } from "@/features/specialists-search/service/specialistsGeoService";
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import styles from "../../RegisterClient.module.css";

export const RegisterClientProfilePage = () => {
  const navigate = useAppNavigate();
  const flow = useRegisterFlow();

  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");

  const [cityInput, setCityInput] = useState("");
  const [selectedLocality, setSelectedLocality] = useState<GeoSuggestItem | null>(
    null,
  );
  const [localitySuggestions, setLocalitySuggestions] = useState<
    GeoSuggestItem[]
  >([]);
  const [localitySuggestionsLoading, setLocalitySuggestionsLoading] =
    useState(false);

  const localityBlurTimeoutRef = useRef<number | null>(null);
  const isSelectingLocalityRef = useRef(false);
  const localitySuggestRequestIdRef = useRef(0);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!flow.verificationToken)
      navigate("/register/client", { replace: true });
  }, [flow.verificationToken, navigate]);

  useEffect(() => {
    const normalizedQuery = cityInput.trim();

    if (normalizedQuery.length < 2) {
      setLocalitySuggestions([]);
      setLocalitySuggestionsLoading(false);
      return;
    }

    if (selectedLocality) {
      const chosen =
        (selectedLocality.fullName || selectedLocality.name || "").trim();

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
        const items =
          await specialistsGeoService.suggestLocalities(normalizedQuery);

        if (requestId !== localitySuggestRequestIdRef.current) {
          return;
        }

        setLocalitySuggestions(items);
        setError(null);
      } catch (err: unknown) {
        if (requestId !== localitySuggestRequestIdRef.current) {
          return;
        }

        setLocalitySuggestions([]);

        const message =
          err instanceof Error
            ? err.message
            : "Не удалось загрузить подсказки городов";

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

  const onCityInputChange = (value: string) => {
    setCityInput(value);

    if (selectedLocality) {
      const label =
        selectedLocality.fullName || selectedLocality.name || "";

      if (value.trim() !== label.trim()) {
        setSelectedLocality(null);
      }
    }
  };

  const handleLocalitySelect = (item: GeoSuggestItem) => {
    const nextValue = item.fullName || item.name || "";

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

  const handleLocalityBlur = () => {
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

  const handleLocalityKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();

      if (localitySuggestions.length > 0) {
        handleLocalitySelect(localitySuggestions[0]);
      }

      return;
    }

    if (event.key === "Escape") {
      setLocalitySuggestions([]);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!flow.verificationToken) return;

    if (!selectedLocality) {
      setError("Выберите населённый пункт из списка подсказок 2GIS");
      return;
    }

    const cityId = specialistsGeoService.localityToCityId(selectedLocality);

    setLoading(true);
    try {
      await registerService.complete(
        flow.verificationToken,
        firstName.trim(),
        lastName.trim(),
        middleName,
        cityId,
      );
      navigate("/", { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Ошибка завершения регистрации";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          ← Назад
        </button>

        <h1 className={styles.title}>Заполните профиль</h1>
        <p className={styles.subtitle}>Шаг 3 из 3 — это займет минуту</p>

        <div className={styles.card}>
          <form className={styles.form} onSubmit={onSubmit}>
            <input
              className={styles.input}
              placeholder="Фамилия"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              autoComplete="family-name"
            />

            <input
              className={styles.input}
              placeholder="Имя"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              autoComplete="given-name"
            />

            <input
              className={styles.input}
              placeholder="Отчество (при наличии)"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
              autoComplete="additional-name"
            />

            <div className={styles.fieldLabel}>Населённый пункт</div>
            <div className={styles.autocomplete}>
              <input
                className={styles.input}
                value={cityInput}
                onChange={(e) => onCityInputChange(e.target.value)}
                onKeyDown={handleLocalityKeyDown}
                onBlur={handleLocalityBlur}
                placeholder="Начните вводить название…"
                autoComplete="off"
                required
                aria-autocomplete="list"
              />
              {localitySuggestionsLoading && (
                <div className={styles.suggestLoading}>
                  Загрузка из 2GIS…
                </div>
              )}

              {localitySuggestions.length > 0 && (
                <ul className={styles.suggestions} role="listbox">
                  {localitySuggestions.map((item, index) => {
                    const primaryText = item.name || item.fullName;
                    const secondaryText =
                      item.fullName && item.fullName !== item.name
                        ? item.fullName
                        : "";

                    return (
                      <li
                        key={`${item.id ?? "noid"}-${primaryText}-${index}`}
                        className={styles.suggestionItem}
                        role="option"
                        onMouseDown={(event) => {
                          event.preventDefault();
                          handleLocalitySelect(item);
                        }}
                      >
                        <span className={styles.suggestionPrimary}>
                          {primaryText}
                        </span>
                        {secondaryText ? (
                          <span className={styles.suggestionSecondary}>
                            {" "}
                            — {secondaryText}
                          </span>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button
              className={styles.submitButton}
              disabled={loading || localitySuggestionsLoading}
              type="submit"
            >
              {loading ? "Сохраняем..." : "Завершить регистрацию"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
