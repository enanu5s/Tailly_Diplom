// src/pages/shop-orders/ui/ShopOrdersPage.tsx

import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { ordersStore } from "@/features/orders/model/ordersStore";
import {
  getShopOrderStatusTone,
  mapShopOrderStatusLabel,
  matchesShopOrdersFilter,
  type ShopOrdersFilterValue,
} from "@/features/shop/service/shopOrdersFilters";
import { useAppNavigate } from "@/shared/lib/navigation/useAppNavigate";

import styles from "./ShopOrdersPage.module.css";

const FILTER_OPTIONS: Array<{
  value: ShopOrdersFilterValue;
  label: string;
}> = [
  {
    value: "all",
    label: "Все",
  },
  {
    value: "active",
    label: "Активные",
  },
  {
    value: "completed",
    label: "Завершённые",
  },
  {
    value: "cancelled",
    label: "Отменённые",
  },
];

function formatItemsLabel(quantity: number): string {
  const mod10 = quantity % 10;
  const mod100 = quantity % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return `${quantity} товар`;
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${quantity} товара`;
  }

  return `${quantity} товаров`;
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("ru-RU").format(value);
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Дата уточняется";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export const ShopOrdersPage = observer(() => {
  const navigate = useAppNavigate();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ShopOrdersFilterValue>("all");

  useEffect(() => {
    if (
      ordersStore.productOrders.length === 0 &&
      !ordersStore.productsLoading
    ) {
      void ordersStore.loadProducts();
    }
  }, []);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return ordersStore.productOrders.filter((order) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        order.number.toLowerCase().includes(normalizedSearch) ||
        order.id.toLowerCase().includes(normalizedSearch);

      const matchesStatus = matchesShopOrdersFilter(order.status, filter);

      return matchesSearch && matchesStatus;
    });
  }, [filter, search, ordersStore.productOrders]);

  const counts = useMemo(() => {
    return {
      all: ordersStore.productOrders.length,
      active: ordersStore.productOrders.filter((order) =>
        matchesShopOrdersFilter(order.status, "active")
      ).length,
      completed: ordersStore.productOrders.filter((order) =>
        matchesShopOrdersFilter(order.status, "completed")
      ).length,
      cancelled: ordersStore.productOrders.filter((order) =>
        matchesShopOrdersFilter(order.status, "cancelled")
      ).length,
    };
  }, [ordersStore.productOrders]);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.breadcrumbs}>
          <Link to="/" className={styles.breadcrumbLink}>
            Главная
          </Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <Link to="/shop" className={styles.breadcrumbLink}>
            Магазин
          </Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>Все заказы</span>
        </div>

        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>Заказы магазина</h1>
            <p className={styles.subtitle}>
              Здесь можно посмотреть все заказы, найти нужный по номеру и
              отфильтровать список по статусу.
            </p>
          </div>

          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate("/shop")}
          >
            Вернуться в магазин
          </button>
        </section>

        <section className={styles.filtersCard}>
          <div className={styles.searchGroup}>
            <label htmlFor="shop-orders-search" className={styles.searchLabel}>
              Поиск по номеру заказа
            </label>
            <input
              id="shop-orders-search"
              className={styles.searchInput}
              type="text"
              placeholder="Например: order-1774288128714"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className={styles.filterTabs}>
            {FILTER_OPTIONS.map((option) => {
              const isActive = option.value === filter;
              const count = counts[option.value];

              return (
                <button
                  key={option.value}
                  type="button"
                  className={styles.filterTab}
                  data-active={isActive ? "true" : "false"}
                  onClick={() => setFilter(option.value)}
                >
                  <span>{option.label}</span>
                  <span className={styles.filterTabCount}>{count}</span>
                </button>
              );
            })}
          </div>
        </section>

        {ordersStore.productsLoading ? (
          <section className={styles.stateCard}>
            <h2 className={styles.stateTitle}>Загружаем заказы</h2>
            <p className={styles.stateText}>
              Подготавливаем список заказов магазина.
            </p>
          </section>
        ) : null}

        {!ordersStore.productsLoading &&
        ordersStore.productOrders.length === 0 ? (
          <section className={styles.stateCard}>
            <h2 className={styles.stateTitle}>Заказов пока нет</h2>
            <p className={styles.stateText}>
              После оформления покупки здесь появится история заказов магазина.
            </p>
            <Link to="/shop" className={styles.stateLink}>
              Перейти в магазин
            </Link>
          </section>
        ) : null}

        {!ordersStore.productsLoading &&
        ordersStore.productOrders.length > 0 &&
        filteredOrders.length === 0 ? (
          <section className={styles.stateCard}>
            <h2 className={styles.stateTitle}>Ничего не найдено</h2>
            <p className={styles.stateText}>
              Попробуй изменить поисковый запрос или выбрать другой фильтр.
            </p>
            <button
              type="button"
              className={styles.resetButton}
              onClick={() => {
                setSearch("");
                setFilter("all");
              }}
            >
              Сбросить фильтры
            </button>
          </section>
        ) : null}

        {!ordersStore.productsLoading && filteredOrders.length > 0 ? (
          <section className={styles.listSection}>
            <div className={styles.listHeader}>
              <div className={styles.listTitle}>
                Найдено заказов: {filteredOrders.length}
              </div>
            </div>

            <div className={styles.ordersGrid}>
              {filteredOrders.map((order) => {
                const itemsCount = order.items.reduce((sum, item) => {
                  return sum + item.quantity;
                }, 0);

                return (
                  <article key={order.id} className={styles.orderCard}>
                    <div className={styles.orderCardTop}>
                      <div className={styles.orderCardMain}>
                        <div className={styles.orderNumber}>{order.number}</div>
                        <div className={styles.orderDate}>
                          Создан: {formatDate(order.createdAt)}
                        </div>
                      </div>

                      <span
                        className={styles.statusBadge}
                        data-tone={getShopOrderStatusTone(order.status)}
                      >
                        {mapShopOrderStatusLabel(order.status)}
                      </span>
                    </div>

                    <div className={styles.orderMeta}>
                      <span>{formatItemsLabel(itemsCount)}</span>
                      <span className={styles.metaDivider}>•</span>
                      <span>{formatPrice(order.price)} ₽</span>
                    </div>

                    <div className={styles.orderActions}>
                      <Link
                        to={`/shop/order/${encodeURIComponent(order.id)}`}
                        className={styles.detailsLink}
                      >
                        Открыть заказ
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
});
