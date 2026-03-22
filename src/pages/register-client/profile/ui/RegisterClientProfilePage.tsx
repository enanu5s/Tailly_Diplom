//src/pages/register-client/profile/ui/RegisterClientProfilePage.tsx

import { useEffect, useState } from "react";
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import type { City } from "@/features/auth/api/registerApi";
import { registerService } from "@/features/auth/model/registerService";
import { useRegisterFlow } from "@/features/auth/model/useRegisterFlow";

import styles from "../../RegisterClient.module.css";

export const RegisterClientProfilePage = () => {
  const navigate = useAppNavigate();
  const flow = useRegisterFlow();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [cityId, setCityId] = useState("");

  const [cities, setCities] = useState<City[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // если сюда попали без верификации
  useEffect(() => {
    if (!flow.verificationToken)
      navigate("/register/client", { replace: true });
  }, [flow.verificationToken, navigate]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setCitiesLoading(true);
        const list = await registerService.loadCities();

        if (!alive) {
          return;
        }

        setCities(list);
        setCityId(list[0]?.id ?? "");
      } catch (error: unknown) {
        if (!alive) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Не удалось загрузить города";

        setError(message);
      } finally {
        if (alive) {
          setCitiesLoading(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!flow.verificationToken) return;
    if (!cityId) {
      setError("Выберите город");
      return;
    }

    setLoading(true);
    try {
      await registerService.complete(
        flow.verificationToken,
        firstName,
        lastName,
        cityId,
      );
      navigate("/", { replace: true }); // сразу залогинились
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
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
              placeholder="Имя"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />

            <input
              className={styles.input}
              placeholder="Фамилия"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />

            <select
              className={styles.select}
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              disabled={citiesLoading}
              required
            >
              {citiesLoading ? (
                <option value="">Загрузка городов...</option>
              ) : (
                cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))
              )}
            </select>

            {error && <div className={styles.error}>{error}</div>}

            <button
              className={styles.submitButton}
              disabled={loading || citiesLoading}
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
