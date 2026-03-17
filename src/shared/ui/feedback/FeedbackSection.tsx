//src/shared/ui/feedback/FeedbackSection.tsx

import { useState } from "react";
import styles from "./FeedbackSection.module.css";
import { feedbackApi } from "@/shared/api/feedbackApi";

type Props = {
  phone?: string;
  email?: string;
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
};

export const FeedbackSection = ({
  phone = "+7 (495) 123-45-67",
  email = "support@tailly.ru",
  imageSrc = "/images/feedback-pets.png",
  imageAlt = "Служба поддержки Tailly",
  className,
}: Props) => {
  const [name, setName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!consent) {
      setError("Нужно согласие на обработку персональных данных");
      return;
    }

    setLoading(true);
    try {
      await feedbackApi.send({ name, email: userEmail, message });
      setSuccess(true);
      setName("");
      setUserEmail("");
      setMessage("");
      setConsent(false);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Не удалось отправить вопрос";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={`${styles.section} ${className ?? ""}`}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Левая колонка */}
          <div className={styles.left}>
            <h2 className={styles.title}>
              Всегда на связи — с заботой о вас и ваших питомцах!
            </h2>

            <p className={styles.text}>
              Наша команда готова помочь в любое время — отвечаем на вопросы,
              подбираем идеального петситтера и поддерживаем на каждом этапе.
            </p>

            <div className={styles.contacts}>
              <a
                className={styles.contactLink}
                href={`tel:${phone.replace(/\D/g, "")}`}
              >
                {phone}
              </a>
              <a className={styles.contactLink} href={`mailto:${email}`}>
                {email}
              </a>
            </div>

            <div className={styles.imageWrap} aria-hidden="true">
              {/* если картинки нет — блок просто останется пустым */}
              {imageSrc ? (
                <img
                  className={styles.image}
                  src="/images/Picture_bg_3.png"
                  alt={imageAlt}
                />
              ) : null}
            </div>
          </div>

          {/* Правая колонка */}
          <div className={styles.right}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                Задайте вопрос — Мы с радостью поможем!
              </h3>

              <form className={styles.form} onSubmit={onSubmit}>
                <input
                  className={styles.input}
                  placeholder="Ваше имя"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <input
                  className={styles.input}
                  type="email"
                  placeholder="Email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  required
                />

                <textarea
                  className={styles.textarea}
                  placeholder="Ваш вопрос"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  required
                />
                <label className={styles.consentRow}>
                  <input
                    className={styles.checkbox}
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  <span className={styles.consentText}>
                    Я согласен на обработку персональных данных.{" "}
                    <a href="/docs/personal-data-agreement.pdf" download>
                      Скачать документ
                    </a>
                  </span>
                </label>

                {error && <div className={styles.error}>{error}</div>}
                {success && (
                  <div className={styles.success}>
                    Вопрос отправлен! Мы скоро ответим.
                  </div>
                )}

                <button
                  className={styles.submitButton}
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Отправляем..." : "Отправить вопрос"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
