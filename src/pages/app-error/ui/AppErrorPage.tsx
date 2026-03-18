// src/pages/app-error/AppErrorPage.tsx
import { isRouteErrorResponse, useNavigate, useRouteError } from "react-router-dom";

import styles from "./AppErrorPage.module.css";

function getErrorMessage(error: unknown): string {
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return "Страница не найдена или была перемещена.";
    }

    if (error.status === 403) {
      return "У вас нет доступа к этой странице.";
    }

    if (error.status === 401) {
      return "Необходимо войти в систему.";
    }

    return error.statusText || "Во время открытия страницы произошла ошибка.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Произошла непредвиденная ошибка. Попробуйте обновить страницу.";
}

export const AppErrorPage = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  const message = getErrorMessage(error);

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <p className={styles.code}>Ошибка</p>
        <h1 className={styles.title}>Что-то пошло не так</h1>
        <p className={styles.description}>{message}</p>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => navigate(-1)}
          >
            Назад
          </button>

          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => navigate("/")}
          >
            На главную
          </button>
        </div>
      </div>
    </main>
  );
};