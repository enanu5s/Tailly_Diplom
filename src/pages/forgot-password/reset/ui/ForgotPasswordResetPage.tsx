//src/pages/forgot-password/reset/ui/ForgotPasswordResetPage.tsx

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../../ForgotPassword.module.css";
import { usePasswordRecoveryFlow } from "@/features/auth/model/usePasswordRecoveryFlow";
import { passwordRecoveryService } from "@/features/auth/model/passwordRecoveryService";

export const ForgotPasswordResetPage = () => {
  const navigate = useNavigate();
  const flow = usePasswordRecoveryFlow();

  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!flow.resetToken) navigate("/forgot-password", { replace: true });
  }, [flow.resetToken, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!flow.resetToken) return;

    if (p1.length < 6) {
      setError("Пароль должен быть минимум 6 символов");
      return;
    }
    if (p1 !== p2) {
      setError("Пароли не совпадают");
      return;
    }

    setLoading(true);
    try {
      await passwordRecoveryService.reset(flow.resetToken, p1);
      // после смены пароля обычно кидают на логин
      navigate("/login", { replace: true });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Не удалось обновить пароль";

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

        <h1 className={styles.title}>Новый пароль</h1>
        <p className={styles.subtitle}>Шаг 3 из 3 — придумайте новый пароль</p>

        <div className={styles.card}>
          <form className={styles.form} onSubmit={onSubmit}>
            <input
              className={styles.input}
              type="password"
              placeholder="Новый пароль"
              value={p1}
              onChange={(e) => setP1(e.target.value)}
              required
            />

            <input
              className={styles.input}
              type="password"
              placeholder="Повторите новый пароль"
              value={p2}
              onChange={(e) => setP2(e.target.value)}
              required
            />

            {error && <div className={styles.error}>{error}</div>}

            <button
              className={styles.submitButton}
              disabled={loading}
              type="submit"
            >
              {loading ? "Сохраняем..." : "Сохранить пароль"}
            </button>

            <div className={styles.hint}>
              Есть аккаунт? <Link to="/login">Войти</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
