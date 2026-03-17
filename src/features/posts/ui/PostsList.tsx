//src/features/posts/ui/PostsList.tsx
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { saveScrollPosition } from "@/shared/lib/scroll";

import styles from "./PostsList.module.css";
import { postsStore } from "../model/postsStore";

export const PostsList = observer(() => {
  const navigate = useNavigate();
  useEffect(() => {
    void postsStore.loadList();
  }, []);

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void postsStore.loadList();
  };

  return (
    <div className={styles.root}>
      <form className={styles.controls} onSubmit={onSearchSubmit}>
        <input
          className={styles.search}
          type="text"
          placeholder="Поиск по постам..."
          value={postsStore.list.search}
          onChange={(e) => postsStore.setSearch(e.target.value)}
        />

        <select
          className={styles.select}
          value={postsStore.list.sort}
          onChange={(e) =>
            postsStore.setSort(
              e.target.value as
                | "newest"
                | "oldest"
                | "title_asc"
                | "title_desc",
            )
          }
        >
          <option value="newest">Сначала новые</option>
          <option value="oldest">Сначала старые</option>
          <option value="title_asc">По названию (А–Я)</option>
          <option value="title_desc">По названию (Я–А)</option>
        </select>

        <button
          className={styles.searchBtn}
          type="submit"
          disabled={postsStore.list.loading}
        >
          {postsStore.list.loading ? "Ищем..." : "Найти"}
        </button>
      </form>

      {postsStore.list.error && (
        <div className={styles.error}>{postsStore.list.error}</div>
      )}

      <div className={styles.grid}>
        {postsStore.list.loading && postsStore.list.items.length === 0
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.skeleton} />
            ))
          : postsStore.list.items.map((p) => (
              <button
                key={p.id}
                type="button"
                className={styles.card}
                onClick={() => {
                  saveScrollPosition("/posts"); // сохраняем текущий скролл списка
                  navigate(`/posts/${p.id}`);
                }}
              >
                <div className={styles.cardTitle}>{p.title}</div>
                <div className={styles.cardDate}>
                  {new Date(p.publishedAt).toLocaleDateString("ru-RU", {
                    year: "numeric",
                    month: "long",
                    day: "2-digit",
                  })}
                </div>
                <div className={styles.cardTextWrap}>
                  <p className={styles.cardText}>{p.content}</p>
                  <div className={styles.fade} />
                </div>
              </button>
            ))}
      </div>

      <div className={styles.pagination}>
        <button
          className={styles.pageBtn}
          type="button"
          onClick={() => {
            postsStore.setListPage(postsStore.list.page - 1);
            void postsStore.loadList();
          }}
          disabled={postsStore.list.loading || postsStore.list.page <= 1}
        >
          ← Назад
        </button>

        <div className={styles.pageInfo}>
          Страница {postsStore.list.page} из {postsStore.totalPages}
        </div>

        <button
          className={styles.pageBtn}
          type="button"
          onClick={() => {
            postsStore.setListPage(postsStore.list.page + 1);
            void postsStore.loadList();
          }}
          disabled={
            postsStore.list.loading ||
            postsStore.list.page >= postsStore.totalPages
          }
        >
          Вперёд →
        </button>
      </div>
    </div>
  );
});
