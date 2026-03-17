//src/pages/register-client/verify/ui/RegisterClientVerifyPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { registerService } from "@/features/auth/model/registerService";
import { useRegisterFlow } from "@/features/auth/model/useRegisterFlow";

import styles from "../../RegisterClient.module.css";

export const RegisterClientVerifyPage = () => {
  const navigate = useNavigate();
  const flow = useRegisterFlow();

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // если сюда попали без шага 1
  useEffect(() => {
    if (!flow.registrationId) navigate("/register/client", { replace: true });
  }, [flow.registrationId, navigate]);

  const onSubmit = async (error: React.FormEvent) => {
    error.preventDefault();
    setError(null);

    if (!flow.registrationId) return;

    setLoading(true);
    try {
      await registerService.verify(flow.registrationId, code);
      navigate("/register/client/profile");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Ошибка проверки кода";
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

        <h1 className={styles.title}>Подтверждение почты</h1>
        <p className={styles.subtitle}>Шаг 2 из 3 — введите код из письма</p>

        <div className={styles.card}>
          <form className={styles.form} onSubmit={onSubmit}>
            <input
              className={styles.input}
              inputMode="numeric"
              placeholder="Код (6 цифр)"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />

            {error && <div className={styles.error}>{error}</div>}

            <button
              className={styles.submitButton}
              disabled={loading}
              type="submit"
            >
              {loading ? "Проверяем..." : "Подтвердить"}
            </button>

            <div className={styles.actionsRow}>
              <button
                type="button"
                className={styles.linkButton}
                onClick={() => {
                  // в мок-режиме просто подсказка; в реале дергаем resend endpoint
                  setError("Код отправлен повторно (мок). Код: 123456");
                }}
              >
                Отправить код еще раз
              </button>

              <button
                type="button"
                className={styles.linkButton}
                onClick={() => {
                  registerService.resetFlow();
                  navigate("/register/client", { replace: true });
                }}
              >
                Начать заново
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
