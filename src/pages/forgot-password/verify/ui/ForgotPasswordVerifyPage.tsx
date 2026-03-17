//src/pages/forgot-password/verify/ui/ForgotPasswordVerifyPage.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../../ForgotPassword.module.css";
import { usePasswordRecoveryFlow } from "@/features/auth/model/usePasswordRecoveryFlow";
import { passwordRecoveryService } from "@/features/auth/model/passwordRecoveryService";

export const ForgotPasswordVerifyPage = () => {
  const navigate = useNavigate();
  const flow = usePasswordRecoveryFlow();

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!flow.recoveryId) navigate("/forgot-password", { replace: true });
  }, [flow.recoveryId, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!flow.recoveryId) return;

    setLoading(true);
    try {
      await passwordRecoveryService.verify(flow.recoveryId, code);
      navigate("/forgot-password/reset");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Не удалось проверить код";

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

        <h1 className={styles.title}>Подтвердите почту</h1>
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
              {loading ? "Проверяем..." : "Продолжить"}
            </button>

            <div className={styles.actionsRow}>
              <button
                type="button"
                className={styles.linkButton}
                onClick={() =>
                  setError("Код отправлен повторно (мок). Код: 123456")
                }
              >
                Отправить код ещё раз
              </button>

              <button
                type="button"
                className={styles.linkButton}
                onClick={() => {
                  passwordRecoveryService.resetFlow();
                  navigate("/forgot-password", { replace: true });
                }}
              >
                Начать заново
              </button>
            </div>

            <div className={styles.hint}>
              Вспомнили пароль? <Link to="/login">Войти</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
