// src/pages/specialist-client/ui/SpecialistClientProfilePage.tsx

import { observer } from "mobx-react-lite";
import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";

import { useAuth } from "@/features/auth/model/useAuth";
import { messagesStore } from "@/features/messages/model/messagesStore";
import { getMessagesViewerFromUser } from "@/features/messages/model/messagesViewer";
import { ordersStore } from "@/features/orders/model/ordersStore";
import { useAppNavigate } from "@/shared/lib/navigation/useAppNavigate";

import styles from "./SpecialistClientProfilePage.module.css";

import type { ReactElement } from "react";

export const SpecialistClientProfilePage = observer((): ReactElement => {
  const { specialistSlug, clientId: clientIdParam } = useParams<{
    specialistSlug: string;
    clientId: string;
  }>();
  const navigate = useAppNavigate();
  const { user } = useAuth();

  const slug = specialistSlug?.trim() ?? "";
  const clientId = clientIdParam?.trim() ?? "";
  const ordersPath = slug ? `/specialists/${slug}/orders` : "/";
  const profilePath = slug ? `/specialists/${slug}` : "/";

  useEffect(() => {
    void ordersStore.loadServices();
  }, []);

  const clientOrders = ordersStore.serviceOrders.filter(
    (order) =>
      order.clientId === clientId && order.specialistSlug === slug,
  );

  const clientName =
    clientOrders[0]?.clientName?.trim() ||
    (clientId ? `Клиент ${clientId}` : "Клиент");

  const pets = useMemo(() => {
    const names = new Set<string>();
    for (const order of clientOrders) {
      if (order.petName.trim()) {
        names.add(order.petName.trim());
      }
    }
    return [...names];
  }, [clientOrders]);

  const handleContact = async (): Promise<void> => {
    if (!user?.id || !clientId) {
      return;
    }

    await messagesStore.startChatWithClient({
      viewer: getMessagesViewerFromUser(user),
      clientId,
      clientName,
    });

    navigate("/messages");
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb}>
          <Link to={ordersPath} className={styles.backLink}>
            ← Заказы клиентов
          </Link>
        </nav>

        <div className={styles.card}>
          <h1 className={styles.title}>{clientName}</h1>
          <p className={styles.subtitle}>
            Краткая карточка по данным заказов. Полный профиль клиента доступен
            в приложении после подключения бэкенда.
          </p>

          <div className={styles.sectionLabel}>Питомцы в заказах</div>
          {pets.length > 0 ? (
            <ul className={styles.petList}>
              {pets.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>
              {ordersStore.servicesLoading
                ? "Загружаем заказы…"
                : "Пока нет заказов с этим клиентом."}
            </p>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primaryButton}
              disabled={!user?.id || !clientId}
              onClick={() => {
                void handleContact();
              }}
            >
              Связаться
            </button>
            <Link to={profilePath} className={styles.backLink}>
              К профилю специалиста
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
});
